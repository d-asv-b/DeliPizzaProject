from datetime import date
import uuid
from django.db import models
from django.core.validators import validate_email
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager


class User(AbstractBaseUser):
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

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []


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


class Order(models.Model):
    """
    Поля класса
        id
        customer            пользователь, создавший заказ
        is_paid             оплачен ли заказ
        is_completed        доставлен ли заказ
        creation_date       дата создания заказа
    """
    id = models.CharField(max_length=22, primary_key=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    is_paid = models.BooleanField()
    is_completed = models.BooleanField()
    creation_date = models.DateField()


class OrderItem(models.Model):
    """
    Поля класса
        order               к какому заказу относится
        pizza               какая пицца
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    pizza = models.ForeignKey(Pizza, on_delete=models.PROTECT)


class OrderItemIngredient(models.Model):
    """
    Поля класса
        order_item          к какой заказанной пицце относится
        ingredient          какой ингредиент
    """
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)
