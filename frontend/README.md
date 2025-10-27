# Wendor Frontend

A Next.js frontend application for the Wendor service booking platform.

## Features

- User authentication (login/register)
- Role-based access (Customer/Provider)
- Responsive design with Tailwind CSS
- Form validation with React Hook Form and Zod
- Context-based state management

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env.local` file in the frontend directory with:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` - Next.js app directory with pages and layout
- `src/components/` - Reusable React components
- `src/contexts/` - React context providers
- `src/lib/` - Utility functions and API client

## Authentication

The app supports two user roles:

- **Customer**: Can book services from providers
- **Provider**: Can offer services and manage their schedule

Users can register with either role and will see different navigation options based on their role.

## API Integration

The frontend communicates with the backend API through the `src/lib/api.ts` file. Make sure the backend is running on the configured API URL.
