# Mind Refresh - Backend Service

## Overview

The Mind Refresh backend is a robust, scalable RESTful API and real-time WebSocket server built with [NestJS](https://nestjs.com/). It serves as the core data processing and orchestration layer for the Mind Refresh corporate wellness platform, handling user authentication, event management, real-time notifications, and emotional analytics telemetry.

## Architecture & Tech Stack

*   **Framework:** NestJS (TypeScript)
*   **Database & Storage:** Firebase Firestore (via `firebase-admin`)
*   **Real-time Communication:** Socket.io
*   **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
*   **Security:** Helmet, CORS strict origins, class-validator/class-transformer for payload sanitization

## Prerequisites

*   Node.js (v20 or higher recommended)
*   npm (v10 or higher)
*   Docker & Docker Compose (for containerized deployment)
*   A Firebase project with a generated Service Account Key

## Environment Variables

The application enforces secure-by-default configurations. It will fail to start if critical environment variables are missing. Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:80,http://localhost

# Authentication
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRATION=1d

# Firebase Credentials
# Use a base64 encoded string of your firebase-key.json for production
FIREBASE_CREDENTIALS_BASE64=your_base64_encoded_service_account_json
```

*Note: For local development, if `FIREBASE_CREDENTIALS_BASE64` is omitted, the application will attempt to load a `firebase-key.json` file from the project root. This is not recommended for production environments.*

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your environment variables as described above.

## Running the Application

### Local Development

```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug
```

### Production Build

```bash
# Compile TypeScript to JavaScript
npm run build

# Start the production server
npm run start:prod
```

## Docker Deployment

The project includes a multi-stage Dockerfile optimized for production.

```bash
# Build the image
docker build -t mind-refresh-backend .

# Run the container
docker run -p 3000:3000 --env-file .env mind-refresh-backend
```

Alternatively, you can orchestrate the deployment using the root `docker-compose.yml`.

## Core Modules

*   **AuthModule:** Manages user registration, JWT issuance, and payload validation.
*   **UsersModule:** Handles CRUD operations for corporate user profiles and Role-Based Access Control (RBAC).
*   **EventsModule:** Orchestrates wellness events, enrollment tracking, and invitation dispatching.
*   **MoodsModule:** Records and aggregates daily emotional check-ins.
*   **AnalyticsModule:** Processes emotional data to generate strategic heatmaps and executive summaries.
*   **NotificationsModule:** Manages the persistence and real-time dispatch (via WebSockets) of system alerts and shared quotes.
