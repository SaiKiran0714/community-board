# Community Board Backend

This is the backend server for the Community Board application, built with Flask and SQLite for development.

## Tech Stack

- **Framework**: Flask 3.0.0
- **Database**: SQLite (Development), PostgreSQL (Production)
- **ORM**: SQLAlchemy 2.0.23
- **Authentication**: JWT-based email authentication
- **Email Service**: Flask-Mail
- **API Documentation**: Coming soon

## Prerequisites

- Python 3.9+
- pip (Python package manager)

## Setup

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with the following variables:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

## Database

- Development: SQLite database (`instance/community.db`)
- Production: PostgreSQL (configured via `DATABASE_URL` environment variable)
- The database schema is managed through SQLAlchemy models
- Initial migrations are handled automatically
- Sample data is populated on first run

## Running the Server

Development mode with auto-reload:
```bash
python run.py
```

Or using Flask CLI:
```bash
flask run
```

The server will start at `http://127.0.0.1:5000`

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users/import` - Import users from CSV
- `POST /api/auth/login` - Email-based authentication
- `GET /api/auth/verify` - Verify authentication token
- More endpoints documentation coming soon

## Scripts

The `scripts` directory contains utility scripts:
- `create_admin.py` - Create an admin user
- `import_users.py` - Bulk import users from CSV
- `add_saturday_users.py` - Add sample users with Saturday availability

## Development

1. The application uses SQLite for development, which requires no additional setup
2. Debug mode is enabled in development for detailed error messages
3. Email sending is suppressed in development by default

## Production Deployment

For production:
1. Set `FLASK_ENV=production`
2. Configure `DATABASE_URL` for PostgreSQL
3. Set up proper email credentials
4. Use a production WSGI server (e.g., Gunicorn)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT License 