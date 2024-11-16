from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from .models import Product, Image
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .serializers import ProductSerializer
from rest_framework.response import Response



class UploadProduct(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            currentuser = request.user
            productdata = request.data

            productname = productdata['productname']
            description = productdata['description']
            purchaseyear = productdata['purchaseyear']
            condition = productdata['condition']
            category = productdata['category']

            # Save product without images
            product = Product.objects.create(
                user=currentuser,
                productname=productname,
                description=description,
                purchaseyear=purchaseyear,
                condition=condition,
                category=category
            )

            # Handle multiple images
            images = productdata.getlist('images') 
            for image in images:
                Image.objects.create(product=product, image=image)

            return Response({'success': 'Your product has been successfully uploaded.'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        
class ListAllProduct(ListAPIView):
    permission_classes = (permissions.AllowAny, )
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer

# ListCategoricalProduct class is created to get the products of a single category 
class ListCategoricalProduct(ListAPIView):
    # Since the product searching is allowed to all users so, the users are not required to Log In before searching for products
    permission_classes = (permissions.AllowAny, )
    serializer_class = ProductSerializer

    def get_queryset(self):
        # Categorical Slug is fetched from the frontend so that the user searching for specific category can be retrieved
        category_slug = self.kwargs.get('slug')

        # If category_slug exits, the model searches for the slug to be available in the database and if it exits, it returns the products related with the category.
        if category_slug:
            return Product.objects.filter(category=category_slug)
        
        # If category_slug doesn't exits, none will be returned
        return Product.objects.none()
