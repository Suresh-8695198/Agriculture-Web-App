# AgriConnect Backend

Django REST API backend for the Agriculture Connect platform.

## Features

- **User Authentication**: JWT-based authentication with custom user model
- **Three User Types**: Farmer, Supplier, and Consumer portals
- **Location-Based Search**: Find nearest suppliers and farmers using geolocation
- **Product Management**: Full CRUD for agricultural products and farm produce
- **Order Management**: Handle orders between farmers-suppliers and consumers-farmers
- **Review System**: Rate and review suppliers and produce
- **Shopping Cart**: Consumer cart functionality
- **Media Upload**: Support for product and profile images

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Installation

1. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure PostgreSQL**:
   - Create a database named `agriconnect_db`
   - Update database credentials in `agriconnect/settings.py` if needed:
     ```python
     DATABASES = {
         'default': {
             'ENGINE': 'django.db.backends.postgresql',
             'NAME': 'agriconnect_db',
             'USER': 'postgres',
             'PASSWORD': 'postgres',  # Change this
             'HOST': 'localhost',
             'PORT': '5432',
         }
     }
     ```

4. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser**:
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server**:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `GET /api/accounts/profile/` - Get/Update user profile
- `POST /api/accounts/change-password/` - Change password
- `POST /api/accounts/logout/` - Logout

### Suppliers
- `GET /api/suppliers/profiles/` - List supplier profiles
- `POST /api/suppliers/profiles/create_profile/` - Create supplier profile
- `GET /api/suppliers/profiles/my_profile/` - Get current supplier profile
- `GET /api/suppliers/products/` - List products
- `POST /api/suppliers/products/` - Create product
- `GET /api/suppliers/products/search_nearby/` - Search products by location
- `GET /api/suppliers/products/my_products/` - Get supplier's products
- `POST /api/suppliers/reviews/` - Create supplier review

### Farmers
- `GET /api/farmers/profiles/` - List farmer profiles
- `POST /api/farmers/profiles/create_profile/` - Create farmer profile
- `GET /api/farmers/profiles/my_profile/` - Get current farmer profile
- `GET /api/farmers/produce/` - List farm produce
- `POST /api/farmers/produce/` - Create farm produce
- `GET /api/farmers/produce/search_nearby/` - Search produce by location
- `GET /api/farmers/produce/my_produce/` - Get farmer's produce
- `GET /api/farmers/orders/` - List supplier orders
- `POST /api/farmers/orders/` - Create supplier order

### Consumers
- `GET /api/consumers/profiles/` - List consumer profiles
- `POST /api/consumers/profiles/create_profile/` - Create consumer profile
- `GET /api/consumers/profiles/my_profile/` - Get current consumer profile
- `GET /api/consumers/orders/` - List produce orders
- `POST /api/consumers/orders/` - Create produce order
- `GET /api/consumers/cart/` - List cart items
- `POST /api/consumers/cart/` - Add to cart
- `GET /api/consumers/cart/total/` - Get cart total
- `DELETE /api/consumers/cart/clear/` - Clear cart
- `POST /api/consumers/reviews/` - Create produce review

## Database Models

### User (Custom)
- username, email, password
- user_type (farmer/supplier/consumer)
- phone_number
- profile_picture
- address, latitude, longitude
- is_verified

### Supplier Models
- **SupplierProfile**: Business details, rating, reviews
- **Product**: Seeds, fertilizers, tractors, equipment (with rental option)
- **SupplierReview**: Ratings and reviews

### Farmer Models
- **FarmerProfile**: Farm details, crops grown
- **FarmProduce**: Paddy, vegetables, fruits, etc.
- **SupplierOrder**: Orders to suppliers

### Consumer Models
- **ConsumerProfile**: Consumer details
- **ProduceOrder**: Orders for farm produce
- **ProduceReview**: Ratings and reviews
- **Cart**: Shopping cart

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/`

All models are registered and can be managed through the admin interface.

## Technologies Used

- Django 6.0.2
- Django REST Framework 3.15.2
- PostgreSQL
- JWT Authentication
- CORS Headers
- Pillow (Image handling)
