from django.urls import path
from .views import CreatePaymentOrderView, VerifyPaymentView, PaymentHistoryView

urlpatterns = [
    path("", PaymentHistoryView.as_view(), name="payment-history"),
    path("create-order/", CreatePaymentOrderView.as_view(), name="create-payment-order"),
    path("verify/", VerifyPaymentView.as_view(), name="verify-payment"),
]
