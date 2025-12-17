# Supabase Setup Guide for DocuMedic

This guide will walk you through setting up Supabase for your DocuMedic application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the project details:
   - **Name**: DocuMedic (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select "Free" for development
3. Click "Create new project"
4. Wait 2-3 minutes for your project to be provisioned

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear) in the left sidebar
2. Navigate to **API** section
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. **Copy both of these values** - you'll need them in the next step

## Step 4: Configure Environment Variables

1. In your project root (`c:\Users\apaar\Downloads\documedic for`), you should see a `.env.example` file
2. Create a new file called `.env.local` (if it doesn't exist)
3. Add the following content to `.env.local`:

```env
# Gemini AI API Key (keep your existing key)
GEMINI_API_KEY=your_existing_gemini_key

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Replace the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your actual values from Step 3
5. **Important**: Never commit `.env.local` to version control (it's already in `.gitignore`)

## Step 5: Run the Database Migration

1. In your Supabase project dashboard, click on the **SQL Editor** icon in the left sidebar
2. Click "New query"
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy the entire contents of that file
5. Paste it into the Supabase SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. Wait for the migration to complete (should take 10-30 seconds)
8. You should see "Success. No rows returned" message

## Step 6: Verify the Setup

1. In Supabase dashboard, click on **Table Editor** in the left sidebar
2. You should see all your tables listed:
   - profiles
   - medical_records
   - medications
   - vitals
   - appointments
   - reminders
   - symptoms
   - food_logs
   - water_intake
   - test_results
   - allergies
   - health_issues
   - immunizations
   - preventive_care
   - care_plans
   - growth_records
   - questionnaires
   - after_visit_summaries
   - tests_and_procedures
   - community_posts
   - care_locations

3. Click on **care_locations** table - you should see 3 pre-populated rows (seed data)

## Step 7: Configure Authentication

1. In Supabase dashboard, click on **Authentication** in the left sidebar
2. Click on **Providers**
3. **Enable Email provider** (should be enabled by default)
4. **Enable Google provider** (optional, but recommended):
   - Toggle "Google Enabled" to ON
   - You'll need to provide Google OAuth credentials:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new project or select existing
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase
5. Click "Save"

## Step 8: Test the Application

1. Stop your development server if it's running (Ctrl+C in terminal)
2. Restart it:
   ```bash
   npm run dev
   ```
3. Open your browser to the local development URL (usually `http://localhost:5173`)
4. Try to sign up with a new account:
   - Click "Get Started"
   - Use email/password signup
   - You should receive a confirmation email (check spam folder)
   - Confirm your email
   - Log in

## Step 9: Verify Data Persistence

1. After logging in, try adding some data:
   - Add a medication
   - Log some vitals
   - Create a reminder
2. Log out and log back in
3. Your data should still be there!
4. Check the Supabase dashboard **Table Editor** to see your data in the database

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and has the correct variable names
- Restart your development server after adding environment variables
- Check that variable names start with `VITE_` (required for Vite)

### "Failed to fetch" or network errors
- Check that your Supabase project URL is correct
- Verify your internet connection
- Check Supabase project status (should be "Active" in dashboard)

### Authentication not working
- Verify email provider is enabled in Supabase Auth settings
- Check browser console for specific error messages
- For Google OAuth, verify redirect URI is correctly configured

### Data not saving
- Check browser console for error messages
- Verify RLS policies are correctly applied (run the migration again if needed)
- Check Supabase logs in dashboard under **Logs** section

### Email confirmation not received
- Check spam/junk folder
- In Supabase dashboard, go to **Authentication** > **Settings**
- Temporarily disable "Enable email confirmations" for testing
- Re-enable it for production

## Next Steps

Once everything is working:

1. **Test all features** to ensure data is saving correctly
2. **Invite team members** to test the application
3. **Monitor usage** in Supabase dashboard
4. **Set up backups** (automatic in Supabase, but verify in Settings)
5. **Review RLS policies** to ensure data security
6. **Consider upgrading** to a paid plan if you exceed free tier limits

## Free Tier Limits

Supabase free tier includes:
- 500MB database space
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth
- Unlimited API requests

Perfect for development and small-scale production!

## Support

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [https://discord.supabase.com](https://discord.supabase.com)
- **GitHub Issues**: Report bugs in your repository

---

**Congratulations!** Your DocuMedic application is now powered by Supabase! 🎉
