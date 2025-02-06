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

## 🚀 API Endpoints

### User Feed

GET /feed # Get user feed
- Fetches a list of users for the feed, excluding:
    - The logged-in user
    - Already connected users
    - Users to whom a request has already been sent
    - Ignored users

### Received Connection Requests

GET /user/requests/received # Get received connection requests
- Retrieves all pending connection requests for the logged-in user.

### User Connections

GET /user/connections # Get user connections
- Fetches all accepted connections for the logged-in user.

## 💡 User Feed Logic

The user feed is designed to show relevant user profiles based on the following criteria:
1. **Exclusion of Self:** The feed should not include the logged-in user's profile.
2. **Exclusion of Existing Connections:** Users who are already connected should not appear in the feed.
3. **Exclusion of Requested Users:** Users to whom a connection request has already been sent should be hidden.
4. **Exclusion of Ignored Users:** Users who have been ignored should not be shown again.
5. **Pagination:** The feed supports pagination to efficiently handle a large number of users.

## ⚙️ Feed Parameters

- `page` (optional): Page number for pagination (default: 1).
- `limit` (optional): Number of users per page (default: 10, max: 30).

---
