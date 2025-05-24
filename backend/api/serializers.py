from django.conf import settings
import requests
from django.db import transaction
from rest_framework import serializers

from djangorestframework_camel_case.util import camel_to_underscore

from .utils import parse_custom_delivery_time

from .models import OrderItem, OrderItemIngredient, User, RegistrationUserData, AuthorizationUserData, \
    Ingredient, PizzaIngredient, Pizza, DeliveryAddress, PaymentMethod, Order

from datetime import datetime


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ["id", "name", "icon_url", "price"]


class PizzaIngredientSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="ingredient.id")
    name = serializers.CharField(source="ingredient.name")
    icon_url = serializers.CharField(source="ingredient.icon_url")
    price = serializers.IntegerField(source="ingredient.price")

    class Meta:
        model = PizzaIngredient
        fields = ["id", "name", "icon_url", "price"]


class PizzaSerializer(serializers.ModelSerializer):
    main_ingredients = serializers.SerializerMethodField()
    additional_ingredients = serializers.SerializerMethodField()

    class Meta:
        model = Pizza
        fields = ["id", "name", "icon_url", "description", "base_price", "main_ingredients", "additional_ingredients"]

    def get_main_ingredients(self, obj):
        pizza_ingredients = PizzaIngredient.objects.filter(pizza=obj, is_additional=False)
        return PizzaIngredientSerializer(pizza_ingredients, many=True).data

    def get_additional_ingredients(self, obj):
        pizza_ingredients = PizzaIngredient.objects.filter(pizza=obj, is_additional=True)
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
            "geocode": f'{validated_data["city"]} {validated_data["street"]} {validated_data["building_number"]}'.replace(" ", "+"),
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
            "geocode": f'{validated_data["city"]} {validated_data["street"]} {validated_data["building_number"]}'.replace(" ", "+"),
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
                raise serializers.ValidationError("Неверный срок действия карты.")

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


class OrderItemIngredientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="ingredient.name")

    class Meta:
        model = OrderItemIngredient
        fields = [ "name" ]


class OrderItemSerializer(serializers.ModelSerializer):
    add = serializers.SerializerMethodField()
    remove = serializers.SerializerMethodField()
    name = serializers.CharField(source="pizza.name")

    class Meta:
        model = OrderItem
        fields = [ "name", "add", "remove" ]
    
    def get_add(self, obj: OrderItem):
        add_ingredients = OrderItemIngredient.objects.filter(order_item=obj, state="add")
        return OrderItemIngredientSerializer(add_ingredients, many=True).data
    
    def get_remove(self, obj: OrderItem):
        remove_ingredients = OrderItemIngredient.objects.filter(order_item=obj, state="remove")
        return OrderItemIngredientSerializer(remove_ingredients, many=True).data


class OrderHistorySerializer(serializers.ModelSerializer):
    amount = serializers.SerializerMethodField()
    order_positions = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = ["id", "status", "order_positions", "creation_date", "amount", "completition_date"]

    def get_amount(self, obj: Order) -> int:
        total = 0
        for item in obj.orderitem_set.all():
            total += item.pizza.base_price
            for add in item.orderitemingredient_set.all():
                total += add.ingredient.price
        return total
    
    def get_order_positions(self, obj: Order):
        order_positions = OrderItem.objects.filter(order=obj)
        return OrderItemSerializer(order_positions, many=True).data


class OrderStatusSerializer(serializers.ModelSerializer):
    delivery_coordinates = serializers.CharField(source="address.coordinates")
    restaurant_coordinates = serializers.CharField(source="restaurant.coordinates")

    class Meta:
        model = Order
        fields = [ "id", "delivery_coordinates", "restaurant_coordinates", "status", "delivery_expected", "creation_date", "completition_date" ]


class IngredientModificationSerializer(serializers.Serializer):
    add = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Ingredient.objects.all()
        ),
        required=False
    )
    remove = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(
            queryset=Ingredient.objects.all()
        ),
        required=False,
    )

    def validate(self, data):
        pizza = self.context.get("pizza")
        if not pizza:
            raise serializers.ValidationError("Пицца не указана в контексте.")

        pizza_ingredients = PizzaIngredient.objects.filter(pizza=pizza)

        add_ingredients_ids = set(ingr.ingredient_id for ingr in pizza_ingredients if ingr.is_additional)
        main_ingredients_ids = set(ingr.ingredient_id for ingr in pizza_ingredients if not ingr.is_additional)

        for ingredient in data.get("add", []):
            if ingredient.id not in add_ingredients_ids:
                raise serializers.ValidationError(
                    f"Ингредиент {ingredient.id} нельзя добавить к этой пицце."
                )

        for ingredient in data.get('remove', []):
            if ingredient.id not in main_ingredients_ids:
                raise serializers.ValidationError(
                    f"Ингредиент {ingredient.id} нельзя удалить из этой пиццы."
                )

        return data


class CartItemSerializer(serializers.Serializer):
    pizza_id = serializers.PrimaryKeyRelatedField(
        queryset=Pizza.objects.all(),
        allow_null=False,
    )
    count = serializers.IntegerField(
        min_value=1,
        required=True
    )

    def to_internal_value(self, data):
        internal = super().to_internal_value(data)

        self._pizza = internal['pizza_id']
        self._raw_ingredients_data = data.get("ingredients", {})

        return {
            **internal,
            "ingredients": self._raw_ingredients_data
        }
    
    def validate(self, data):
        raw_ingredients_data = data["ingredients"]

        serializer = IngredientModificationSerializer(
            context={"pizza": self._pizza}
        )
        validated_ingredients = serializer.run_validation(raw_ingredients_data)

        data["ingredients"] = validated_ingredients
        return data


class PlaceOrderSerializer(serializers.Serializer):
    cart = CartItemSerializer(
        many=True,
        required=True,
        allow_empty=False
    )
    delivery_address_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryAddress.objects.all(),
        required=True,
        allow_null=False,
    )
    payment_method_id = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(),
        required=True,
        allow_null=False,
    )
    delivery_time = serializers.CharField(
        max_length=100,
        required=True
    )

    def validate_cart(self, value):
        if not value:
            raise serializers.ValidationError("Корзина не может быть пустой.")

        return value
    
    def create(self, validated_data):
        user = self.context.get("user")

        delivery_address = validated_data["delivery_address_id"]
        payment_method = validated_data["payment_method_id"]

        if delivery_address.user != user:
            raise serializers.ValidationError({ "deliveryAddressId": "Указан неверный адрес доставки." })
        if payment_method.user != user:
            raise serializers.ValidationError({ "paymentMethodId": "Указан неверный метод оплаты." })

        delivery_time_str = validated_data["delivery_time"]
        try:
            parsed_delivery_datetime = parse_custom_delivery_time(delivery_time_str)
        except serializers.ValidationError as e:
            raise serializers.ValidationError({ "delivery_time": e.detail })

        cart_data = validated_data["cart"]

        with transaction.atomic():
            order = Order.objects.create(
                customer=user,
                # status=Order.Status.CREATED,
                status=Order.Status.PAID, 
                address=delivery_address,
                delivery_expected=parsed_delivery_datetime,
            )

            for cart_item_data in cart_data:
                pizza_obj = cart_item_data["pizza_id"] 
                count = cart_item_data["count"]
                ingredients_modifications_data = cart_item_data["ingredients"]
                
                add_ingredients = ingredients_modifications_data.get("add", [])
                main_ingredients = ingredients_modifications_data.get("remove", [])

                order_item = OrderItem.objects.create(
                    order=order,
                    pizza=pizza_obj,
                    count=count
                )
                
                if add_ingredients:
                    to_create = [
                        OrderItemIngredient(
                            order_item=order_item,
                            ingredient=ing,
                            state="add"
                        ) for ing in add_ingredients
                    ]
                    OrderItemIngredient.objects.bulk_create(to_create)

                if main_ingredients:
                    to_create = [
                        OrderItemIngredient(
                            order_item=order_item,
                            ingredient=ing,
                            state="remove"
                        ) for ing in main_ingredients
                    ]
                    OrderItemIngredient.objects.bulk_create(to_create)
            
            return order