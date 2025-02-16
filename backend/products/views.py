from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions, status
from .models import Product, Image, Interest
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .serializers import ProductSerializer
from rest_framework.response import Response
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import random


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
            new_interested_products = productdata.get('interested_products', [])
            category = productdata['category']

            # Save product without images
            product = Product.objects.create(
                user=currentuser,
                productname=productname,
                description=description,
                purchaseyear=purchaseyear,
                # interested_products=interested_products,
                condition=condition,
                category=category
            )

            # Handle multiple images (get from request.FILES)
            images = request.FILES.getlist('images')  # Fixed here
            for image in images:
                Image.objects.create(product=product, image=image)


            # Save interested products
            try:
                # Check if user already has an interest object
                interest = Interest.objects.get(user=currentuser)
                # Add new interested products to existing list
                existing_interests = interest.interested_products

                new_interested_products = [item for item in new_interested_products if item not in existing_interests]
                
                existing_interests.extend(new_interested_products)
                interest.interested_products = sorted(existing_interests)
                interest.save()
            except Interest.DoesNotExist:
                Interest.objects.create(user=currentuser, interested_products=new_interested_products)

            return Response({'success': 'Your product has been successfully uploaded.'})
        except Exception as e:
            return Response({'error': str(e)}, status=400)





class ListAllProduct(ListAPIView):

    """
        Need to make listings such that most of the products to show are the ones that the user is interested in and 
        the rest are general products. Also, the products should be shuffled so that the user doesn't see the same everytime. 
    """

    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        a = random.random()  # Seed the random number generator
        random.seed(a)
        if self.request.user.is_authenticated:
            # Get the interested products of the user
            interested_category = Interest.objects.filter(user = self.request.user).values_list('interested_products', flat = True)
            interested_category = [category for sublist in interested_category for category in sublist]  # Flatten the list
            interested_category = list(interested_category)

            # Get the products of the interested categories and combine with general
            recommended_list = Product.objects.filter(category__in = interested_category)
            allproduct = Product.objects.all()
            generallist = allproduct.exclude(id__in = recommended_list)
            combined_list = list(recommended_list) + list(generallist)  # Combine the two lists

            # Shuffle the combined list
            random.shuffle(combined_list)
            return combined_list
        
        # If user is not authenticated, return all products in random order
        allproduct = list(Product.objects.all())
        random.shuffle(allproduct)
        return (allproduct)
    
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





class ProductSearchView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ProductSerializer

    def get(self, request, *args, **kwargs):
        search_query = request.query_params.get('q', None)
        
        if not search_query:
            return Response({"error": "Query parameter 'q' is required"}, status=400)

        products = Product.objects.all()
        product_data = [product.productname + " " + product.description for product in products]

        # Combine the query and product data for TF-IDF vectorization
        combined_data = product_data + [search_query]

        # Create the TF-IDF vectorizer and fit it on the combined data
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(combined_data)

        # Separate the query vector (last row) and product vectors (all rows except last)
        query_vector = tfidf_matrix[-1]
        product_vectors = tfidf_matrix[:-1]

        # Compute cosine similarity between the query vector and product vectors
        similarities = []
        for product, product_vector in zip(products, product_vectors):
            similarity = self.compute_cosine_similarity(query_vector, product_vector)
            similarities.append((product, similarity))

        # Sort products by similarity score in descending order
        similarities.sort(key=lambda x: x[1], reverse=True)

        # Get the top 15 most similar products
        top_products = similarities[:15]

        # Serialize the products to return
        serialized_products = self.serializer_class([product for product, _ in top_products], many=True)

        return Response(serialized_products.data[:])
    
    def compute_cosine_similarity(self, vec1, vec2):
        """
        Computes cosine similarity between two vectors.
        """
        return cosine_similarity(vec1, vec2)[0][0]
    

