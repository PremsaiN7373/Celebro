import razorpay
from decimal import Decimal
from django.conf import settings
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.bookings.models import Booking
from apps.notifications.services import notify
from .models import Payment, PaymentDispute, PLATFORM_COMMISSION_RATE
from .serializers import PaymentSerializer, PaymentDisputeSerializer


def _razorpay_client():
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreatePaymentOrderView(APIView):
    """
    POST /api/v1/payments/create-order/
    Body: { "booking": <id>, "amount": <decimal> }
    Only the event's owning customer can pay for their own booking.
    Creates a Razorpay order and a local Payment record in "created" state.
    Requires RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to be set in .env —
    without real keys this call will fail, which is expected until you
    add your own Razorpay test credentials.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking")
        amount = request.data.get("amount")

        try:
            booking = Booking.objects.get(id=booking_id, event__customer=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=404)

        if not amount:
            return Response({"detail": "Amount is required."}, status=400)

        try:
            client = _razorpay_client()
            order = client.order.create({
                "amount": int(float(amount) * 100),  # Razorpay expects paise
                "currency": "INR",
                "payment_capture": 1,
            })
        except Exception as e:
            return Response({"detail": f"Could not create Razorpay order: {e}"}, status=502)

        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            razorpay_order_id=order["id"],
            status=Payment.Status.CREATED,
        )

        return Response({
            "payment_id": payment.id,
            "razorpay_order_id": order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": order["amount"],
            "currency": order["currency"],
        }, status=201)


class VerifyPaymentView(APIView):
    """
    POST /api/v1/payments/verify/
    Body: { "razorpay_order_id", "razorpay_payment_id", "razorpay_signature" }
    Verifies the signature Razorpay's checkout returns, and if valid,
    marks the Payment as paid and updates the booking's advance_paid.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id")
        payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")

        try:
            payment = Payment.objects.get(
                razorpay_order_id=order_id, booking__event__customer=request.user
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=404)

        try:
            client = _razorpay_client()
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
        except Exception:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({"detail": "Signature verification failed."}, status=400)

        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = Payment.Status.PAID
        payment.platform_commission_amount = (payment.amount * PLATFORM_COMMISSION_RATE).quantize(
            Decimal("0.01")
        )
        payment.save()

        booking = payment.booking
        booking.advance_paid = (booking.advance_paid or 0) + payment.amount
        booking.save()

        notify(
            booking.planner.user,
            "payment_received",
            f"Advance payment of ₹{payment.amount} received for {booking.event.name}",
            link="/planner-bookings",
        )

        return Response(PaymentSerializer(payment).data)


class PaymentHistoryView(APIView):
    """GET /api/v1/payments/?booking=<id> — payment history for a booking."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Payment.objects.filter(
            Q(booking__event__customer=user) | Q(booking__planner__user=user)
        )
        booking_id = request.query_params.get("booking")
        if booking_id:
            qs = qs.filter(booking_id=booking_id)
        return Response(PaymentSerializer(qs, many=True).data)


class PaymentInvoiceView(APIView):
    """
    GET /api/v1/payments/<id>/invoice/ — a downloadable PDF invoice for
    one payment. Only the two parties on the booking (customer or planner)
    can download it.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from django.http import HttpResponse
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        import io

        try:
            payment = Payment.objects.select_related(
                "booking__event", "booking__planner", "booking__event__customer"
            ).get(
                pk=pk
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=404)

        booking = payment.booking
        is_customer = booking.event.customer == request.user
        is_planner = booking.planner.user == request.user
        if not (is_customer or is_planner):
            return Response({"detail": "Not your invoice."}, status=403)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        y = height - 60
        p.setFont("Helvetica-Bold", 20)
        p.drawString(50, y, "Celebro")
        p.setFont("Helvetica", 10)
        p.drawString(50, y - 16, "Celebration Planning & Event Marketplace")

        y -= 60
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y, f"Invoice #{payment.id}")

        y -= 30
        p.setFont("Helvetica", 11)
        rows = [
            ("Event", booking.event.name),
            ("Planner", booking.planner.business_name),
            ("Customer", booking.event.customer.username),
            ("Payment date", payment.updated_at.strftime("%d %b %Y")),
            ("Status", payment.get_status_display()),
        ]
        for label, value in rows:
            p.drawString(50, y, f"{label}:")
            p.drawString(180, y, str(value))
            y -= 20

        y -= 20
        p.line(50, y, width - 50, y)
        y -= 25

        p.setFont("Helvetica-Bold", 11)
        p.drawString(50, y, "Amount paid")
        p.drawString(width - 150, y, f"Rs. {payment.amount}")
        y -= 20

        p.setFont("Helvetica", 9)
        p.setFillGray(0.4)
        p.drawString(50, y, "Includes platform commission")
        p.drawString(width - 150, y, f"Rs. {payment.platform_commission_amount}")
        p.setFillGray(0)

        y -= 40
        p.setFont("Helvetica-Oblique", 9)
        p.drawString(50, y, "Thank you for using Celebro.")

        p.showPage()
        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="celebro-invoice-{payment.id}.pdf"'
        return response


class PlannerEarningsView(APIView):
    """
    GET /api/v1/payments/earnings/ — the logged-in planner's earnings,
    grouped by month, for a simple revenue-over-time chart.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models.functions import TruncMonth
        from django.db.models import Sum, Count

        if not hasattr(request.user, "planner_profile"):
            return Response({"detail": "Not a planner."}, status=403)

        qs = (
            Payment.objects.filter(
                booking__planner=request.user.planner_profile, status=Payment.Status.PAID
            )
            .annotate(month=TruncMonth("updated_at"))
            .values("month")
            .annotate(
                total=Sum("amount"),
                commission=Sum("platform_commission_amount"),
                payment_count=Count("id"),
            )
            .order_by("month")
        )

        results = [
            {
                "month": row["month"].strftime("%Y-%m"),
                "total": str(row["total"]),
                "commission": str(row["commission"]),
                "net": str(row["total"] - row["commission"]),
                "payment_count": row["payment_count"],
            }
            for row in qs
        ]

        total_earned = sum(float(r["total"]) for r in results)
        total_commission = sum(float(r["commission"]) for r in results)

        return Response({
            "monthly": results,
            "total_earned": str(total_earned),
            "total_commission": str(total_commission),
            "total_net": str(total_earned - total_commission),
        })


class CreateDisputeView(APIView):
    """
    POST /api/v1/payments/<id>/dispute/
    Body: { "reason": "..." }
    Only the paying customer can report an issue on their own payment.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            payment = Payment.objects.select_related("booking__event").get(pk=pk)
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=404)

        if payment.booking.event.customer_id != request.user.id:
            return Response({"detail": "Not your payment."}, status=403)

        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"detail": "Please describe the issue."}, status=400)

        dispute = PaymentDispute.objects.create(payment=payment, reason=reason)
        return Response(PaymentDisputeSerializer(dispute).data, status=201)


class MyDisputesView(APIView):
    """GET /api/v1/payments/disputes/ — the current user's own disputes (customer view)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        disputes = PaymentDispute.objects.filter(
            payment__booking__event__customer=request.user
        ).select_related("payment__booking__event", "payment__booking__planner")
        return Response(PaymentDisputeSerializer(disputes, many=True).data)
