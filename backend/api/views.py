from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from backend import settings

from .models import PaymentMethod, RegistrationUserData, AuthorizationUserData, Pizza, DeliveryAddress
from .serializers import PaymentMethodSerializer, ProfileDataSerializer, RegistrationDataSerializer, \
    AuthorizationDataSerializer, PizzaSerializer, DeliveryAddressSerializer, EditDeliveryAddressSerializer, \
    UserDataUpdateSerializer, PasswordUpdateSerializer
from .decorators import access_token_required

import requests

User = get_user_model()


class PizzaListViewSet(APIView):
    def get(self, request: Request):
        try:
            start = int(request.query_params.get("start", 0))
            amount = int(request.query_params.get("amount", 24))

            if start < 0 or amount < 0 or start > 1000 or amount > 1000:
                raise ValueError
        except:
            return Response(
                {
                    "error": "Query params must be positive integers and be less than 1000"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = Pizza.objects.all()[start:amount]
            
        serializer = PizzaSerializer(instance=queryset, many=True)
        return Response(
            {
                "pizza_data": serializer.data
            },
            status=status.HTTP_200_OK
        )

@api_view([ "POST" ])
def user_sign_up_view(request: Request):
    serializer = RegistrationDataSerializer(data=request.data)

    if not serializer.is_valid():
        if len(serializer.errors):
            if "email" in serializer.errors:
                return Response(
                    data={
                        "error": "Недействительная эл. почта"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            data={
                "error": "Неправильные параметры запроса."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    reg_data = RegistrationUserData(**serializer.data)

    # Проверяем, что все поля правильны
    if (len(reg_data.name) == 0 or not reg_data.name.isalpha()) or \
        (len(reg_data.phone_number) == 0) or \
        (len(reg_data.pwd_hash) != 128):
        return Response(
            data={
                "error": "Неправильные параметры запроса."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Проверяем, есть ли пользователь с такой же почтой
    if User.objects.filter(email=reg_data.email).exists():
        return Response(
            data={
                "error": "Пользователь с такой почтой уже зарегистрирован!"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    new_user_data = User.objects.create_user(
        name=reg_data.name,
        email=reg_data.email,
        phone_number=reg_data.phone_number,
        password=reg_data.pwd_hash,
        registration_date=timezone.now().date()
    )

    # Создаем JWT токены
    refresh_token = RefreshToken.for_user(user=new_user_data)
    access_token = refresh_token.access_token

    # Возвращаем публичную информацию и access-токен
    response = Response(
        status=status.HTTP_201_CREATED,
        data={
            "user_data": ProfileDataSerializer(new_user_data).data,
            "access_token": str(access_token)
        }
    )

    response.set_cookie(
        key="REFRESH_TOKEN",
        value=str(refresh_token),
        expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        httponly=True,
        path="/",
        samesite="Strict"
    )

    return response

@api_view([ "POST" ])
def user_sign_in_view(request: Request):
    serializer = AuthorizationDataSerializer(data=request.data)
    if not serializer.is_valid():
        if len(serializer.errors):
            if "email" in serializer.errors:
                return Response(
                    data={
                        "error": "Недействительная эл. почта"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            data={
                "error": "Неправильные параметры запроса."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    auth_data = AuthorizationUserData(**serializer.data)

    if len(auth_data.pwd_hash) != 128:
        return Response(
            data={
                "error": "Неправильные параметры запроса."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Проверяем, существует ли пользователь с таким email
    try:
        user_data = User.objects.get(email=auth_data.email)
    except ObjectDoesNotExist:
        return Response(
            data={
                "error": "Неправильные почта или пароль."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as err:
        print(err)
        return Response(
            data={
                "error": "Ошибка на сервере, попробуйте позже."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Проверяем, совпадают ли пароли
    if not user_data.check_password(auth_data.pwd_hash):
        return Response(
            data={
                "error": "Неправильные почта или пароль."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Создаем JWT токены
    refresh_token = RefreshToken.for_user(user=user_data)
    access_token = refresh_token.access_token

    # Возвращаем публичную информацию и access-токен
    response = Response(
        status=status.HTTP_202_ACCEPTED,
        data={
            "user_data": ProfileDataSerializer(user_data).data,
            "access_token": str(access_token)
        }
    )

    response.set_cookie(
        key="REFRESH_TOKEN",
        value=str(refresh_token),
        expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        httponly=True,
        path="/",
        samesite="Strict"
    )

    return response

@api_view([ "POST" ])
def refresh_access_token(request: Request):
    refresh_token_cookie = request.COOKIES.get("REFRESH_TOKEN", "")

    if len(refresh_token_cookie) == 0:
        return Response(
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Проверяем, что refresh-токен действителен
    try:
        refresh_token = RefreshToken(refresh_token_cookie)
    except Exception as err:
        return Response(
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Проверяем, существует ли пользователь
    try:
        user_data = User.objects.get(id=refresh_token.get("user_id"))
    except ObjectDoesNotExist:
        return Response(
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as err:
        print(err)
        return Response(
            data={
                "error": "Ошибка на сервере, попробуйте позже."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # Проверяем, что refresh-токен не в черном списке. Иначе - аннулируем все refresh-токены для пользователя
    try:
        refresh_token.check_blacklist()
    except: 
        user_refresh_tokens = OutstandingToken.objects.filter(user_id=user_data)
        for token in user_refresh_tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        return Response(
            status=status.HTTP_401_UNAUTHORIZED
        )
    

    # Добавляем старый refresh-токен в черный список и создаем новую пару токенов
    refresh_token.blacklist()
    new_refresh_token = RefreshToken.for_user(user_data)
    access_token = new_refresh_token.access_token

    response = Response(
        status=status.HTTP_201_CREATED,
        data={
            "access_token": str(access_token)
        }
    )

    response.set_cookie(
        key="REFRESH_TOKEN",
        value=str(new_refresh_token),
        expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        httponly=True,
        path="/",
        samesite="Strict"
    )

    return response

@api_view([ "GET" ])
@access_token_required
def get_profile_info(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    user_data = ProfileDataSerializer(request.user).data

    return Response(
        {
            "user_data": user_data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "GET" ])
@access_token_required
def get_delivery_address(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    user_addresses = DeliveryAddress.objects.filter(user=request.user)
    return Response(
        {
            "user_addresses": DeliveryAddressSerializer(user_addresses, many=True).data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "GET" ])
@access_token_required
def geocode_address(request: Request):
    lat = request.query_params.get("lat")
    lon = request.query_params.get("lon")

    if not lat or not lon:
        return Response(
            {
                "error": "Отсутствуют координаты."
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    response = requests.get("https://geocode-maps.yandex.ru/v1/", params={
        "apikey": settings.YANDEX_MAPS_API_KEY,
        "format": "json",
        "geocode": f"{lon},{lat}",
        "lang": "ru_RU",
    })

    geo_data = response.json()
    try:
        components = (
            geo_data["response"]["GeoObjectCollection"]["featureMember"][0]
            ["GeoObject"]["metaDataProperty"]["GeocoderMetaData"]
            ["Address"]["Components"]
        )

        parsed = {comp["kind"]: comp["name"] for comp in components}
        return Response(
            {
                "city": parsed.get("locality"),
                "street": parsed.get("street"),
                "house": parsed.get("house")
            },
            status=status.HTTP_200_OK
        )
    except Exception:
        return Response(
            {
                "error": "Не удалось определить адрес"
            }, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view([ "POST" ])
@access_token_required
def add_delivery_address(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    serializer = DeliveryAddressSerializer(
        data=request.data,
        context={"user": request.user}
    )

    if not serializer.is_valid():
        return Response(
            {
                "error": serializer.errors[0]
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        serializer.save()
    except Exception:
        return Response(
            {
                "error": "Что-то пошло не так"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user_addresses = DeliveryAddress.objects.filter(user=request.user)
    return Response(
        {
            "user_addresses": DeliveryAddressSerializer(user_addresses, many=True).data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "PATCH" ])
@access_token_required
def edit_delivery_address(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    address_id = request.query_params.get("address_id")
    new_address_data = request.data.get("new_address_value")

    if not address_id or not new_address_data:
        return Response(
            {
                "error": "Неверные параметры запроса"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        address = DeliveryAddress.objects.get(id=address_id, user=request.user)
    except DeliveryAddress.DoesNotExist:
        return Response(
            {
                "error": "Такой адрес не найден"
            }, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    edit_serializer = EditDeliveryAddressSerializer(
        address,
        data=new_address_data,
        context={"user": request.user},
        partial=True
    )

    if not edit_serializer.is_valid():
        return Response(
            {
                "error": edit_serializer.errors[0]
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    edit_serializer.save()

    user_addresses = DeliveryAddress.objects.filter(user=request.user)
    return Response(
        {
            "user_addresses": DeliveryAddressSerializer(user_addresses, many=True).data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "DELETE" ])
@access_token_required
def remove_delivery_address(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    address_id = request.query_params.get("address_id")
    if not address_id:
        return Response(
            {
                "error": "Необходим параметр addressId."
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        address = DeliveryAddress.objects.get(id=int(address_id), user=request.user)
        address.delete()
    except DeliveryAddress.DoesNotExist:
        return Response(
            {
                "error": "Такого адреса доставки не существует."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    user_addresses = DeliveryAddress.objects.filter(user=request.user)
    return Response(
        {
            "user_addresses": DeliveryAddressSerializer(user_addresses, many=True).data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "PATCH" ])
@access_token_required
def update_user_data(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    serializer = UserDataUpdateSerializer(instance=request.user, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer.save()
    return Response(
        {
            "user_data": ProfileDataSerializer(request.user).data,
        },
        status=status.HTTP_200_OK
    )

@api_view([ "PATCH" ])
@access_token_required
def update_user_password(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    serializer = PasswordUpdateSerializer(instance=request.user, data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    serializer.save()
    return Response(
        {
            "user_data": ProfileDataSerializer(request.user).data,
        },
        status=status.HTTP_200_OK
    )

@api_view([ "GET" ])
@access_token_required
def get_payment_methods(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    methods = PaymentMethod.objects.filter(user=request.user)
    return Response(
        {
            "payment_methods": PaymentMethodSerializer(methods, many=True).data
        },
        status=status.HTTP_200_OK
    )

@api_view([ "POST" ])
@access_token_required
def add_payment_method(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    serializer = PaymentMethodSerializer(
        data=request.data,
        context={"user": request.user}
    )

    if not serializer.is_valid():
        return Response(
            {
                "error": serializer.errors[0]
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer.save()

    methods = PaymentMethod.objects.filter(user=request.user)
    return Response(
        {
            "payment_methods": PaymentMethodSerializer(methods, many=True).data
        },
        status=status.HTTP_200_OK
    )
    
@api_view([ "DELETE" ])
@access_token_required
def remove_payment_method(request: Request):
    if not isinstance(request.user, User):
        return Response(
            {"error": "Error on server. Please try again later"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    method_id = request.query_params.get("method_id")
    if not method_id:
        return Response(
            {
                "error": "Необходим параметр methodId."
            }, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        method = PaymentMethod.objects.get(id=int(method_id), user=request.user)
        method.delete()
    except PaymentMethod.DoesNotExist:
        return Response(
            {
                "error": "Такого метода оплаты не существует."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    methods = PaymentMethod.objects.filter(user=request.user)
    return Response(
        {
            "payment_methods": PaymentMethodSerializer(methods, many=True).data
        },
        status=status.HTTP_200_OK
    )