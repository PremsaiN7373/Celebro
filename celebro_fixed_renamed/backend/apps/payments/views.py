import razorpay
from django.conf import settings
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.bookings.models import Booking
from apps.notifications.services import notify
from .models import Payment
from .serializers import PaymentSerializer


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
