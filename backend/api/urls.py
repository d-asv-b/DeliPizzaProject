from django.urls import path

from .views import user_sign_up_view, user_sign_in_view, \
    get_profile_info, refresh_access_token, PizzaListViewSet

urlpatterns = [
    path("pizzas/get_list/", PizzaListViewSet.as_view()),

    path("account/sign_up", user_sign_up_view),
    path("account/sign_in", user_sign_in_view),
    path("account/refresh_token", refresh_access_token),

    path("account/profile", get_profile_info),
]