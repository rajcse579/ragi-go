# Ragi Go Project

This project is a full-stack application for the "Ragi Go" service. It consists of a Spring Boot backend and a React-based web frontend that is also configured for mobile deployment using Capacitor.

## Project Structure

-   **`ragi-go-api`**: The backend service built with Spring Boot.
    -   Handles API requests, authentication, and Firebase Cloud Messaging (FCM) notifications.
    -   Configured for deployment to Google Cloud Run.
-   **`ragi-go-web`**: The frontend application built with React and Vite.
    -   Uses Capacitor for potential Android deployment.
    -   Configured for deployment to Firebase Hosting.

## Tech Stack

-   **Backend**: Java, Spring Boot, Firebase Admin SDK (for FCM).
-   **Frontend**: React, Vite, Capacitor.
-   **Infrastructure**: Google Cloud Run (Backend), Firebase Hosting (Frontend).

## Deployment

The project includes custom Node.js scripts to handle deployment:

### Backend Deployment
To deploy the backend to Google Cloud Run:
```bash
node deploy_backend.js
```
This script zips the `ragi-go-api` source, builds it with Cloud Build, and deploys it to Cloud Run.

### Frontend Deployment
To deploy the frontend to Firebase Hosting:
```bash
node deploy_frontend.js
```
*Note: Ensure you have built the frontend (`npm run build` in `ragi-go-web`) before running the deployment script, as the script uploads the `ragi-go-web/dist` folder.*

## Recent Updates
-   Implemented FCM Push Notifications for broadcast messages with High priority for background delivery.
