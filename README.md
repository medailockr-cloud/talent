# Talent App: Full-Stack Project

Welcome to the Talent App monorepo! This repository contains both the mobile/web frontend and the Node.js backend. 

## Project Structure

This project is divided into two main applications:
1. **`talent-mobile` (Frontend)**: A universal React Native app built with Expo and NativeWind (Tailwind CSS).
2. **`talent-backend` (Backend)**: A Node.js & Express RESTful API utilizing Prisma ORM and a local SQLite database.

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
   *The server should now be running on `http://localhost:3000`. Leave this terminal window open.*

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
- [Expo](https://expo.dev/) (Expo Router for navigation)
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- [Lucide Icons](https://lucide.dev/)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- SQLite (Local database)
- TypeScript
