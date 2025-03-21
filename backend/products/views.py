from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import permissions
from .models import Product, Image, Interest, LikedProduct
from django.contrib.auth.models import AnonymousUser
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .serializers import ProductSerializer, InterestSerializer
from rest_framework.response import Response
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import random, json


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
            # Parse the 'interested_products' string into a list
            new_interested_products = json.loads(productdata.get('interested_products', '[]'))
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

            # Handle multiple images (get from request.FILES)
            images = request.FILES.getlist('images')  # Fixed here
            for image in images:
                Image.objects.create(product=product, image=image)

            # Handle the interested products
            try:
                # Check if the user already has an interest object
                interest = Interest.objects.get(user=currentuser)
                # Extract the existing interested products (already a list)
                existing_interests = interest.interested_products

                # Ensure new_interested_products are not duplicates
                new_interested_products = [item for item in new_interested_products if item not in existing_interests]

                # Add the new products to the existing list and sort them
                existing_interests.extend(new_interested_products)
                interest.interested_products = sorted(existing_interests)
                interest.save()
            except Interest.DoesNotExist:
                # If no interest object exists, create a new one
                Interest.objects.create(user=currentuser, interested_products=new_interested_products)

            return Response({'success': 'Your product has been successfully uploaded.'})
        except Exception as e:
            # Print error message for debugging
            print("Error:", str(e))
            return Response({'error': str(e)}, status=400)
        






class InterestDetailView(RetrieveAPIView):
    serializer_class = InterestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Interest.objects.filter(user=self.request.user).first()  









class ListAllProduct(ListAPIView):
    """
    A view that lists products with a focus on the user's interested products, 
    with general products included as well. The list is shuffled to provide 
    variety with every request.
    """
    permission_classes = (permissions.AllowAny, )

    def get_queryset(self):
        # Seed the random number generator for shuffling
        random.seed(random.random())  
        current_user = self.request.user
        print(current_user)

        if current_user.is_authenticated:
            interested_categories = Interest.objects.filter(user=current_user).values_list('interested_products', flat=True)
            interested_categories = [category for sublist in interested_categories for category in sublist]

            recommended_products = Product.objects.filter(category__in=interested_categories).exclude(user=current_user)
            all_products = Product.objects.exclude(user=current_user)            
            general_products = all_products.exclude(id__in=recommended_products)

            combined_list = list(recommended_products) + list(general_products)

        else:
            combined_list = list(Product.objects.all())

        random.shuffle(combined_list)
        return combined_list

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
    







class LikeProductView(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def post(self, request):
        try:
            currentuser = request.user
            product_id = request.data['product_id']

            try:
                liked_list = LikedProduct.objects.get(user=currentuser)
                existing_liked_set = set(liked_list.liked_products)

                if product_id in existing_liked_set:
                    existing_liked_set.remove(product_id)  # If the product is already liked, unlike it
                    message = "Product unliked successfully."
                else:
                    existing_liked_set.add(product_id)  # If the product is not liked, like it
                    message = "Product liked successfully."

                
                liked_list.liked_products = sorted(list(existing_liked_set))  # Convert set to list and sort
                liked_list.save()

            except LikedProduct.DoesNotExist:
                # If the user does not have a liked products entry, create it
                LikedProduct.objects.create(user=currentuser, liked_products=[product_id])
                message = "Product liked successfully."

            return Response({'success': message})

        except Exception as e:
            return Response({'error': str(e)}, status=400)

class ListLikedProducts(ListAPIView):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = ProductSerializer
    pagination_class = None
    
    def get_queryset(self):
        currentuser = self.request.user 
        try:
            liked_product = LikedProduct.objects.get(user=currentuser)
            print(liked_product.liked_products)

            product_ids = liked_product.liked_products
            products = Product.objects.filter(id__in=product_ids)

            return products

        except LikedProduct.DoesNotExist:
            return Product.objects.none()
        
    