# Prophunt

https://prophuntt.onrender.com

# Property Listing System Backend

A comprehensive backend system for managing property listings with advanced features including search, filtering, user authentication, favorites, and property recommendations.

## Features

✅ **Complete CRUD Operations** for properties  
✅ **User Authentication** (JWT-based)  
✅ **Advanced Search & Filtering** (10+ attributes)  
✅ **Redis Caching** for performance optimization  
✅ **Favorites System** for users  
✅ **Property Recommendations** between users  
✅ **Authorization Controls** (only owners can modify their properties)  
✅ **CSV Data Import** utility  
✅ **Production Ready** with proper error handling and security

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Authentication**: JWT tokens
- **Security**: Helmet.js, CORS, bcrypt

## Quick Start

Test the API:

bashcurl: https://prophuntt.onrender.com/health

API Documentation

Use route as https://prophuntt.onrender.com/api

## Authentication

POST /auth/register - Register new user\
"Content-Type: application/json"\
body:
{\
"name": "John Doe",\
"email": "john@example.com",\
"password": "password123"\
}

POST /auth/login - User login\
"Content-Type: application/json"\
body: {\
"email": "john@example.com",\
"password": "password123"\
}

GET /auth/profile - Get user profile (authenticated)\
"Authorization: Bearer YOUR_JWT_TOKEN"\

## Properties

GET /properties - List properties with filtering

GET /properties/:id - Get single property

POST /properties - Create property (authenticated)

Authorization: Bearer YOUR_JWT_TOKEN \
 "Content-Type: application/json" \
 body: { \
"id": "PROP999",\
"title": "Beautiful Villa",\
"type": "Villa",\
"price": 2500000,\
"state": "Maharashtra",\
"city": "Mumbai",\
"areaSqFt": 1500,\
"bedrooms": 3,\
"bathrooms": 2,\
"amenities": "pool|gym|parking",\
"furnished": "Semi",\
"available": "Yes",\
"listedBy": "Owner",\
"listingType": "sale"\
}

PUT /properties/:id - Update property (owner only)\
body: {\
"areaSqFt": 1000\
}

DELETE /properties/:id - Delete property (owner only)

## Favorites

POST /favorites - Add to favorites\
"Authorization: Bearer YOUR_JWT_TOKEN" \
 "Content-Type: application/json" \
 body:
{\
 "propertyId": "PROPERTY_ID"\
 }

GET /favorites - Get user favorites

DELETE /favorites/:propertyId - Remove from favorites

## Recommendations

POST /recommendations - Recommend property to user\
"Authorization: Bearer YOUR_JWT_TOKEN" \
 "Content-Type: application/json" \
 body: {\
"recipientEmail": "jane@example.com",\
"propertyId": "PROPERTY_ID",\
"message": "Check out this amazing property!"\
}

GET /recommendations/received - Get received recommendations \
Authorization: Bearer YOUR_JWT_TOKEN

GET /recommendations/sent - Get sent recommendations \
Authorization: Bearer YOUR_JWT_TOKEN

## The API supports advanced filtering:

Text search: ?search=villa (searches in title, amenities, tags) \
Location: ?city=Mumbai&state=Maharashtra \
Price range: ?minPrice=1000000&maxPrice=5000000 \
Property specs: ?bedrooms=3&bathrooms=2 \
Property type: ?type=Villa \
Furnished status: ?furnished=Semi \
Listing type: ?listingType=sale \
Verification: ?isVerified=true \
Sorting: ?sortBy=price&sortOrder=asc \
Pagination: ?page=1&limit=10

Advanced Filtering \
The API supports comprehensive filtering:\
GET /api/properties?city=Mumbai&minPrice=1000000&maxPrice=5000000&bedrooms=3&sortBy=price&sortOrder=asc

## Deployment

The application is readly deployed on:

Render: https://prophuntt.onrender.com

Environment Variables \
envMONGODB_URI= \
REDIS_URL= \
REDIS_TOKEN= \
JWT_SECRET= \
JWT_EXPIRES_IN= \
PORT= \
NODE_ENV=development \

```

```
