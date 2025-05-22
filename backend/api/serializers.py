from django.conf import settings
import requests
from rest_framework import serializers

from djangorestframework_camel_case.util import camel_to_underscore

from .models import User, RegistrationUserData, AuthorizationUserData, \
    Ingredient, PizzaIngredient, Pizza, DeliveryAddress, PaymentMethod

from datetime import datetime


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


class DeliveryAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddress
        fields = [ "id", "city", "street", "building_number", "apartment_number", "entrance_number", "intercom", "comment", "is_default", "coordinates"]

    def create(self, validated_data):
        validated_data["user"] = self.context["user"]

        response = requests.get("https://geocode-maps.yandex.ru/v1/", params={
            "apikey": settings.YANDEX_MAPS_API_KEY,
            "format": "json",
            "geocode": f"{validated_data["city"]} {validated_data["street"]} {validated_data["building_number"]}".replace(" ", "+"),
            "lang": "ru_RU",
        })

        geo_data = response.json()
        try:
            coords = geo_data["response"]["GeoObjectCollection"]["featureMember"][0]["GeoObject"]["Point"]["pos"]

            validated_data["coordinates"] = coords
        except Exception:
            raise Exception("Такой адрес не найден")
        
        return super().create(validated_data)


class EditDeliveryAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddress
        fields = [ "city", "street", "building_number", "apartment_number", "entrance_number", "intercom", "comment", "coordinates" ]
    
    def validate_city(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Город должен содержать минимум 2 символа.")
        return value

    def validate_street(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Улица должна содержать минимум 2 символа.")
        return value

    def validate_building_number(self, value):
        if not value:
            raise serializers.ValidationError("Поле 'дом' обязательно.")
        if not value.isalnum():
            raise serializers.ValidationError("Дом должен содержать только буквы и/или цифры.")
        return value

    def validate_apartment_number(self, value):
        if value and not value.isalnum():
            raise serializers.ValidationError("Квартира/офис может содержать только буквы и цифры.")
        return value

    def validate_entrance_number(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Подъезд должен быть числом.")
        return value

    def validate_intercom(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Домофон должен быть числом.")
        return value
    
    def update(self, instance, validated_data):
        validated_data["user"] = self.context["user"]

        response = requests.get("https://geocode-maps.yandex.ru/v1/", params={
            "apikey": settings.YANDEX_MAPS_API_KEY,
            "format": "json",
            "geocode": f"{validated_data["city"]} {validated_data["street"]} {validated_data["building_number"]}".replace(" ", "+"),
            "lang": "ru_RU",
        })

        geo_data = response.json()
        try:
            coords = geo_data["response"]["GeoObjectCollection"]["featureMember"][0]["GeoObject"]["Point"]["pos"]

            validated_data["coordinates"] = coords
        except Exception:
            raise Exception("Такой адрес не найден")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class UserDataUpdateSerializer(serializers.ModelSerializer):
    field_name = serializers.ChoiceField(choices=["email", "phoneNumber", "name", "birthdayDate"], write_only=True)

    class Meta:
        model = User
        fields = [ "field_name", "name", "email", "phone_number", "birthday_date" ]

    def validate(self, data):
        field_to_update = data.get("field_name")
        new_value = data.get(camel_to_underscore(field_to_update))

        if new_value is None:
            return serializers.ValidationError({ field_to_update: "Должно быть указано изменяемое поле" })
        
        return data
    
    def update(self, instance: User, validated_data):
        field = validated_data["field_name"]
        value = validated_data[camel_to_underscore(field)]

        setattr(instance, camel_to_underscore(field), value)
        instance.save()

        return instance


class PasswordUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [ "old_password", "new_password" ]

    def validate_old_password(self, value):
        if not self.instance.check_password(value):
            raise serializers.ValidationError("Неправильный пароль.")
        
        return value

    def validate_new_password(self, value):
        if len(value) != 128:
            raise serializers.ValidationError("Неправильные параметры запроса.")
        
        return value

    def update(self, instance: User, validated_data):
        new_password = validated_data["new_password"]

        instance.set_password(new_password)
        instance.save()

        return instance


class PaymentMethodSerializer(serializers.ModelSerializer):
    expiry_date = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = PaymentMethod
        fields = ["id", "user", "card_holder", "card_last_4_numbers", "expiry_month", "expiry_year", "added_at", "expiry_date"]
        read_only_fields = ["id", "user", "added_at", "expiry_month", "expiry_year"]

    def validate_expiry_date(self, value: str):
        try:
            month, year = map(int, value.split("/"))
            if not (1 <= month <= 12):
                raise serializers.ValidationError("Неверная срок действия карты.")
            
            now = datetime.now()
            if year < (now.year % 100) or (year == (now.year % 100) and month < now.month):
                raise serializers.ValidationError("Истёк срок действия карты.")

            return {"month": month, "year": year}
        except ValueError:
            raise serializers.ValidationError("Срок действия карты должен быть в формате MM/YY.")
        
    def create(self, validated_data):
        expiry = validated_data.pop("expiry_date")

        validated_data["expiry_month"] = expiry["month"]
        validated_data["expiry_year"] = expiry["year"]
        validated_data["user"] = self.context["user"]

        return super().create(validated_data)