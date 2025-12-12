# Quick Start Guide - Authentication System

## What Was Created

Your authentication system is now ready with the following features:

### ✅ Pages Created:
1. **Register** (`/register`) - Create new user accounts
2. **Login** (`/login`) - Sign in with email and password
3. **Email Verification** (`/verify`) - Verify email via token link
4. **Dashboard/Home** (`/home`) - Protected user dashboard

### ✅ Components Created:
- `RegisterComponent` - Registration form with validation
- `LoginComponent` - Login form with validation
- `VerifyComponent` - Email verification handler
- `HomeComponent` - User dashboard (protected)

### ✅ Services Created:
- `AuthService` - Handles all authentication API calls and token management

### ✅ Security:
- `AuthGuard` - Protects routes from unauthorized access
- Token-based authentication with localStorage

### ✅ Features:
- Email validation
- Password validation (minimum 6 characters)
- Optional name field on registration
- Loading states during API calls
- Error and success messages
- Beautiful gradient UI with responsive design
- Smooth animations and transitions

## File Structure

```
src/app/
├── services/
│   └── auth.service.ts                    (67 lines)
├── pages/
│   ├── register.component.ts              (200 lines)
│   ├── login.component.ts                 (180 lines)
│   ├── verify.component.ts                (120 lines)
│   └── home.component.ts                  (110 lines)
├── guards/
│   └── auth.guard.ts                      (15 lines)
├── app.routes.ts                          (17 lines)
├── app.config.ts                          (14 lines)
├── app.ts                                 (13 lines)
└── app.html                               (router-outlet)
```

## Configuration Required

### 1. Update Backend URL
Edit `src/app/services/auth.service.ts`:

```typescript
private readonly API_URL = 'http://localhost:5000/api/auth'; // Change this
```

Replace with your actual backend URL.

### 2. Backend API Endpoints Required

Your backend must provide these endpoints:

**Register:**
```
POST /api/auth/register
Body: { name?, email, password }
Returns: { message, token, user }
```

**Login:**
```
POST /api/auth/login
Body: { email, password }
Returns: { message, token, user }
```

**Verify Email:**
```
GET /api/auth/verify?token=xxx&email=yyy@zzz.com
Returns: { message, token }
```

## How to Use

### Step 1: Start the App
```bash
npm start
```

### Step 2: Test Registration
- Go to http://localhost:4200/register
- Fill in email and password
- Submit

### Step 3: Test Email Verification
- Check your email for verification link
- Link format: `/verify?token=XXXX&email=user@example.com`
- Click link to verify

### Step 4: Test Login
- Go to http://localhost:4200/login
- Enter email and password
- Should redirect to dashboard

### Step 5: Protected Routes
- Try accessing `/home` without logging in
- Should redirect to `/login`

## API Integration

The AuthService handles all API calls. It expects responses in this format:

```json
{
  "message": "Success message",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

For errors, return:
```json
{
  "message": "Error message"
}
```

## Token Management

Tokens are automatically:
- ✅ Saved to `localStorage.authToken`
- ✅ Used for protected routes
- ✅ Cleared on logout

To use token in API calls, create an interceptor (see AUTH_SETUP.md for example).

## Customization Options

### Change Colors
Edit component `styles` property:
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change App Name
Edit `HomeComponent` template:
```html
<h1 class="logo">Your App Name</h1>
```

### Add Fields to Registration
1. Add FormControl to RegisterComponent
2. Add input to template
3. Update auth.service.ts `RegisterRequest` interface
4. Update backend

### Add New Protected Pages
1. Create component in `pages/`
2. Add route to `app.routes.ts` with `canActivate: [authGuard]`
3. Add navigation link in HomeComponent

## Security Notes

⚠️ **Important:**
- Currently using localStorage (not ideal for sensitive apps)
- Consider using HttpOnly cookies for production
- Add HTTPS for all API calls
- Implement refresh token rotation
- Add request/response interceptors for token refresh
- Validate all inputs on backend

## Testing Checklist

- [ ] Register with valid email/password
- [ ] Verify email via link
- [ ] Login with correct credentials
- [ ] Try login with wrong password
- [ ] Try accessing /home without login (should redirect)
- [ ] Logout and verify redirect to /login
- [ ] Try accessing /verify without token/email params
- [ ] Test form validation errors
- [ ] Test on mobile (responsive design)

## Troubleshooting

**Error: "Cannot POST /api/auth/register"**
- Check backend is running
- Verify backend URL in auth.service.ts
- Check CORS is enabled on backend

**Error: "Email verification failed"**
- Verify token is correct in URL
- Check backend verify endpoint
- Ensure token hasn't expired

**Routes not working:**
- Clear browser cache
- Run `npm start` again
- Check browser console for errors

**Form not submitting:**
- Check email is valid format
- Check password is minimum 6 characters
- Check form errors in browser DevTools

## Next Steps

1. **Recommended**: Add HTTP interceptor for automatic token attachment
2. **Add**: Error interceptor for global 401 handling
3. **Add**: Loading spinner component
4. **Add**: Toast notifications
5. **Add**: User profile page
6. **Add**: Password reset functionality
7. **Add**: Refresh token rotation
8. **Deploy**: to production (Vercel, Netlify, AWS, etc.)

## Documentation

See `AUTH_SETUP.md` for:
- Complete API documentation
- Route protection details
- HTTP interceptor example
- Feature descriptions
- Customization guide

## Support

Check:
- Browser console for errors
- Network tab for API responses
- Angular DevTools for component state
- Backend logs for API issues
