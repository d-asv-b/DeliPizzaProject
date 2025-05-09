from rest_framework import serializers

from .models import User, RegistrationUserData, AuthorizationUserData, Ingredient, PizzaIngredient, Pizza


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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [ "id", "name", "email", "phone_number", "pwd_hash", "pwd_salt", "birthday_date", "registration_date" ]


class RegistrationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationUserData
        fields = [ "name", "email", "phone_number", "pwd_hash" ]


class AuthorizationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizationUserData
        fields = [ "email", "pwd_hash" ]


class ProfileDataSerializer(serializers.ModelSerializer):
    birthday_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [ "name", "email", "phone_number", "birthday_date", "registration_date" ]

    def get_birthday_date(self, user_obj):
        return user_obj.birthday_date if user_obj.birthday_date else ""