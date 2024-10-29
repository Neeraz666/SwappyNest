from django.shortcuts import render
import string
from rest_framework.views import APIView
from rest_framework import permissions
from .models import Product
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializers import ProductSerializer

# Create your views here.
class UploadProduct(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            currentuser = request.user
            productdata = self.request.data

            productname = productdata['productname']
            productpic = productdata['productpic']
            description = productdata['description']
            purchaseyear  = productdata['purchaseyear']
            condition = productdata['condition']
            category = productdata['category']

            product = Product(
                user = currentuser,
                productname = productname, 
                productpic = productpic,
                description = description,
                purchaseyear = purchaseyear,
                condition = condition,
                category = category
            )
            
            product.save()

            return Response({'success': 'Your product has been sucessfully uploaded.'})
        except Exception as e:
            return Response({'error': e})
        
class ListAllProduct(ListAPIView):
    permission_classes = (permissions.AllowAny, )
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer