from django.urls import path

from .views import PizzaListViewSet

urlpatterns = [
    path("pizzas/get_list/", PizzaListViewSet.as_view())
]