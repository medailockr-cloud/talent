# Talent App (Mobile & Web)

This is the frontend for the Talent App, built as a universal React Native application with [Expo](https://expo.dev), targeting both mobile (iOS/Android) and web platforms.

## Overview

The Talent App frontend uses Expo Router for file-based navigation, NativeWind (Tailwind CSS) for styling, and connects to the `talent-backend` Express API to fetch real-time data.

## Prerequisites

- Node.js (v18 or newer recommended)
- A running instance of the `talent-backend` server (on port 3000)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start
   ```
   *Note: If you want to develop on the web, you can run `npm run web` directly.*

## Architecture

- **Routing**: Handled by Expo Router (`src/app/`).
- **Styling**: Tailwind CSS via NativeWind.
- **Backend Connection**: The app connects to `http://localhost:3000/api/feed` on launch to populate the main feed.

## Scripts
- `npm run start` - Starts the Expo development server.
- `npm run android` - Starts the app in Android development mode.
- `npm run ios` - Starts the app in iOS development mode.
- `npm run web` - Starts the app in web development mode.
