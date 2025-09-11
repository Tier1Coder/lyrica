# Password Reset Feature Documentation

## Overview
The Lyrica template includes a complete password reset system that allows users to securely reset their passwords when they forget them. This feature integrates with Supabase's built-in authentication system.

## Features
- ✅ **Forgot Password Form**: User-friendly form to request password reset
- ✅ **Email Integration**: Automatic email sending via Supabase
- ✅ **Secure Reset Links**: Time-limited, secure reset tokens
- ✅ **Password Update**: Secure password change functionality
- ✅ **User Feedback**: Clear success/error messages
- ✅ **Security**: Prevents email enumeration attacks

## Implementation Details

### Frontend Components

#### 1. Login Page Updates
- Added "Forgot your password?" link
- Handles password reset success messages
- Location: `app/(auth)/login/page.tsx`

#### 2. Forgot Password Page
- Email input form
- Client-side validation
- API integration
- Location: `app/forgot-password/page.tsx`

#### 3. Reset Password Page
- New password form
- Password confirmation
- Token validation
- Location: `app/reset-password/page.tsx`

### API Endpoints

#### Password Reset Request
```
POST /api/auth/reset-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Features:**
- Email validation
- User existence check (without revealing if email exists)
- Supabase integration
- Error handling

### User Flow

#### 1. User Forgets Password
1. User clicks "Forgot your password?" on login page
2. Redirected to `/forgot-password`
3. Enters email address
4. Submits form

#### 2. System Processes Request
1. API validates email format
2. Checks if user exists (silently)
3. Calls Supabase `resetPasswordForEmail()`
4. Supabase sends email with reset link

#### 3. User Receives Email
1. Email contains secure reset link
2. Link includes access and refresh tokens
3. Link expires after default time (usually 1 hour)

#### 4. User Resets Password
1. Clicks link in email
2. Redirected to `/reset-password`
3. Enters new password twice
4. Submits form

#### 5. Password Updated
1. System validates new password
2. Updates user password in Supabase
3. Shows success message
4. Redirects to login with success message

## Security Features

### Email Enumeration Protection
- API always returns the same message regardless of whether email exists
- Prevents attackers from discovering valid email addresses

### Token Security
- Uses Supabase's secure JWT tokens
- Tokens are time-limited and single-use
- Automatic cleanup of expired tokens

### Password Requirements
- Minimum 6 characters
- Password confirmation required
- Client-side validation

### Rate Limiting
- Supabase provides built-in rate limiting
- Prevents abuse of password reset functionality

## Configuration

### Environment Variables
No additional environment variables are required. The feature uses existing Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Settings
Ensure your Supabase project has:
1. **Email Templates**: Configure password reset email template
2. **SMTP Settings**: Set up email sending (or use Supabase's default)
3. **Site URL**: Configure your domain for redirect URLs

### Email Template Configuration
In Supabase Dashboard:
1. Go to Authentication → Email Templates
2. Configure "Reset password" template
3. Use `{{ .ConfirmationURL }}` for the reset link

## Usage Examples

### Requesting Password Reset
```javascript
// From forgot-password page
const response = await fetch('/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

const result = await response.json();
// result.message contains success message
```

### Handling Reset Link
```javascript
// From reset-password page
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

## Error Handling

### Common Errors

#### Invalid Email Format
```
Error: Please provide a valid email address
Status: 400
```

#### Email Sending Failed
```
Error: Failed to send password reset email. Please try again.
Status: 500
```

#### Invalid Reset Token
```
Error: Invalid or expired reset link
Status: User redirected with error message
```

#### Password Too Short
```
Error: Password must be at least 6 characters long
Status: 400 (client-side validation)
```

## Testing

### Manual Testing Steps
1. **Test Forgot Password Flow:**
   - Visit `/forgot-password`
   - Enter a valid email
   - Check email for reset link
   - Click link and reset password

2. **Test Invalid Email:**
   - Enter non-existent email
   - Should receive generic success message

3. **Test Expired Link:**
   - Wait for link to expire
   - Try to use expired link
   - Should show error message

4. **Test Password Validation:**
   - Try passwords shorter than 6 characters
   - Try mismatched confirmation passwords
   - Should show appropriate error messages

### Automated Testing
```typescript
// Example test for API endpoint
describe('/api/auth/reset-password', () => {
  it('should send reset email for valid email', async () => {
    const response = await request(app)
      .post('/api/auth/reset-password')
      .send({ email: 'test@example.com' })
      .expect(200);

    expect(response.body.message).toContain('password reset link');
  });
});
```

## Troubleshooting

### Email Not Received
**Possible Causes:**
- Email address is incorrect
- Email is in spam folder
- Supabase email service is not configured
- SMTP settings are incorrect

**Solutions:**
1. Check Supabase email logs
2. Verify SMTP configuration
3. Test with different email providers
4. Check spam/junk folders

### Reset Link Not Working
**Possible Causes:**
- Link has expired (default: 1 hour)
- Link was already used
- Tokens are malformed
- Site URL configuration is incorrect

**Solutions:**
1. Check token expiration settings in Supabase
2. Verify site URL in Supabase configuration
3. Test with fresh reset request
4. Check browser console for errors

### API Errors
**Common Issues:**
- CORS errors
- Network connectivity
- Supabase service issues

**Debug Steps:**
1. Check browser network tab
2. Verify API endpoint URLs
3. Test Supabase connection
4. Check server logs

## Best Practices

### Security
1. **Never Reveal Email Existence**: Always return generic messages
2. **Use HTTPS**: Ensure all password reset links use HTTPS
3. **Token Expiration**: Keep token expiration times reasonable
4. **Rate Limiting**: Implement appropriate rate limiting

### User Experience
1. **Clear Instructions**: Provide clear guidance throughout the flow
2. **Loading States**: Show loading indicators during API calls
3. **Error Messages**: Provide helpful, non-technical error messages
4. **Success Feedback**: Clearly indicate when actions are successful

### Performance
1. **Client-Side Validation**: Validate inputs before API calls
2. **Optimistic Updates**: Provide immediate feedback where appropriate
3. **Error Boundaries**: Handle unexpected errors gracefully
4. **Caching**: Avoid unnecessary API calls

## Future Enhancements

### Planned Features
- **Custom Email Templates**: Branded password reset emails
- **SMS Reset**: Alternative reset method via SMS
- **Password Strength Indicator**: Real-time password strength feedback
- **Reset History**: Track password reset attempts
- **Admin Reset**: Allow admins to reset user passwords
- **Multi-Factor Authentication**: Enhanced security for password resets

### Integration Opportunities
- **Analytics**: Track password reset success/failure rates
- **Notifications**: Push notifications for password changes
- **Audit Logs**: Comprehensive logging of reset activities
- **Compliance**: GDPR-compliant password reset handling

## Support

For issues with the password reset feature:
1. Check this documentation first
2. Verify Supabase configuration
3. Test with Supabase dashboard
4. Check browser developer tools
5. Review server logs for API errors

The password reset system is designed to be secure, user-friendly, and maintainable. It follows industry best practices for password reset functionality.
