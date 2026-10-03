# Talent Backend API

This is the backend server for the Talent App. It is a modern REST API built with Node.js, Express, TypeScript, and Prisma ORM.

## Overview

The backend is responsible for serving data to the `talent-mobile` frontend. It uses a SQLite database (for local development) managed via Prisma.

## Prerequisites

- Node.js (v18 or newer recommended)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Sync the Database:**
   Push the Prisma schema to create/update your local SQLite database:
   ```bash
   npx prisma db push
   ```

3. **Start the Server:**
   Run the development server (which uses `nodemon` and `ts-node` for hot-reloading):
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

## Database Schema

The database is defined in `prisma/schema.prisma` and currently contains:
- **User**: Represents a talent on the platform (has an avatar, username, etc.)
- **Video**: Represents a video uploaded by a User.

*Note: The server is configured to automatically seed the database with a few dummy users and videos if it detects that the database is completely empty on the first request.*

## API Endpoints

- `GET /api/feed` - Returns a list of all videos (including author data) sorted by creation date.
