<div align="center">

# 🚀 Educational-backend

### Scalable REST API built with Node.js, Express & MongoDB

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Authentication-orange" />
  <img src="https://img.shields.io/badge/Swagger-API%20Docs-85EA2D?logo=swagger" />
</p>

<p>
Production-ready backend service featuring authentication, SMS verification, file uploads, API documentation, and scalable architecture.
</p>

</div>

---

## ✨ Features

- 🔐 JWT Authentication
- 📱 OTP / SMS Verification
- 👤 User Management
- 📂 File Upload System
- 🛡 Request Validation
- 📖 Swagger API Documentation
- ☁️ MongoDB Database
- ⚡ RESTful API Design
- 📝 Request Logging
- 🇮🇷 Jalali Date Support

---

## 🛠 Tech Stack

### Backend

- Node.js, Express.js, MongoDB, Mongoose

### Security & Validation

- JWT, bcryptjs, Joi, Express Validator

### Services

- Melipayamak, SMS.ir, Multer, Swagger

### Utilities

- Morgan, Dotenv, Axios

---

## 🏗 Architecture

```text
Client
  │
  ▼
Express Router
  │
  ├── Authentication
  ├── User Management
  ├── File Upload
  ├── SMS Services
  └── API Modules
  │
  ▼
MongoDB
```

---

## 📂 Project Structure

```text
Educational-backend
│
├── admin/          # Admin-related routes and logic
├── api/            # API endpoints
├── auth/           # Authentication logic
├── controller/     # Request handlers
├── middleware/     # Custom middlewares (e.g., JWT.js)
├── model/          # MongoDB Mongoose schemas
├── module/         # Shared modules (constants, fileupload, functions)
├── router/         # Route definitions (admin, api, auth)
├── validators/     # Request validation schemas
│
├── server.js       # Entry point
└── .env            # Environment variables
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=
JWT_SECRET=
SMS_API_KEY=
MELIPAYAMAK_USERNAME=
MELIPAYAMAK_PASSWORD=
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm start
```

Server will run on:

```text
http://localhost:3000
```

---

## 📖 API Documentation

Swagger documentation is available after running the server:

```text
http://localhost:3000/api-docs
```

---

## 🌟 Highlights

✔ Modular API design
✔ JWT-based authentication
✔ SMS integration
✔ File upload handling
✔ Swagger documentation
✔ MongoDB persistence
✔ Production-ready architecture
