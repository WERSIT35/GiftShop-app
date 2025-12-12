# Sample Backend Implementation (Node.js/Express)

This is a reference implementation for your backend API. You can use this as a starting point.

## Installation

```bash
npm install express bcryptjs jsonwebtoken nodemailer dotenv cors
```

## .env File

```
PORT=5000
JWT_SECRET=your_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
DATABASE_URL=your_database_url
FRONTEND_URL=http://localhost:4200
```

## Sample Code (Express.js)

### app.js
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;
```

### routes/auth.js
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Your database model

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate Verification Token
const generateVerificationToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await User.create({
      name: name || 'User',
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false
    });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&email=${email}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h2>Welcome!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>Link expires in 24 hours</p>
      `
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful. Check your email to verify.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email first' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Verify Email
router.get('/verify', async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ 
        message: 'Token and email are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Check token
    if (user.verificationToken !== token) {
      return res.status(401).json({ 
        message: 'Invalid verification token' 
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // Generate token
    const jwtToken = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Verification failed', 
      error: error.message 
    });
  }
});

module.exports = router;
```

### models/User.js (MongoDB/Mongoose example)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
```

## Important Notes

1. **Password Hashing**: Always hash passwords with bcrypt
2. **Tokens**: Use JWT for stateless authentication
3. **Email Verification**: Implement token expiration
4. **CORS**: Enable it properly for your frontend URL
5. **Validation**: Validate all inputs on backend
6. **Security**: Never expose JWT secret in client code
7. **HTTPS**: Always use HTTPS in production
8. **Rate Limiting**: Implement rate limiting on auth endpoints

## Alternative Database Options

### PostgreSQL
```bash
npm install pg sequelize
```

### SQLite
```bash
npm install sqlite3 sequelize
```

### Firebase
```bash
npm install firebase-admin
```

## Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### AWS Lambda + API Gateway
Use `serverless` framework for deployment

### DigitalOcean / AWS EC2
Deploy Node.js directly on server with PM2

## Testing with Postman

### Register
```
POST http://localhost:5000/api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Verify
```
GET http://localhost:5000/api/auth/verify?token=XXXXX&email=john@example.com
```

## Production Checklist

- [ ] Use environment variables for secrets
- [ ] Implement HTTPS/TLS
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add logging
- [ ] Add error handling
- [ ] Add database backup strategy
- [ ] Enable CORS properly
- [ ] Use secure password hashing
- [ ] Implement token refresh
- [ ] Add email verification
- [ ] Set token expiration
