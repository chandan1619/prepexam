# Course Enrollment and Payment System

This document describes the course enrollment and payment system implemented in the PrepExam application.

## Overview

The system allows users to:
1. **Free Enrollment**: Users can enroll in any course for free to access basic content
2. **Module-based Access Control**: Some modules are free, others require payment
3. **Payment Integration**: Razorpay integration for UPI and card payments
4. **Progressive Access**: Users start with free content and can upgrade to unlock premium modules

## System Architecture

### Database Schema

#### New Models Added:
- **Enrollment**: Tracks user enrollment in courses
- **UserProgress**: Tracks user progress through modules
- **Enhanced Purchase**: Extended with payment tracking fields

#### Key Fields:
- `Module.isFree`: Boolean flag to mark free modules
- `Module.order`: Order of modules in the course
- `Purchase.paymentStatus`: PENDING, SUCCESS, FAILED, REFUNDED
- `Purchase.paymentId`: Razorpay payment ID
- `Purchase.orderId`: Razorpay order ID

### API Endpoints

#### Enrollment APIs
- `GET /api/enrollment` - Get user's enrollments
- `POST /api/enrollment` - Enroll in a course (always free)

#### Payment APIs
- `POST /api/payment/create-order` - Create Razorpay payment order
- `POST /api/payment/verify` - Verify payment and create enrollment

#### Access Control APIs
- `GET /api/user/access?examId=<id>&moduleId=<id>` - Check user access to content

### User Flow

#### 1. Course Discovery
- Users browse courses on `/exams`
- Course cards show pricing and enrollment options

#### 2. Free Enrollment
- Users can always enroll for free
- Free enrollment gives access to free modules only
- Paid modules show as locked with upgrade prompts

#### 3. Payment Flow
- Users click "Upgrade" to unlock premium modules
- Razorpay payment gateway handles UPI/card payments
- Successful payment unlocks all premium content

#### 4. Content Access
- Free modules: Accessible to enrolled users
- Premium modules: Require both enrollment AND payment
- Study page shows locked content with upgrade prompts

## Configuration

### Environment Variables Required

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id

# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Setting Up Test Data

Run the test data setup script:

```bash
node scripts/setup-test-data.js
```

This creates a test course with:
- 1 free introductory module
- 2 premium modules requiring payment
- Sample content in each module

## Key Components

### Frontend Components

#### PaymentButton (`src/components/PaymentButton.tsx`)
- Handles enrollment and payment flows
- Shows different states: Not enrolled, Enrolled (free), Enrolled (premium)
- Integrates with Razorpay for payments

#### LockedModuleContent (`src/components/LockedModuleContent.tsx`)
- Displays when users try to access premium content
- Shows upgrade benefits and pricing
- Handles payment initiation

### Backend Logic

#### Access Control (`src/app/api/user/access/route.ts`)
- Determines user access to courses and modules
- Checks enrollment status and payment status
- Returns granular access information

#### Payment Processing (`src/app/api/payment/`)
- Creates Razorpay orders
- Verifies payment signatures
- Updates user access after successful payment

## Module Access Rules

1. **Not Enrolled**: No access to any content
2. **Enrolled (Free)**: Access to free modules only
3. **Enrolled + Paid**: Access to all modules

### Module Types
- **Free Modules**: `isFree: true` - Accessible to enrolled users
- **Premium Modules**: `isFree: false` - Require payment to access

## Payment Integration

### Razorpay Features Used
- **Order Creation**: Server-side order creation with metadata
- **Payment Processing**: Client-side payment collection
- **Signature Verification**: Server-side payment verification
- **Multiple Payment Methods**: UPI, Cards, Net Banking, Wallets

### Payment Flow
1. User clicks upgrade button
2. Server creates Razorpay order
3. Client opens Razorpay checkout
4. User completes payment
5. Server verifies payment signature
6. User access is updated
7. User redirected to success/failure page

## Security Considerations

1. **Payment Verification**: All payments verified server-side using Razorpay signatures
2. **Access Control**: Module access checked on every request
3. **Authentication**: All APIs require user authentication via Clerk
4. **Data Validation**: Input validation on all API endpoints

## Testing the System

### Manual Testing Steps

1. **Setup Environment**:
   - Configure Razorpay test credentials
   - Run database migrations
   - Setup test data

2. **Test Free Enrollment**:
   - Browse to a course page
   - Click "Start Learning (Free)"
   - Verify enrollment and access to free modules

3. **Test Premium Upgrade**:
   - Try to access a premium module
   - Click "Upgrade Now"
   - Complete test payment
   - Verify access to all modules

4. **Test Access Control**:
   - Verify locked modules show upgrade prompts
   - Verify free modules are accessible
   - Verify premium modules unlock after payment

### Test Payment Credentials

Use Razorpay test mode credentials:
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## Troubleshooting

### Common Issues

1. **Razorpay Not Configured**: Check environment variables
2. **Payment Verification Failed**: Check webhook signatures
3. **Module Access Issues**: Verify enrollment and payment status
4. **Database Errors**: Check migration status

### Debug Endpoints

- `GET /api/user/access?examId=<id>` - Check user access status
- `GET /api/enrollment` - Check user enrollments
- `GET /api/user/purchases` - Check payment history

## Future Enhancements

1. **Subscription Model**: Monthly/yearly subscriptions
2. **Course Bundles**: Multiple courses in one purchase
3. **Discount Coupons**: Promotional pricing
4. **Refund System**: Automated refund processing
5. **Analytics**: Payment and enrollment analytics
6. **Mobile App**: React Native integration

## Support

For issues related to:
- **Payments**: Check Razorpay dashboard and logs
- **Access Control**: Verify database enrollment/purchase records
- **Authentication**: Check Clerk user management
- **General Issues**: Check application logs and error messages