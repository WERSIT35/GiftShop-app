# Authentication System - Gift Shop App

## Overview
This is a complete authentication system built with Angular that includes:
- User Registration
- Email Verification
- User Login
- Protected Routes
- Token-based Authentication

## Project Structure

```
src/app/
├── services/
│   └── auth.service.ts         # Authentication service
├── pages/
│   ├── register.component.ts    # Registration page
│   ├── login.component.ts       # Login page
│   ├── verify.component.ts      # Email verification page
│   └── home.component.ts        # Dashboard/Home page
├── guards/
│   └── auth.guard.ts            # Route protection guard
├── app.routes.ts                # Route configuration
├── app.config.ts                # Application configuration
└── app.ts                       # Root component
```

## API Endpoints Expected

### 1. Register User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",        // optional
  "email": "user@example.com",  // required
  "password": "password123"     // required
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Login User
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",  // required
  "password": "password123"     // required
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 3. Verify Email
**Endpoint:** `GET /api/auth/verify?token=verificationToken&email=user@example.com`

**Query Parameters:**
- `token`: Email verification token (from email link)
- `email`: User's email address

**Response:**
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token_here"
}
```

## Setup Instructions

### 1. Update Backend URL
In `src/app/services/auth.service.ts`, update the API_URL:

```typescript
private readonly API_URL = 'http://localhost:5000/api/auth'; // Change to your backend URL
```

### 2. Run the Application

```bash
npm start
```

The application will start at `http://localhost:4200`

### 3. Test the Flow

1. **Register**: Navigate to `/register` and create a new account
2. **Verification**: Check your email for the verification link
3. **Verify Email**: Click the link (format: `/verify?token=XXX&email=user@example.com`)
4. **Login**: Go to `/login` and enter your credentials
5. **Dashboard**: After login, you'll be redirected to `/home`

## Routes

| Route | Component | Protected | Purpose |
|-------|-----------|-----------|---------|
| `/register` | RegisterComponent | No | User registration |
| `/login` | LoginComponent | No | User login |
| `/verify` | VerifyComponent | No | Email verification |
| `/home` | HomeComponent | Yes | User dashboard |
| `/dashboard` | HomeComponent | Yes | User dashboard (alias) |
| `/` | - | - | Redirects to `/home` |

## Authentication Flow

### Registration Flow
```
1. User fills registration form
2. Sends POST request to /api/auth/register
3. Backend validates and creates user account
4. Backend sends verification email with token
5. User receives email with verification link
6. User clicks link and verifies email
7. User can now login
```

### Login Flow
```
1. User fills login form
2. Sends POST request to /api/auth/login
3. Backend validates credentials
4. Backend returns JWT token
5. Token stored in localStorage
6. User redirected to /home
7. Subsequent API calls include token in headers
```

### Token Management

The AuthService automatically:
- Saves JWT token to `localStorage.authToken`
- Saves user info to `localStorage.user`
- Removes token/user on logout
- Checks authentication status

To add token to API calls, create an HTTP interceptor:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

Then add to `app.config.ts`:

```typescript
import { withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

## Key Features

### 1. Form Validation
- Email validation
- Password minimum length (6 characters)
- Name is optional
- Real-time validation feedback

### 2. Loading States
- Disable submit button during request
- Show loading text on button
- Prevent multiple submissions

### 3. Error Handling
- Display error messages from backend
- Graceful handling of network errors
- User-friendly error messages

### 4. Success Feedback
- Success messages after actions
- Auto-redirect on successful login
- Visual feedback with status icons on verify page

### 5. Responsive Design
- Mobile-friendly forms
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Accessible components

### 6. Security
- Token stored in localStorage
- Password input type
- CORS-enabled API calls
- Protected routes with auth guard

## Customization

### Change Colors
Update the gradient colors in component styles:
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add Additional Fields
1. Update `auth.service.ts` interfaces
2. Add form controls to component `FormGroup`
3. Add input fields to template
4. Update backend to handle new fields

### Add More Routes
1. Create new component in `pages/`
2. Add route to `app.routes.ts`
3. Use `authGuard` for protected routes

## Troubleshooting

### CORS Errors
- Ensure backend allows requests from your frontend URL
- Add CORS headers to backend responses

### Token Not Persisting
- Check if localStorage is enabled
- Verify token is returned from API
- Check browser DevTools > Application > Storage

### Routes Not Working
- Ensure all components are imported in routes
- Check route names match navigation links
- Verify authGuard is properly configured

### Form Validation Issues
- Check FormControl names match template
- Verify validators are applied correctly
- Use `updateValueAndValidity()` if needed

## Next Steps

1. **Add HTTP Interceptor** - Automatically attach token to requests
2. **Add Error Interceptor** - Handle 401/403 errors globally
3. **Add Remember Me** - Persist login state
4. **Add Password Reset** - Allow users to reset passwords
5. **Add Social Login** - Google, GitHub, Facebook login
6. **Add Two-Factor Authentication** - Additional security layer
7. **Add User Profile** - Edit user information
8. **Add Change Password** - Secure password update

## Support

For issues or questions, check:
- Backend API response format
- Browser console for errors
- Network tab for API calls
- Angular documentation
