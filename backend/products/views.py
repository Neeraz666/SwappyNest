from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from .models import Product
from rest_framework.response import Response

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
        
