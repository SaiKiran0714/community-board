# Community Board

A full-stack web application for managing and connecting community members based on their skills, availability, and interests.

## Features

- 👥 User Profiles with Skills & Interests
- 🔍 Advanced Search & Filtering
- 📅 Availability Management
- 🔐 Secure Authentication
- 👑 Admin Dashboard
- 📊 CSV Import Support
- 🎨 Modern UI with Responsive Design

## Tech Stack

### Backend
- Python 3.x
- Flask
- SQLAlchemy
- Flask-CORS
- Flask-Mail
- Flask-Migrate

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion

## Getting Started

### Prerequisites
- Python 3.x
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Unix/MacOS:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file with the following variables:
   ```env
   SECRET_KEY=your-secret-key
   DATABASE_URL=sqlite:///community.db
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-specific-password
   MAIL_DEFAULT_SENDER=your-email@gmail.com
   ```

6. Run the application:
   ```bash
   python run.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd community-board-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Request login link
- `GET /api/auth/verify` - Verify login token

### Users
- `GET /api/users` - List all users
- `GET /api/users/<user_id>` - Get user details
- `PUT /api/users/<user_id>` - Update user profile
- `POST /api/users/import` - Import users from CSV

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 