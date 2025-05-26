from django.urls import path
from django.contrib import admin

from . import views as views

urlpatterns = [
    path("content_control/admin_page", admin.site.urls),

    path("pizzas/get_list/", views.PizzaListViewSet.as_view()),

    path("tags/get_list", views.get_tags),
    path("tags/get_favourites", views.get_favourite_tags),
    path("tags/set_fav_tags",views.set_user_preferences),

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
    path("payments/remove_method", views.remove_payment_method),
  
    path("orders/history", views.get_orders_history, name="orders-history"),
    path("orders/cancel_order",views.cancel_order,name="order-cancel"),
    path("orders/get_order_status", views.get_order_status),
    path("orders/place_order", views.place_new_order)
]