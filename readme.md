# DevTinder🚀

DevTinder is an application where Developers can connect with each other like in Tinder.

## Features

### User Management
- User authentication (signup/login)
- Profile management
- Secure password handling
- JWT-based authentication

### Connection System
- Send connection requests
- Show interest in other users
- Ignore profiles
- Update connection status

## 🛠️ API Endpoints

### Authentication
- POST /auth/signup # Register a new user
- POST /auth/login # Login user
- POST /auth/logout # Logout user

### Connection Requests

POST /request/send/:status/:toUserId # Send/Update connection request

- Status options:
  - `interested`: Show interest in a profile
  - `ignored`: Ignore a profile

## 🔒 Security Features

- MongoDB ObjectId validation
- JWT authentication middleware
- Password encryption
- Request validation
- Error handling

## 🚦 Status Codes

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## 💡 Connection Request Logic

The system handles connection requests with the following rules:
1. Users can show interest or ignore other profiles
2. Existing requests can be updated with a different status
3. Duplicate requests with the same status are prevented
4. Both users involved in a connection are tracked

## 🔍 Validation Checks

- Valid MongoDB ObjectId format
- User existence verification
- Valid connection status
- Duplicate request prevention
- Authentication validation

## 🛡️ Error Handling

The API includes comprehensive error handling for:
- Invalid user IDs
- Non-existent users
- Invalid request status
- Duplicate requests
- Server errors

---
