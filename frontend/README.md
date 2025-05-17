# Community Board Frontend

A Next.js-based frontend for the Community Board application.

## Project Structure
```
frontend/
├── public/              # Static files
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── components/ # React components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── styles/     # CSS styles
│   │   └── types/      # TypeScript types
│   ├── pages/          # Page components
│   └── tests/          # Test files
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore file
├── next.config.js     # Next.js configuration
├── package.json       # Project dependencies
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json      # TypeScript configuration
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env.local` and update the values:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Features

- Email-based authentication
- User profile management
- CSV import for user data
- Tag-based filtering
- Responsive design
- TypeScript support
- Tailwind CSS styling 