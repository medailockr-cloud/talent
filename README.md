# Talent App: Full-Stack Project

Welcome to the Talent App monorepo! This repository contains both the mobile/web frontend and the Node.js backend for a TikTok-style short-video social platform.

## Project Structure

This project is divided into two main applications:
1. **`talent-mobile` (Frontend)**: A universal React Native app built with Expo and NativeWind (Tailwind CSS).
2. **`talent-backend` (Backend)**: A Node.js & Express RESTful API utilizing Prisma ORM, SQLite database, Socket.io for Real-Time chat, and Swagger for API Documentation.

---

## 🌟 Current Features

### Backend (Fully Featured)
- **Authentication**: Secure JWT-based user authentication and registration (`bcryptjs`).
- **Dynamic Personalized Feed**: Algorithm-driven paginated video feed (scoring based on views, likes, comments, and ratings).
- **Social Graph**: Robust Follower/Following system.
- **Engagement**: Liking, Commenting, Rating (0-100 score), and Saving (Bookmarking) videos.
- **Discoverability**: Automatic Hashtag extraction from video descriptions, trending hashtag analytics.
- **Creator Analytics**: Aggregated dashboard for views and engagement.
- **Moderation & Admin Tools**: Role-based access control, reporting mechanism, banning users, and removing videos.
- **Real-Time Chat**: WebSockets integrated via `socket.io` for instant messaging.
- **Security & Performance**: Rate Limiting (`express-rate-limit`) to prevent abuse and Security Headers (`helmet`).
- **Interactive Documentation**: Beautiful auto-generated API docs via Swagger (`swagger-ui-express`).

### Frontend (Mobile App)
- **Dynamic Video Feed**: Scrollable video feed in `HomeView`.
- **Advanced Video Creator**: A multi-step `CreateView` for recording or uploading performance videos with an interactive video editing timeline.
- **User Profiles**: `ProfileView` displaying dynamic stats and user uploads.
- **Robust Playback**: Integration with `expo-video` for responsive video playback.
- **Modern UI/UX**: Highly polished UI using `lucide-react-native` icons, custom typography, haptic feedback, and a sleek dark mode interface.

---

## 🚀 Setup & Installation Guide for Developers

Follow these steps exactly to get the entire full-stack application running on your local machine.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)
- **Git**

### Step 1: Clone the repository
```bash
git clone <your-repo-url>
cd <repository-folder>
```

### Step 2: Setup the Backend
The backend serves the API and manages the database. It must be running for the frontend to display data.

1. Navigate to the backend directory:
   ```bash
   cd talent-backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Initialize the SQLite database (this pushes the schema and generates the Prisma client):
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:3000`.*
   *View the interactive API documentation at: `http://localhost:3000/api-docs`*

### Step 3: Setup the Frontend (Mobile/Web App)
Open a **new, second terminal window** at the root of the project to start the frontend.

1. Navigate to the frontend directory:
   ```bash
   cd talent-mobile
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Expo development server. You have a few options depending on your target platform:
   - **For Web (Recommended for quick testing):**
     ```bash
     npm run web
     ```
   - **For iOS Simulator (Requires Mac & Xcode):**
     ```bash
     npm run ios
     ```
   - **For Android Emulator (Requires Android Studio):**
     ```bash
     npm run android
     ```

### Step 4: Verify the Connection
Once both servers are running:
1. Open the frontend app (e.g., in your browser or simulator).
2. The app should automatically fetch data from `http://localhost:3000/api/feed`.
3. Note: The backend is configured to **auto-seed** dummy data on the very first request if the database is empty. You should see "Jane Doe" and "John Smith" videos appear immediately!

---

## Tech Stack Overview

**Frontend:**
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) (Including `expo-camera`, `expo-video`, `expo-image-picker`)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- SQLite (Local database)
- Socket.IO (WebSockets)
- Swagger UI (API Docs)
- TypeScript
