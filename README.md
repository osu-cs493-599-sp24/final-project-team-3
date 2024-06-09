# Tarpaulin API

Tarpaulin is a course management tool that involves developing a complete RESTful API for Tarpaulin, allowing users (instructors and students) to manage courses, assignments, and submissions.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

The Tarpaulin API supports various operations for managing courses, assignments, and submissions. The API is designed to be modular and scalable, using modern development practices such as containerization and cloud deployment.

## Features

- User authentication and authorization (Admin, Instructor, Student roles)
- CRUD operations for courses, assignments, and submissions
- File upload and download for assignment submissions
- Course roster download in CSV format
- Pagination for large datasets
- Rate limiting to prevent abuse
- Docker containerization for all services

## Technologies Used

- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web framework for Node.js
- **MySQL**: Relational database management system
- **Redis**: In-memory data structure store for caching
- **RabbitMQ**: Message broker for asynchronous task handling
- **AWS S3**: Object storage service for file uploads
- **JWT**: JSON Web Tokens for authentication
- **Docker**: Containerization platform
- **Google Cloud Platform**: Cloud hosting and deployment

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- Docker
- AWS account for S3
- Google Cloud account

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/tarpaulin-api.git
   cd tarpaulin-api
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```env
   NODE_ENV=development
   DB_HOST=db
   DB_USER=root
   DB_PASSWORD=example
   DB_NAME=tarpaulin
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   ```
### To generate a secure JWT secret key, you can use various methods. Here are a few recommended ways to generate a strong secret key:

   Using OpenSSL
   If you have OpenSSL installed on your machine, you can generate a strong random key using the following command:

   ```sh
   openssl rand -base64 32
   ```
   This will generate a 32-byte random key encoded in base64. For example:
   
   `wA7pZGtJwMEHP9ZlQf3+Gd0T/jY6h1lJfGi1U7DtYY0=`
   
## Running the Application

### Using Docker

1. Start the services using Docker Compose:
   ```sh
   docker-compose up
   ```

2. The API should now be running at `http://localhost:3000`.

### Without Docker

1. Start the MySQL and Redis servers locally.
2. Run the application:
   ```sh
   npm start
   ```

## API Endpoints

The API endpoints are defined in the OpenAPI specification (openapi.yaml) and can be viewed in the Swagger editor( https://editor.swagger.io). Below are some key endpoints:

- **User Authentication**
  - `POST /users`
  - `POST /users/login`
  - `GET /users/{id}`

- **Courses**
  - `GET /courses`
  - `GET /courses/{id}`
  - `POST /courses`
  - `PATCH /courses/{id}`
  - `DELETE /courses/{id}`
  - `GET /courses/{id}/roster`
  - `GET /courses/{id}/students`
  - `POST /courses/{id}/students`
  - `GET /courses/{id}/assignments`
    
- **Assignments**
  - `GET /assignments/{id}`
  - `POST /assignments`
  - `PATCH /assignments/{id}`
  - `DELETE /assignments/{id}`
  - `GET /assignments/{id}/submissions`
  - `POST /assignments/{id}/submissions`
  - 
- **Submissions**
  - `PATCH /submissions/{id}`
  - `GET /media/submissions/{filename}`

## Deployment

### Google Cloud Platform

1. **Deploy using Google Cloud Run:**
   - Build and push the Docker image to Google Container Registry:
     ```sh
     gcloud builds submit --tag gcr.io/your-project-id/tarpaulin-api
     ```
   - Deploy the image to Cloud Run:
     ```sh
     gcloud run deploy tarpaulin-api --image gcr.io/your-project-id/tarpaulin-api --platform managed --region us-central1
     ```

2. **Deploy using Google Kubernetes Engine (GKE):**
   - Create a cluster:
     ```sh
     gcloud container clusters create tarpaulin-cluster --num-nodes=3
     ```
   - Deploy the application:
     ```sh
     kubectl apply -f k8s-deployment.yaml
     ```

