# Vercel Deployment Guide

## Quick Deployment Steps

### 1. Login to Vercel

First, you need to authenticate with Vercel:

```bash
vercel login
```

This will open a browser window for you to log in with your Vercel account.

### 2. Deploy to Vercel

Once logged in, deploy your project:

```bash
# For preview deployment (recommended first)
vercel

# Or for production deployment
vercel --prod
```

### 3. Set Environment Variables

After deployment, you need to add your environment variables in Vercel Dashboard:

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Environment Variables:

```
GEMINI_API_KEY=your_gemini_api_key

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Optional Environment Variables:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 4. Redeploy After Adding Environment Variables

After adding environment variables, you need to redeploy:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel Dashboard.

## Project Configuration

The project includes a `vercel.json` configuration file that:
- Sets the build command: `npm run build`
- Sets the output directory: `dist`
- Configures SPA routing with rewrites
- Sets the framework to Vite

## Important Notes

1. **Environment Variables**: Make sure all environment variables are set in Vercel Dashboard
2. **Build Output**: The build creates a `dist` folder with the production files
3. **SPA Routing**: The configuration includes rewrites to handle client-side routing
4. **Firebase**: The app will work in demo mode if Firebase env vars are not set
5. **Gemini AI**: AI features will fall back to rule-based logic if API key is not set

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel Dashboard

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_` for Vite projects
- Redeploy after adding environment variables
- Check variable names match exactly

### Firebase Connection Issues
- Verify Firebase environment variables are set correctly
- Check Firebase project settings
- App will run in demo mode if Firebase is not configured

## Deployment URLs

After deployment, Vercel will provide:
- **Preview URL**: For each deployment (e.g., `project-name-abc123.vercel.app`)
- **Production URL**: Your custom domain or `project-name.vercel.app`

## Continuous Deployment

To enable automatic deployments:
1. Connect your Git repository to Vercel
2. Push to your main branch to trigger deployments
3. Preview deployments are created for pull requests

