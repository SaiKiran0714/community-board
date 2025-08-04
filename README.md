# Community Board

A full-stack web application for managing and connecting community members, built with Next.js, TypeScript, Flask, and SQLite.

Team members: 
-Sai Kiran Pulickal Babujith
-Aswathi Chittiyam Veettil Thankan
-Karan Sharma

![Community Board Banner](./docs/banner.png)

<img width="1267" height="914" alt="image" src="https://github.com/user-attachments/assets/e44fb985-7749-4d9b-9149-c48f1d6210ef" />


## Overview

Community Board is a platform designed to help community members connect and collaborate. It provides a centralized space where members can:

- Create and manage their profiles
- Share their skills and availability
- Connect through social links (GitHub, LinkedIn, etc.)
- Find other members based on skills or availability
- Import/export user data through CSV

## Key Features

### For Users
- 👤 Personal profile management
- 🔗 Social media integration
- 🏷️ Skill tagging system
- 📅 Availability scheduling
- 🔍 Advanced search capabilities

### For Admins
- 👑 User management dashboard
- 📊 Bulk data import/export
- 🔐 Access control management
- 📈 User activity monitoring

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- CSS-in-JS
- Framer Motion

### Backend
- Flask
- SQLite
- JWT Authentication
- Google OAuth 2.0

## Getting Started

The project is divided into two main parts:

1. **Frontend**: Located in `/community-board-frontend`
   - For setup instructions, see [Frontend README](./community-board-frontend/README.md)

2. **Backend**: Located in `/backend`
   - For setup instructions, see [Backend README](./backend/README.md)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/SaiKiran0714/community-board.git
cd community-board
```

2. Set up the backend (see [Backend README](./backend/README.md))
3. Set up the frontend (see [Frontend README](./community-board-frontend/README.md))
4. Start both servers
   - Backend will run on `http://localhost:5000`
   - Frontend will run on `http://localhost:3000`

## Screenshots

### Home Page
![Home Page](./docs/home.png)

### Profile Management
![Profile Page](./docs/profile.png)

### Admin Dashboard
![Admin Dashboard](./docs/admin.png)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors
- Special thanks to the community members
- Built during the Bayerwald Hackathon 2025 - Deggendorf 
