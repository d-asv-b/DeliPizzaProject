from rest_framework import serializers

from djangorestframework_camel_case.util import camel_to_underscore

from .models import User, RegistrationUserData, AuthorizationUserData, Ingredient, PizzaIngredient, Pizza, DeliveryAddress, Order

from datetime import timedelta

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
    

class DeliveryAdressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddress
        fields = ["city", "street", "buildingNumber", "appartmentNumber", "isDefault", "coordinates"]


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

class PasswordUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

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

class OrderHistorySerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    amount = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = ["id", "status", "is_paid", "is_completed", "creation_date", "amount"]

    def get_status(self, obj: Order) -> str:
        if obj.is_completed:
            return "completed"
        if obj.is_paid:
            return "paid"
        return "created"

    def get_amount(self, obj: Order) -> int:
        total = 0
        for item in obj.orderitem_set.all():
            total += item.pizza.base_price
            for add in item.orderitemingredient_set.all():
                total += add.ingredient.price
        return total