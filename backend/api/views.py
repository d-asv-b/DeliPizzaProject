from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from backend import settings

from .models import RegistrationUserData, AuthorizationUserData, Pizza
from .serializers import ProfileDataSerializer, RegistrationDataSerializer, AuthorizationDataSerializer, PizzaSerializer
from .decorators import access_token_required


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
    except:
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
        value=str(refresh_token),
        expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        httponly=True,
        path="/",
        samesite="Strict"
    )

    return response

@api_view([ "GET" ])
@access_token_required
def get_profile_info(request: Request):
    if not hasattr(request, "user") or not (type(request.user) == User):
        return Response(
            {
                "error": "Error on server. Please try again later"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    user_data = ProfileDataSerializer(request.user).data

    return Response(
        {
            "user_data": user_data
        },
        status=status.HTTP_200_OK
    )