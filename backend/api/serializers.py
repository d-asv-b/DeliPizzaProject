from rest_framework import serializers

from .models import Ingredient, PizzaIngredient, Pizza


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ["id", "name", "icon_url", "price"]


class PizzaIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer()

    class Meta:
        model = PizzaIngredient
        fields = ["ingredient", "is_additional"]


class PizzaSerializer(serializers.ModelSerializer):
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Pizza
        fields = ["id", "name", "icon_url", "description", "base_price", "ingredients"]

    def get_ingredients(self, obj):
        pizza_ingredients = PizzaIngredient.objects.filter(pizza=obj)
        return PizzaIngredientSerializer(pizza_ingredients, many=True).data
