from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError, PermissionDenied
from .models import UserReview
from .serializers import UserSerializer, UserReviewSerializer
from products.models import Product
from  products.serializers import ProductSerializer

User = get_user_model()

# Create your views here.
class SignUpView(APIView):
    permission_classes = (permissions.AllowAny, )
    def post(self, request, format=None):
        data = self.request.data

        email = data['email']
        username = data['username']
        firstname = data['firstname']
        lastname = data['lastname']
        password = data['password']
        password1 = data['password1']
        profilephoto = data['profilephoto']
        phone = data['phone']
        address = data['address']

        if password == password1:
            try:
                validate_password(password)

            except ValidationError as e:
                return Response({'Error': e.messages})
            
            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already exists! Try another one.'})
            
            else:
                user = User.objects.create_user(email=email, username=username, firstname=firstname, lastname=lastname, password=password, profilephoto=profilephoto, phone=phone, address=address)

                user.save()

                return Response({'Success': 'User created successfully.'})
            
        else:
            return Response({'error': 'Passwords donot match! Try again.'})




class UserDetail(APIView):
    """
    Allow any user to view a profile.
    Only the profile owner can edit their profile.
    """
    permission_classes = [permissions.AllowAny]  # Anyone can access the view for GET
    parser_classes = (MultiPartParser, FormParser)  # Added to handle file uploads

    def get_object(self):
        user_id = self.kwargs.get('id')  # Get the user ID from the URL
        return get_object_or_404(User, id=user_id)  # Return 404 if user doesn't exist

    def get(self, request, *args, **kwargs):
        """
        Handle GET requests to retrieve user details.
        """
        user = self.get_object()
        serializer = UserSerializer(user)
        # Return the serialized data directly without the "user" key
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        user = self.get_object()

        if not request.user.is_authenticated or request.user != user:
            raise PermissionDenied("You are not allowed to update this profile.")

        remove_profilephoto = request.data.get('remove_profilephoto', 'false') == 'true'
        profilephoto = request.data.get('profilephoto', None)

        if remove_profilephoto and not profilephoto:  # Remove only if no new photo is provided
            if user.profilephoto:
                try:
                    file_path = user.profilephoto.path
                    if default_storage.exists(file_path):
                        default_storage.delete(file_path)
                    user.profilephoto = None
                except Exception as e:
                    return Response({"message": f"Error deleting file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserProductsView(APIView):
    """
    Retrieve all products associated with a user, identified by their username.
    """
    permission_classes = [] 

    def get(self, request, id):
        # Retrieve the user object based on the id
        user = get_object_or_404(User, id=id)
        
        # Query products belonging to this user
        products = Product.objects.filter(user=user)
        
        # Serialize the products
        serializer = ProductSerializer(products, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    


class ReviewCreateAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        current_user = request.user

        reviewed_user_email = data.get('reviewed_user')
        rating = data.get('rating')
        content = data.get('content')

        reviewed_user = get_object_or_404(User, email = reviewed_user_email)

        try:
            review = UserReview.objects.create(
                reviewed_user = reviewed_user,
                reviewer = current_user,
                rating = rating,
                content = content
            )

            review.save()

            return Response({'success': 'Your review has been uploaded sucessfully!'})
        except Exception as e:
            return Response({'error':str(e)}, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class ListReviewForUserAPIView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserReviewSerializer
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')

        if user_id:
            return UserReview.objects.filter(reviewed_user = user_id)
        return Response({'error': 'Please provide user detail!'})


class ListReviewByUserAPIView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserReviewSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')

        if user_id:
            return UserReview.objects.filter(reviewer = user_id)
        return Response({'error': 'Please provide user details!'})