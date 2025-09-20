# WhatsApp Payment System Guide

This guide explains how the WhatsApp-based payment system works and how to manage course access for users.

## How It Works

### For Users:
1. When users try to access premium/locked content, they see a WhatsApp redirect button
2. Clicking the button opens WhatsApp with a pre-filled message requesting course access
3. Users can then communicate with you directly to complete the payment via UPI/bank transfer
4. Once payment is confirmed, you can grant them full course access through the admin panel

### For Admins:
1. Users will contact you on WhatsApp: **8789449507**
2. After receiving payment via UPI/bank transfer, you can grant access through the admin panel
3. Visit `/admin/course-access` to manage user access
4. Enter the user's Clerk ID and select the course to grant full access

## Configuration

### WhatsApp Number Configuration
Your WhatsApp number `8789449507` has been configured in these files:
- `src/components/LockedModuleContent.tsx`
- `src/components/WhatsAppRedirect.tsx`
- `src/components/PaymentButton.tsx`
- `src/app/exams/[slug]/study/page.tsx`
- `src/app/admin/course-access/page.tsx`

### Admin Access Management

#### API Endpoints:
- **POST** `/api/admin/enable-course-access` - Enable full course access for a user
- **GET** `/api/admin/enable-course-access?examId=<courseId>` - Get all users for a course

#### Admin UI:
- Visit `/admin/course-access` to manage user access
- Select a course to see all enrolled users
- Enable access for users who have completed payment via WhatsApp

#### Required Data for Manual Access:
- User's Clerk ID (format: `user_xxxxxxxxxx`)
- Course/Exam ID
- Payment amount (optional, defaults to course price)

## User Flow

1. **Free Enrollment**: Users can enroll for free to access free modules
2. **Premium Content**: When accessing locked modules, users see WhatsApp redirect
3. **WhatsApp Contact**: Users message you with course purchase request
4. **Payment**: Users pay via UPI/bank transfer outside the platform
5. **Access Grant**: You manually grant access through admin panel
6. **Full Access**: Users can now access all premium content

## Benefits

- **Direct Communication**: Personal interaction with students
- **Flexible Payment**: Accept UPI, bank transfer, or any payment method
- **No Gateway Fees**: Avoid payment gateway charges
- **Better Support**: Direct channel for student queries
- **Manual Control**: Full control over who gets access

## Technical Implementation

### Components Created:
- `WhatsAppRedirect.tsx` - Standalone WhatsApp redirect component
- `LockedModuleContent.tsx` - Modified to use WhatsApp instead of Razorpay
- `PaymentButton.tsx` - Updated to redirect to WhatsApp
- Admin panel at `/admin/course-access` for access management

### API Routes:
- `/api/admin/enable-course-access` - Manage user course access
- Existing enrollment and user access APIs remain unchanged

### Database Changes:
- No schema changes required
- Uses existing Purchase and Enrollment models
- Creates successful purchase records when granting access manually

## Security Notes

- Only admin users can access the course access management panel
- All access grants are logged with payment method "WhatsApp"
- User authentication is still required for course access
- Enrollment is still required before granting premium access

## Troubleshooting

### User Can't Access Premium Content:
1. Check if user is enrolled in the course
2. Verify if purchase record exists with "SUCCESS" status
3. Use admin panel to grant access manually

### WhatsApp Not Opening:
1. Ensure WhatsApp is installed on user's device
2. Check if WhatsApp number is correctly formatted
3. Verify the WhatsApp URL format is correct

### Admin Panel Access Issues:
1. Ensure user has admin role in database
2. Check if user is properly authenticated
3. Verify API endpoints are accessible