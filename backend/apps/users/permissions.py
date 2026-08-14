from rest_framework.permissions import BasePermission


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "customer")


class IsPlanner(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "planner")


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == "admin")
