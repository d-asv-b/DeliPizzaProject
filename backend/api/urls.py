from django.urls import path

from .views import userSignUpView, userSignInView, PizzaListViewSet

urlpatterns = [
    path("pizzas/get_list/", PizzaListViewSet.as_view()),

    path("account/signUp", userSignUpView),
    path("account/signIn", userSignInView),
]