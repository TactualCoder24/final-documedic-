# Quick Start Guide - Supabase Integration

## ✅ What's Been Done

All code changes are complete! Here's what was implemented:

1. **Installed Supabase** - `@supabase/supabase-js` package added
2. **Created Services**:
   - `services/supabase.ts` - Supabase client configuration
   - `services/auth.ts` - New authentication using Supabase Auth
   - `services/dataSupabase.ts` - Complete data layer with all CRUD operations
3. **Updated All Components** - 21 page components now use Supabase
4. **Database Schema** - Complete SQL migration ready in `supabase/migrations/001_initial_schema.sql`

## 🔧 What You Need to Do Now

### Step 1: Get Your Supabase Anon Key

1. Go to your Supabase project: https://pdeoazosrtlgsnkuojve.supabase.co
2. Click **Settings** (gear icon) in the left sidebar
3. Click **API** section
4. Copy the **anon public** key (long string starting with `eyJ...`)

### Step 2: Update Environment Variables

Edit your `.env.local` file and add:

```env
GEMINI_API_KEY=your_existing_key_here
VITE_SUPABASE_URL=https://pdeoazosrtlgsnkuojve.supabase.co
VITE_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

### Step 3: Run the Database Migration

1. In Supabase dashboard, click **SQL Editor** in left sidebar
2. Click "New query"
3. Open `supabase/migrations/001_initial_schema.sql` from your project
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click **Run** (or Ctrl+Enter)
7. Wait for "Success" message

### Step 4: Enable Authentication

1. In Supabase dashboard, click **Authentication** → **Providers**
2. **Email** should already be enabled
3. For **Google OAuth** (optional but recommended):
   - Toggle "Google Enabled" to ON
   - Follow the Google Cloud Console setup instructions
   - Add redirect URI: `https://pdeoazosrtlgsnkuojve.supabase.co/auth/v1/callback`

### Step 5: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 6: Test the Application

1. Open http://localhost:5173
2. Click "Get Started"
3. Sign up with email/password
4. Check your email for confirmation
5. Log in and test:
   - Add a medication
   - Log some vitals
   - Upload a medical record
   - Create a reminder
6. Log out and log back in - data should persist!

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after adding variables

**"Failed to fetch" errors**
- Verify your Supabase project URL is correct
- Check internet connection
- Verify project is "Active" in Supabase dashboard

**Authentication not working**
- Check browser console for specific errors
- Verify email provider is enabled in Supabase Auth settings
- Check spam folder for confirmation email

**Data not saving**
- Check browser console for errors
- Verify migration ran successfully (check Table Editor in Supabase)
- Check Supabase Logs section for errors

## 📊 Verify Setup

In Supabase **Table Editor**, you should see these tables:
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
- care_locations (should have 3 rows of seed data)

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No console errors about missing environment variables
2. ✅ You can sign up and receive confirmation email
3. ✅ You can log in successfully
4. ✅ Data you add persists after logout/login
5. ✅ You can see your data in Supabase Table Editor

## 📝 Next Steps After Setup

Once everything works:
1. Test all major features
2. Invite others to test
3. Monitor usage in Supabase dashboard
4. Consider setting up email templates in Supabase Auth
5. Review and customize RLS policies if needed

---

**Need Help?**
- Check `SUPABASE_SETUP.md` for detailed instructions
- Review Supabase docs: https://supabase.com/docs
- Check browser console for error messages
- Review Supabase project logs
