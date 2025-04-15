from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status

from .models import Pizza
from .serializers import PizzaSerializer

# Create your views here.

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
            serializer.data,
            status=status.HTTP_200_OK
        )
