from django.urls import path
from .views import (
    CreatePaymentOrderView, VerifyPaymentView, PaymentHistoryView,
    PaymentInvoiceView, PlannerEarningsView, CreateDisputeView, MyDisputesView,
)

urlpatterns = [
    path("", PaymentHistoryView.as_view(), name="payment-history"),
    path("create-order/", CreatePaymentOrderView.as_view(), name="create-payment-order"),
    path("verify/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("earnings/", PlannerEarningsView.as_view(), name="planner-earnings"),
    path("disputes/", MyDisputesView.as_view(), name="my-disputes"),
    path("<int:pk>/invoice/", PaymentInvoiceView.as_view(), name="payment-invoice"),
    path("<int:pk>/dispute/", CreateDisputeView.as_view(), name="payment-dispute"),
]
