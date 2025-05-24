import uuid
import os

from django.db import models
from django.core.validators import validate_email
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone

from .utils import create_hashed_password, check_password


class UserManager(BaseUserManager):
    def create_user(
        self,
        email: str,
        password: str,
        **extra_fields
    ):
        if not email:
            raise ValueError("Email field is missing!")
        
        extra_fields.setdefault("registration_date", timezone.now())
        email = self.normalize_email(email)
        
        password_salt = os.urandom(16)
        final_pwd_hash = create_hashed_password(password, password_salt)

        user = self.model(email=email, **extra_fields)
        user.password = final_pwd_hash

        user.save()

        return user
    
    def create_superuser(
        self,
        email: str,
        password: str,
        **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        return self.create_user(
            email,
            password,
            **extra_fields
        )


class User(AbstractBaseUser, PermissionsMixin):
    """
    Поля класса
        id
        name                имя пользователя
        email               эл. почта пользователя
        phone_number        номер телефона пользователя
        password            хэш пароля (argon2), содержит в себе соль
        birthday_date       дата дня рождения пользователя
        registration_date   дата регистрации
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=16)
    password = models.CharField(max_length=128)
    birthday_date = models.DateField(default=None, blank=True, null=True)
    registration_date = models.DateField()

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def check_password(
        self,
        password: str      
    ) -> bool:
        return check_password(password, self.password)


class RegistrationUserData(models.Model):
    class Meta:
        managed = False
        
    name = models.CharField(max_length=20)
    email = models.EmailField(validators=[validate_email])
    phone_number = models.CharField(max_length=16)
    pwd_hash = models.CharField(max_length=128)


class AuthorizationUserData(models.Model):
    class Meta:
            managed = False
    
    email = models.EmailField(validators=[validate_email])
    pwd_hash = models.CharField(max_length=128)


class Ingredient(models.Model):
    """
    Поля класса
        name                название ингредиента
        icon                имя файла иконки ингредиента
        price               добавочная цена ингредиента
    """
    name = models.CharField(max_length=20)
    icon_url = models.CharField(max_length=128)
    price = models.IntegerField()


class Pizza(models.Model):
    """
    Поля класса
        name                название пиццы
        description         описание пиццы
        base_price          базовая цена пиццы (без добавочных ингредиентов)
    """
    name = models.CharField(max_length=20)
    icon_url = models.CharField(max_length=128)
    description = models.CharField(max_length=500)
    base_price = models.IntegerField()
    ingredients = models.ManyToManyField(Ingredient, through="PizzaIngredient")


class PizzaIngredient(models.Model):
    """
    Поля класса
        pizza               к какой пицце относится
        ingredient          какой ингредиент
        is_additional       является ли дополнительным ингредиентом
    """
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    is_additional = models.BooleanField()


class Tag(models.Model):
    value = models.CharField(max_length=20)


class PizzaTag(models.Model):
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)


class DeliveryAddress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    city = models.CharField()
    street = models.CharField()
    building_number = models.CharField()
    apartment_number = models.CharField(default="")
    entrance_number = models.CharField(default="")
    intercom = models.CharField(default="")
    comment = models.CharField(max_length=128, default="")
    is_default = models.BooleanField()
    coordinates = models.CharField(default="")


class Restaurant(models.Model):
    """
        name                название пиццерии
        coordinates         координаты пиццерии
    """
    name = models.CharField()
    coordinates = models.CharField()


class Order(models.Model):
    """
    Поля класса
        id
        customer            пользователь, создавший заказ
        status              статус заказа
        creation_date       дата создания заказа
        total_price         полная стоимость заказа
        delivery_expected   дата и время доставки, выбранные пользователем
        completition_date   дата завершения/отмены заказа
    """
    class Status(models.TextChoices):
        CREATED = "created"
        PAID = "paid"
        PENDING = "penging"
        COOKING = "cooking"
        COOKED = "cooked"
        DELIVERING = "delivering"
        COMPLETED = "completed"
        CANCELLED = "cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED
    )
    total_price = models.IntegerField(default=0)
    address = models.ForeignKey(DeliveryAddress, on_delete=models.PROTECT, blank=True, null=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.PROTECT, blank=True, null=True, default=1)
    creation_date = models.DateTimeField(auto_now_add=True)
    delivery_expected = models.DateTimeField(default=timezone.now())
    completition_date = models.DateTimeField(null=True)

    @property
    def can_be_cancelled(self) -> bool:
        return self.status == "created" or self.status == "paid"


class OrderItem(models.Model):
    """
    Поля класса
        order               к какому заказу относится
        pizza               какая пицца
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    pizza = models.ForeignKey(Pizza, on_delete=models.PROTECT)
    count = models.IntegerField(default=1)


class OrderItemIngredient(models.Model):
    """
    Поля класса
        order_item          к какой заказанной пицце относится
        ingredient          какой ингредиент
    """
    class Status(models.TextChoices):
        ADD = "add"
        REMOVE = "remove"

    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)
    state = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ADD
    )


class PaymentMethod(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    card_holder = models.CharField(max_length=100)
    card_last_4_numbers = models.CharField(max_length=4)
    expiry_month = models.IntegerField()
    expiry_year = models.IntegerField()
    added_at = models.DateField(auto_now_add=True)