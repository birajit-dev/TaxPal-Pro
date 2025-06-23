# TaxPal Backend - MVC Architecture

A Node.js Express.js backend API built with clean MVC (Model-View-Controller) architecture for the TaxPal tax management SaaS application.

## 🏗️ Architecture

This backend follows the MVC pattern:

- **Models** (`src/models/`) - Data models and database schemas
- **Views** - JSON API responses (no traditional views in API)
- **Controllers** (`src/controllers/`) - Business logic and request handling
- **Routes** (`src/routes/`) - API endpoint definitions
- **Middleware** (`src/middleware/`) - Authentication, validation, error handling
- **Config** (`src/config/`) - Database and logger configuration

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - User registration/login
  - Protected routes
  
- **Income Management**
  - CRUD operations for income entries
  - Categorization and search
  - Pagination and filtering
  
- **Expense Management**
  - CRUD operations for expense entries
  - Tax-deductible expense tracking
  - Receipt management support
  
- **Dashboard Analytics**
  - Financial summaries
  - Monthly trends
  - Tax calculations
  
- **Security & Performance**
  - Rate limiting
  - Input validation with Joi
  - MongoDB with Mongoose ODM
  - Comprehensive error handling
  - Request logging

## 📋 Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file based on `.env.example`

3. Start MongoDB service:
```bash
# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod
```

4. Run the application:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user info
- `POST /api/v1/auth/logout` - User logout

### Income Management
- `GET /api/v1/income` - Get income entries (paginated, filterable)
- `POST /api/v1/income` - Create income entry
- `GET /api/v1/income/:id` - Get specific income entry
- `PUT /api/v1/income/:id` - Update income entry
- `DELETE /api/v1/income/:id` - Delete income entry

### Expense Management
- `GET /api/v1/expenses` - Get expense entries (paginated, filterable)
- `POST /api/v1/expenses` - Create expense entry
- `GET /api/v1/expenses/:id` - Get specific expense entry
- `PUT /api/v1/expenses/:id` - Update expense entry
- `DELETE /api/v1/expenses/:id` - Delete expense entry

### Dashboard
- `GET /api/v1/dashboard/summary` - Get financial summary
- `GET /api/v1/dashboard/trends` - Get monthly trends

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## 🗄️ Database Schema

### User Model
- Personal information (firstName, lastName, email)
- Authentication (password hash)
- Business information
- Subscription details

### Income Model
- Source and description
- Amount and category
- Platform information
- Tax-related fields

### Expense Model
- Description and amount
- Category and vendor
- Payment method
- Deductible status
- Receipt storage support

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Request rate limiting
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Error handling without information leakage

## 📝 Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/taxpal_dev
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

## 🧪 Usage Examples

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create an income entry:
```bash
curl -X POST http://localhost:8080/api/v1/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "source": "Freelance Project",
    "description": "Web development work",
    "amount": 2500,
    "category": "freelance",
    "date": "2024-01-15"
  }'
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📞 Health Check

Check if the API is running:
```bash
curl http://localhost:8080/health
```

## 🔄 Development

The codebase uses:
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Joi** - Request validation
- **Winston** - Logging
- **JWT** - Authentication
- **Bcrypt** - Password hashing 