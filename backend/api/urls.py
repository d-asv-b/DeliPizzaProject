from django.urls import path

from . import views as views

urlpatterns = [
    path("pizzas/get_list/", views.PizzaListViewSet.as_view()),

    path("account/sign_up", views.user_sign_up_view),
    path("account/sign_in", views.user_sign_in_view),
    path("account/refresh_token", views.refresh_access_token),

    path("account/profile", views.get_profile_info),
    path("account/update_data", views.update_user_data),
    path("account/update_password", views.update_user_password),

    path("addresses/get_list", views.get_delivery_address),
    path("addresses/add_address", views.add_delivery_address),
    path("addresses/edit_address", views.edit_delivery_address),
    path("addresses/delete_address", views.remove_delivery_address),
    path("addresses/resolve_address", views.geocode_address),

    path("payments/get_methods", views.get_payment_methods),
    path("payments/add_method", views.add_payment_method),
    path("payments/remove_method", views.remove_payment_method)
]