from django.shortcuts import render
import string
from rest_framework.views import APIView
from rest_framework import permissions
from .models import Product
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializers import ProductSerializer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

# Create your views here.

class UploadProduct(APIView):
    # UploadProduct function uses APIView and the user should be authenticated (permissions.IsAuthenticated)
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            # Current user is retrieved and the data coming from the frontend is stored in productdata
            currentuser = request.user
            productdata = self.request.data

            productname = productdata['productname']
            productpic = productdata['productpic']
            description = productdata['description']
            purchaseyear  = productdata['purchaseyear']
            condition = productdata['condition']
            category = productdata['category']

            # The data retrieved from the frontend is saved to the Product model
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
            
            # If the product is successfully saved the following response will be returned else error will be returned
            return Response({'success': 'Your product has been sucessfully uploaded.'})
        except Exception as e:
            return Response({'error': e})
        
class ListAllProduct(ListAPIView):
    """
        ListAllProduct uses ListAPIView to list the products
        The function doesn't need authentication to be called and the products are sent as per the 'id' in ascending order
    """
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

class ProductSearchView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        search_query = self.request.query_params.get('q', None)

        if not search_query:
            return Product.objects.none()
        
        products = Product.objects.all()
        product_data = [product.productname + " " + product.description for product in products]

        query_vector = self.generate_query_vector(search_query)

        similarities = []

        for product, product_text in zip(products, product_data):
            product_vector = self.generate_query_vector(product_text)
            similarity = self.compute_cosine_similarity(query_vector, product_vector)
            similarities.append((product, similarity))

        similarities.sort(key=lambda x: x[1], reverse=True)

        print(similarities)

        top_products = similarities[:15]

        serialized_products = self.serializer_class([product for product, _ in top_products], many = True)

        return Response({
            'product': serialized_products.data,
        })
    
    def generate_query_vector(self, text):
        """
        Converts text (query or product data) into a vector using TF-IDF.
        You can replace this with other methods like Word2Vec or BERT.
        """
        vectorizer = TfidfVectorizer(stop_words='english')
        return vectorizer.fit_transform([text]).toarray()

    def compute_cosine_similarity(self, vec1, vec2):
        """
        Computes cosine similarity between two vectors.
        """
        return cosine_similarity(vec1, vec2)[0][0]