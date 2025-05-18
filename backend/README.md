# Community Board Backend

This is the backend server for the Community Board application, built with Flask and SQLite.

## Features

- **User Authentication**: Google OAuth 2.0 integration for secure login
- **User Management**: CRUD operations for user profiles
- **Admin Controls**: Special privileges for admin users
- **Data Import**: Support for CSV import of user data
- **API Endpoints**: RESTful API endpoints for all operations

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
```bash
git clone https://github.com/SaiKiran0714/community-board.git
cd community-board/backend
```

2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the OAuth 2.0 API
4. Configure the OAuth consent screen
5. Create OAuth 2.0 Client credentials
6. Add authorized redirect URIs:
   - `http://localhost:3000/callback` (for development)

### Environment Variables

Create a `.env` file in the backend directory with the following variables:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DISCOVERY_URL=https://accounts.google.com/.well-known/openid-configuration
GOOGLE_REDIRECT_URI=http://localhost:3000/callback
```

### Running the Server

1. Start the Flask server:
```bash
python -m flask run
```
The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login`: Initiate Google OAuth login
- `GET /api/auth/verify`: Verify user authentication

### Users
- `GET /api/users`: Get all users
- `GET /api/users/<id>`: Get specific user
- `PUT /api/users/<id>`: Update user profile
- `POST /api/users/delete`: Delete user(s)
- `POST /api/users/import`: Import users from CSV

### Admin Operations
- `POST /api/users/<id>/toggle-admin`: Toggle admin status

## Database

The application uses SQLite database (community.db) with the following main tables:
- Users: Stores user profiles and authentication details
- Links: Stores user's social media links
- Tags: Stores user skills and interests

## Security Features

- OAuth 2.0 authentication
- JWT token-based session management
- Password-less authentication
- Admin role protection for sensitive operations 