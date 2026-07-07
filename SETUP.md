# 🚀 GoFarm Pro - Complete Setup Guide

**Thank you for purchasing GoFarm Pro!** This guide will help you set up and configure your agricultural e-commerce platform.

📧 **Need Help?** Email us at reactjsbd@gmail.com with your license key.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Environment Configuration](#environment-configuration)
4. [Service Setup Guides](#service-setup-guides)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

Before starting, ensure you have installed:

- **Node.js** 18.0 or higher → [Download](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm** (we recommend pnpm)
- **Git** → [Download](https://git-scm.com/)

### Required Accounts

You'll need free accounts for the following services:

1. **Sanity CMS** → [sanity.io](https://www.sanity.io/)
2. **Clerk Authentication** → [clerk.com](https://clerk.com/)
3. **Stripe Payments** → [stripe.com](https://stripe.com/)
4. **Firebase** → [console.firebase.google.com](https://console.firebase.google.com/)
5. **Gmail/Google Cloud** (for emails) → [console.cloud.google.com](https://console.cloud.google.com/)

---

## Installation Steps

### 📦 After Purchase

You should have received:

1. ✅ Download link for the source code (ZIP file)
2. ✅ License key (keep this safe)
3. ✅ Welcome email with this guide

### 1️⃣ Extract the Package

```bash
# Extract the downloaded ZIP file
unzip gofarm-v1.0.0.zip

# Navigate to the project directory
cd gofarm
```

### 2️⃣ Install Dependencies

Choose your preferred package manager:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm (recommended)
pnpm install
```

### 3️⃣ Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Now you need to fill in the values. Follow the sections below for each service.

---

## Environment Configuration

### 📁 Base Configuration

```bash
# For local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For production (update after deployment)
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## Service Setup Guides

### 🎨 Sanity CMS Setup

**Step 1: Create Sanity Project**

```bash
npm create sanity@latest -- --env=.env --create-project "gofarm Pro" --dataset production
```

Follow the prompts to:

- Sign in or create Sanity account
- Create new project
- Choose dataset name (use "production")

**Step 2: Get Your Credentials**

1. Go to [Sanity Management](https://www.sanity.io/manage)
2. Select your project
3. Copy **Project ID** from settings

**Step 3: Create API Tokens**

1. Navigate to **API** section
2. Click **Add API token**
3. Create two tokens:
   - **Write Token**: Name it "Editor", select "Editor" permissions
   - **Read Token**: Name it "Viewer", select "Viewer" permissions

**Step 4: Update .env**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
SANITY_API_TOKEN=your_write_token_here
SANITY_API_READ_TOKEN=your_read_token_here
```

**Step 5: Import Sample Data (Recommended)**

The package includes `seed.tar.gz` with pre-configured sample data including:

- ✅ Product categories (Vegetables, Fruits, Dairy, etc.)
- ✅ Product variants (Organic, Fresh, Frozen, etc.)
- ✅ Sample products with images
- ✅ Brands and blog posts
- ✅ Store locations

Import the seed data:

```bash
# Import to production dataset
npx sanity dataset import seed.tar.gz production

# Or import to a different dataset
npx sanity dataset import seed.tar.gz development
```

**Note:** This will populate your Sanity CMS with ready-to-use content. You can customize or delete this data later from the Sanity Studio.

---

## Database Setup & Sample Data

### Option 1: Quick Start with Sample Data (Recommended)

The fastest way to get your store up and running is to import the included sample data:

```bash
# Import seed data to production dataset
npx sanity dataset import seed.tar.gz production
```

**What's Included in seed.tar.gz:**

- ✅ **15+ Product Categories** (Vegetables, Fruits, Dairy, Meat, Grains, etc.)
- ✅ **10+ Product Variants** (Organic, Fresh, Frozen, Dried, etc.)
- ✅ **50+ Sample Products** with high-quality images and complete details
- ✅ **Brand Directory** with logos and descriptions
- ✅ **Blog Posts** with sample agricultural content
- ✅ **Store Locations** with addresses and coordinates
- ✅ **Product Reviews** and ratings
- ✅ **Banners** and promotional content

**After Importing:**

1. Access Sanity Studio at `http://localhost:3000/studio`
2. Review the imported content
3. Customize products, prices, and descriptions
4. Delete sample items you don't need
5. Add your own products and branding

### Option 2: Start from Scratch

If you prefer to build your catalog manually:

1. Start dev server: `pnpm dev`
2. Navigate to `http://localhost:3000/studio`
3. Sign in with your Sanity account
4. Create content in this recommended order:

**Step 1: Product Variants**

- Create variant types (e.g., "Vegetables", "Fruits", "Dairy")
- Set display order (lower numbers appear first)
- Upload representative images

**Step 2: Categories**

- Add product categories
- Mark featured categories for homepage
- Add SEO-friendly descriptions

**Step 3: Brands**

- Add brand information
- Upload brand logos

**Step 4: Products**

- Create products with complete information
- Add multiple images per product
- Set pricing, stock, and discounts
- Link to variants, categories, and brands

**Step 5: Blog & Other Content** (Optional)

- Add blog posts for SEO
- Create store locations
- Set up promotional banners

### Backing Up Your Data

To export/backup your Sanity data:

```bash
# Export production dataset
sanity dataset export production ./my-backup.tar.gz

# Export with all assets (images, files)
sanity dataset export production ./my-backup.tar.gz --assets
```

---

### 🔐 Clerk Authentication Setup

**Step 1: Create Clerk Application**

1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Sign up or log in
3. Click **Add application**
4. Choose **Next.js** as framework
5. Name your application "gofarm Pro"

**Step 2: Configure Authentication**

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email** authentication
3. Configure other options as needed

**Step 3: Set Up Paths**

1. Go to **Paths** section
2. Set the following:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/`
   - **After sign-up URL**: `/`

**Step 4: Get API Keys**

1. Go to **API Keys** section
2. Copy both keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

**Step 5: Update .env**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

### 💳 Stripe Payment Setup

**Step 1: Create Stripe Account**

1. Visit [Stripe](https://stripe.com/)
2. Sign up for account
3. Complete business verification (can use test mode initially)

**Step 2: Get API Keys**

1. Go to **Developers** → **API Keys**
2. Copy **Secret Key** (starts with `sk_test_` for test mode)

**Step 3: Set Up Webhooks**

**For Local Development:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret (starts with `whsec_`)

**For Production:**

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy webhook secret

**Step 4: Update .env**

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 🔥 Firebase Setup

**Step 1: Create Firebase Project**

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter project name "gofarm Pro"
4. Follow setup wizard

**Step 2: Add Web App**

1. In project overview, click **Web** icon (</>)
2. Register app with name "gofarm Web"
3. Copy the config object

**Step 3: Enable Firestore**

1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Choose location closest to users

**Step 4: Update .env**

Copy values from Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...
```

---

### 📧 Email Service Setup (Gmail OAuth2)

**Step 1: Enable Gmail API**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Gmail API**

**Step 2: Create OAuth Credentials**

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen (internal or external)
4. Application type: **Web application**
5. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Copy **Client ID** and **Client Secret**

**Step 3: Get Refresh Token**

1. Visit [OAuth Playground](https://developers.google.com/oauthplayground)
2. Click settings (gear icon)
3. Check **Use your own OAuth credentials**
4. Enter your Client ID and Secret
5. Select **Gmail API v1** → **https://mail.google.com**
6. Click **Authorize APIs**
7. Sign in with your Gmail account
8. Click **Exchange authorization code for tokens**
9. Copy the **Refresh token**

**Step 4: Update .env**

```bash
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REFRESH_TOKEN=1//04xxx
SENDER_EMAIL_ADDRESS=your-email@gmail.com
```

---

## Database Setup

### Option 1: Import Sample Data (Recommended for Quick Start)

The fastest way to get started is to import the included sample data:

```bash
# Import seed data to production dataset
npx sanity dataset import seed.tar.gz production
```

This will import:

- ✅ **15+ Product Categories** (Vegetables, Fruits, Dairy, Meat, etc.)
- ✅ **10+ Product Variants** (Organic, Fresh, Frozen, etc.)
- ✅ **50+ Sample Products** with images and full details
- ✅ **Brand Directory** with logos
- ✅ **Blog Posts** with sample content
- ✅ **Store Locations** with maps
- ✅ **Product Reviews** and ratings

**After Import:**

1. Access Sanity Studio at `http://localhost:3000/studio`
2. Review and customize the imported content
3. Delete sample data you don't need
4. Add your own products and information

### Option 2: Manual Setup (Start from Scratch)

If you prefer to start with a clean database:

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/studio`
3. Sign in with your Sanity account
4. Create content in this order:

**Step 1: Create Product Variants**

- Go to **Product Variants** section
- Add variants like "Vegetables", "Fruits", "Dairy", etc.
- Set display order (lower numbers appear first)
- Upload variant images

**Step 2: Create Categories**

- Go to **Categories** section
- Add categories (e.g., "Organic Vegetables", "Fresh Fruits")
- Set featured categories for homepage
- Add category descriptions and images

**Step 3: Create Brands**

- Go to **Brands** section
- Add brand information
- Upload brand logos

**Step 4: Add Products**

- Go to **Products** section
- Create products with full details:
  - Name, description, and images
  - Pricing and discount information
  - Stock quantity
  - Link to variant, categories, and brand
  - Add product specifications
  - Set product status (new, hot, featured)

**Step 5: Create Blog Posts (Optional)**

- Add blog content for SEO and engagement

**Step 6: Add Store Locations (Optional)**

- Add physical store locations with maps

### Exporting Your Data

To backup or export your Sanity data:

```bash
# Export production dataset
sanity dataset export production ./my-backup.tar.gz

# Export with assets
sanity dataset export production ./my-backup.tar.gz --assets
```

---

## Running the Application

### Development Mode

```bash
# Start development server with Turbopack
npm run dev

# Or with other package managers
pnpm dev
yarn dev
```

Access the application:

- **Frontend**: http://localhost:3000
- **Sanity Studio**: http://localhost:3000/studio

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Other Scripts

```bash
# Run linter
npm run lint

# Generate Sanity types
npm run typegen
```

---

## Admin Configuration

### Set Admin Email

Update `.env` with your admin email:

```bash
NEXT_PUBLIC_ADMIN_EMAIL=[your-email@example.com]
```

### Access Admin Panel

1. Sign in with the admin email
2. Navigate to `/admin`
3. Access all admin features

---

## Deployment

### Deploy to Vercel (Recommended)

**Step 1: Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

**Step 2: Deploy on Vercel**

1. Visit [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`

**Step 3: Add Environment Variables**

Add ALL environment variables from your `.env` file in Vercel dashboard

**Step 4: Update URLs**

After deployment, update these:

```bash
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

**Step 5: Update External Services**

1. **Clerk**: Add production domain in dashboard
2. **Stripe**: Create production webhook
3. **Sanity**: Add CORS origin in settings

---

## Troubleshooting

### Common Issues

**1. Sanity Studio Not Loading**

```bash
# Regenerate Sanity types
npm run typegen

# Clear cache and rebuild
rm -rf .next
npm run build
```

**2. Clerk Authentication Errors**

- Verify API keys are correct
- Check redirect URLs match
- Ensure domain is added in Clerk dashboard

**3. Stripe Webhooks Not Working**

Local development:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Production:

- Verify webhook URL is correct
- Check webhook secret matches
- Ensure events are selected

**4. Environment Variables Not Loading**

- Restart dev server after changing `.env`
- Check for typos in variable names
- Ensure no quotes around values (except multi-word strings)

**5. Build Errors**

```bash
# Clear all caches
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

## Support

### 📧 Getting Help

**Your purchase includes 1 year of priority email support!**

- **Technical Issues**: reactjsbd@gmail.com (include license key)
- **Pre-Deployment Questions**: Check documentation first
- **Custom Development**: Available at additional cost
- **Response Time**: 24 hours (Monday-Friday)

### 📚 Resources

- **Documentation**: This guide + README.md
- **Video Tutorials**: [YouTube Channel](https://youtube.com/@reactjsbd)
- **Updates**: Sent via email when available

### 🔄 Getting Updates

Updates are included for 1 year from purchase date:

1. You'll receive email notification of updates
2. Download new version from provided link
3. Review changelog for breaking changes
4. Test in development before updating production

**Extended Updates:** $49/year after first year (optional)

---

## Next Steps

After successful setup:

1. ✅ **Activate Your License** - Add your license key to `.env`:
   ```bash
   LICENSE_KEY=your-license-key-here
   ```
2. ✅ Add products in Sanity Studio
3. ✅ Customize company information in `.env`
4. ✅ Test payment flow with Stripe test cards
5. ✅ Configure email templates
6. ✅ Set up admin account
7. ✅ Deploy to production

### 📧 Registration (Optional but Recommended)

Register your installation to receive:

- Update notifications
- Security alerts
- Tips and best practices

Email us at reactjsbd@gmail.com with:

- Your license key
- Domain name (when deployed)
- Contact email

---

<div align="center">

**Need Help?** Check out our [comprehensive README](./README.md) or contact support.

**Ready for Production?** Consider upgrading to [Premium Version](https://buymeacoffee.com/reactbd) for advanced features!

</div>
