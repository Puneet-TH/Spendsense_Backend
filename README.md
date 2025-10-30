# SpendSense - Expense Tracking API

## 🌐 Base URL

```
Production: https://spendsense-backend-d3ti.onrender.com/api/v1
Local: http://localhost:5000/api/v1
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/spendsense-backend.git

# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Start the server
npm run dev
```

## 📝 What is SpendSense?

SpendSense is a powerful expense tracking API that helps you:
- Track daily expenses
- Analyze spending patterns
- Manage budgets
- Monitor financial habits
- Maintain activity streaks

Perfect for:
- Personal finance apps
- Budget tracking applications
- Financial analytics platforms
- Expense sharing systems

## 🛠️ Setup Guide

###  Environment Setup

Create `.env` file in the root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI="YOUR_MONGO_URI"

# Authentication
ACCESS_TOKEN_SECRET=your_super_secret_key_here
ACCESS_TOKEN_EXPIRY=1d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# CORS
CORS_ORIGIN=http://localhost:3000


### 4. Running the Server

```terminal
# Development mode
npm run dev

# Production mode
npm start

# The server will start at http://localhost:8000
```

## 📱 Available Routes

### Public Routes
No authentication needed:
- `POST /api/v1/user/register` - Create account
- `POST /api/v1/user/login` - Get access token
- `POST /api/v1/otp/o/send-otp` - Request email verification
- `GET /api/v1/server-check` - API health check

### Protected Routes
Require authentication:

#### Expense Management
- `POST /user-expense/add-expense`
- `GET /user-expense/e/allExpense`
- `PATCH /user-expense/update-expense`
- `POST /user-expense/remove-expense`

#### Analytics
- `GET /user-expense/m/monthlyCategorySpending`
- `GET /user-expense/y/yearlyCategorySpending`
- `GET /user-expense/t/totalExpense`

#### User Profile
- `GET /user/u/get-current-User`
- `POST /user/u/update-user`

## 🎯 Features in Detail

### 1. Expense Tracking
- Multiple payment methods
- Category-based organization
- Custom tags
- Date tracking
- Description and notes

### 2. Categories
Default categories include:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Healthcare
- Utilities
- Education
- Travel
- Groceries
- Other

### 3. Analytics Features
- Monthly spending breakdown
- Yearly analysis
- Category-wise totals
- Spending trends
- Custom date ranges

### 4. User Features
- Email verification
- Password reset
- Profile management
- Activity streaks
- Multi-device support

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**
```bash
# Check MongoDB status
mongo --eval "db.adminCommand('ping')"

# Check server logs
npm run dev
```

2. **Authentication Issues**
- Verify if email is verified
- Check token expiration
- Ensure correct token format

3. **Email Not Receiving**
- Check spam folder
- Verify SMTP credentials
- Check email service status

## 📈 Rate Limits

- 100 requests per IP per 15 minutes
- Email verification: 5 attempts per hour
- Password reset: 3 attempts per hour

## 🔐 Security Features

1. **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

2. **API Security**
- JWT authentication
- Rate limiting
- CORS protection
- Input validation

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repo
2. Create feature branch (`git checkout -b "branch name"`)
3. Commit changes (`git commit -m 'Add to the branch'`)
4. Push to branch (`git push origin 'branch name`)
5. Open a Pull Request

## 📫 Support

Need help? Here's how to reach us:
- Create an issue
- Email: thapliyalpuneet84@gmail.com

## 📄 License

MIT License - feel free to use this project for your own applications!

---

Happy Coding! 🚀
