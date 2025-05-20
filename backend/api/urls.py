from django.urls import path
from . import views

from .views import user_sign_up_view, user_sign_in_view, \
    get_profile_info, refresh_access_token, get_delivery_address, \
    update_user_data, update_user_password, \
    PizzaListViewSet

urlpatterns = [
    path("pizzas/get_list/", PizzaListViewSet.as_view()),

    path("account/sign_up", user_sign_up_view),
    path("account/sign_in", user_sign_in_view),
    path("account/refresh_token", refresh_access_token),

    path("account/profile", get_profile_info),
    path("account/update_data", update_user_data),
    path("account/update_password", update_user_password),

    path("addresses/get_list", get_delivery_address),
    path("orders/history", views.get_orders_history, name="orders-history"),
    # path("addresses/add_address", ),
    # path("addresses/edit_address", ),
    # path("addresses/delete_address", ),
]