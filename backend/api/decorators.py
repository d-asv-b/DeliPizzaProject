from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import AccessToken

from django.contrib.auth import get_user_model


User = get_user_model()


def access_token_required(view):
    def wrapper(request: Request, *args, **kwargs):
        auth_header = request._request.headers.get("Authorization", "")
        if not auth_header or not auth_header.startswith("Bearer "):
            return Response(
                {
                    "error": "Invalid or missing access token!",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token = auth_header.split(" ")[1]

        try:
            token = AccessToken(access_token)
            user_id = token.get("user_id")
            user_obj = User.objects.get(id=user_id)
        except Exception as err:
            print(err)
            return Response(
                {
                    "error": "Invalid or missing access token!",
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        request.user = user_obj

        return view(request, *args, **kwargs)

    return wrapper

def access_token_optional(view):
    def wrapper(request: Request, *args, **kwargs):
        try:
            auth_header = request.headers.get("Authorization", "")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise Exception()

            access_token = auth_header.split(" ")[1]

            token = AccessToken(access_token)
            user_id = token.get("user_id")
            user_obj = User.objects.get(id=user_id)
            request.user = user_obj
        except Exception:
            request.user = None
        finally:
            return view(request, *args, **kwargs)
        
    return wrapper