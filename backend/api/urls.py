from django.urls import path

from . import views

urlpatterns = [
    path("pizzas/get_list/", views.PizzaListViewSet.as_view()),

    path("account/sign_up", views.user_sign_up_view),
    path("account/sign_in", views.user_sign_in_view),
    path("account/refresh_token", views.refresh_access_token),

    path("account/profile", views.get_profile_info),
    path("account/update_data", views.update_user_data),
    path("account/update_password", views.update_user_password),

    path("addresses/get_list", views.get_delivery_address),
    # path("addresses/add_address", ),
    # path("addresses/edit_address", ),
    # path("addresses/delete_address", ),

    path("orders/<str:order_id>/status", views.get_order_status, name="order-status"),
]