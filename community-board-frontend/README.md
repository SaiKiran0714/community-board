# Community Board Frontend

A modern web application for managing and displaying community member profiles, built with Next.js and TypeScript.

## Features

### User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean and intuitive interface with smooth animations
- **Dark/Light Mode**: Automatic theme detection (coming soon)

### User Features
- **Profile Management**: Create and edit user profiles
- **Social Links**: Add GitHub, LinkedIn, and personal website links
- **Skills Tagging**: Add and manage skill tags
- **Availability**: Set available days (Friday/Saturday)
- **Search & Filter**: Search by name, description, or skills
- **Tag Filtering**: Filter users by skills and availability

### Admin Features
- **User Management**: Delete users and toggle admin status
- **CSV Import**: Bulk import user data
- **Admin Dashboard**: Special admin controls and views

## Setup Instructions

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Clone the repository
```bash
git clone https://github.com/SaiKiran0714/community-board.git
cd community-board/community-board-frontend
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Application

Development mode:
```bash
npm run dev
# or
yarn dev
```

The application will start at `http://localhost:3000`

## Project Structure

```
community-board-frontend/
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── components/  # Reusable components
│   │   ├── types/      # TypeScript types
│   │   └── page.tsx    # Main page component
│   ├── styles/       # Global styles
│   └── utils/        # Utility functions
├── public/          # Static files
└── package.json     # Project dependencies
```

## Key Components

### User Interface
- **UserCard**: Displays user profile information
- **LoginModal**: Handles user authentication
- **HamburgerMenu**: Responsive navigation menu
- **CsvUpload**: CSV file upload interface
- **LoadingSpinner**: Loading state indicator

### Features Implementation

1. **Authentication Flow**
   - Google OAuth integration
   - JWT token management
   - Protected routes

2. **Profile Management**
   - Edit personal information
   - Manage social links
   - Set availability
   - Add/remove skills

3. **Search and Filtering**
   - Real-time search
   - Multi-tag filtering
   - Availability filtering
   - Combined filters

4. **Admin Features**
   - User deletion
   - Admin status management
   - Bulk user import

## Styling

- Custom CSS-in-JS implementation
- Responsive design principles
- Consistent color scheme
- Smooth animations and transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Known Issues

- Profile image upload (coming soon)
- Real-time updates (planned)
- Mobile navigation improvements (in progress)
