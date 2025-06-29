# Sunday Reflections

A secure, weekly self-discovery journal application built with Next.js and Supabase. Based on the "1 in 60 rule" philosophy, this app helps you stay on course through consistent weekly reflection and course correction.

## 🌟 Features

### Core Functionality
- **Weekly Reflections**: Answer 7 thoughtfully crafted questions every Sunday
- **Smart Scheduling**: Reflections automatically lock after Monday midnight to maintain weekly rhythm
- **End-to-End Encryption**: Your reflections are encrypted with your personal passphrase for complete privacy
- **Draft System**: Save drafts and continue later before completing your reflection
- **Update Completed Reflections**: Edit completed reflections with a dedicated update mode

### User Experience
- **Beautiful UI**: Modern, responsive design with dark/light theme support
- **Progress Tracking**: Visual progress indicators and completion status
- **Export Options**: Download reflections as PDF, text, or JSON files
- **Timezone Support**: Automatic timezone detection and customizable settings
- **Gentle Reminders**: Optional email and push notification preferences

### Security & Privacy
- **Client-Side Encryption**: All reflection content is encrypted before storage
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **Row Level Security**: Database-level security policies protect user data
- **Passphrase Protection**: Only you can decrypt your reflections

## 🎯 The 7 Weekly Questions

1. **What has worked well?** - Reflect on recent successes to identify what to continue
2. **What didn't work so well?** - Evaluate setbacks to understand what needs improvement
3. **How can I apply what I have learned (actions)?** - Determine actionable steps for the future
4. **How much of my day was spent doing things I actively enjoyed?** - Assess time alignment with fulfillment
5. **How'd that compare to the week before?** - Track enjoyment trends week-to-week
6. **What would you do if you knew you could not fail?** - Uncover bold aspirations
7. **When are you going to get out of your comfort zone?** - Encourage growth opportunities

## 🛠 Tech Stack

- **Frontend**: Next.js 13 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Encryption**: CryptoJS for client-side encryption
- **Export**: jsPDF for PDF generation
- **Icons**: Lucide React
- **Deployment**: Static export ready

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Basic knowledge of React/Next.js

## 🚀 Step-by-Step Setup Guide

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd sunday-reflections

# Install dependencies
npm install
```

### 2. Set Up Supabase Project

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create the project
   - Wait for the project to be ready

2. **Get Your Project Credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key

3. **Run Database Migrations**:
   - Go to SQL Editor in your Supabase dashboard
   - Run the first migration (`supabase/migrations/20250629143057_green_brook.sql`):
   ```sql
   -- Copy and paste the entire content of the green_brook.sql file
   ```
   - Run the second migration (`supabase/migrations/20250629143105_dusty_cave.sql`):
   ```sql
   -- Copy and paste the entire content of the dusty_cave.sql file
   ```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

### 4. Configure Authentication

In your Supabase dashboard:

1. **Go to Authentication → Settings**
2. **Disable email confirmation** (for development):
   - Set "Enable email confirmations" to OFF
3. **Configure Site URL**:
   - Add `http://localhost:3000` to allowed origins
   - For production, add your actual domain

### 5. Test Database Setup

Verify your database is set up correctly:

1. Go to Table Editor in Supabase
2. You should see two tables: `profiles` and `reflections`
3. Check that RLS (Row Level Security) is enabled on both tables

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 7. Test the Application

1. **Sign Up**: Create a new account
2. **Set Passphrase**: Choose a secure passphrase for encryption
3. **Create Reflection**: Start your first weekly reflection
4. **Test Features**: Try saving drafts, completing reflections, and exporting

## 🏗 Project Structure

```
sunday-reflections/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication page
│   ├── dashboard/         # Main dashboard
│   ├── reflect/           # Reflection form
│   ├── settings/          # User settings
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── home/              # Homepage components
│   ├── reflection/        # Reflection form components
│   ├── settings/          # Settings components
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── PassphraseContext.tsx # Passphrase management
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication functions
│   ├── crypto.ts          # Encryption/decryption
│   ├── export.ts          # Export functionality
│   ├── profile.ts         # User profile management
│   ├── reflections.ts     # Reflection CRUD operations
│   └── supabase.ts        # Supabase client
└── supabase/
    └── migrations/        # Database migrations
```

## 🔒 Security Features

### Client-Side Encryption
- All reflection content is encrypted using AES encryption before being sent to the database
- Encryption key is derived from your passphrase using PBKDF2 with 10,000 iterations
- Only you can decrypt your reflections with your passphrase

### Database Security
- Row Level Security (RLS) ensures users can only access their own data
- Foreign key constraints maintain data integrity
- Soft deletes prevent accidental data loss

### Authentication
- Secure email/password authentication via Supabase Auth
- Session management handled automatically
- Protected routes require authentication

## 📱 Usage Guide

### Creating Your First Reflection

1. **Sign up** and verify your email (if enabled)
2. **Set a secure passphrase** - remember this, it cannot be recovered!
3. **Navigate to the current week's reflection**
4. **Answer the 7 questions** at your own pace
5. **Save drafts** as you go
6. **Complete the reflection** when all questions are answered

### Managing Reflections

- **View Past Reflections**: Access all your previous reflections from the dashboard
- **Update Completed Reflections**: Click "Update Reflection" to edit completed reflections
- **Export Reflections**: Download individual reflections as PDF, text, or JSON
- **Delete Reflections**: Permanently remove reflections you no longer want

### Settings & Preferences

- **Timezone**: Set your timezone for accurate reflection locking
- **Notifications**: Configure email reminders and push notifications
- **Theme**: Toggle between light and dark modes

## 🚀 Deployment

### Static Export (Recommended)

This project is configured for static export:

```bash
# Build for production
npm run build

# The output will be in the 'out' directory
# Deploy the 'out' directory to any static hosting service
```

### Deployment Platforms

- **Netlify**: Drag and drop the `out` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Upload the `out` folder contents
- **Any static hosting service**

### Environment Variables for Production

Make sure to set your production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 Customization

### Adding New Questions

1. Update `REFLECTION_QUESTIONS` in `lib/reflections.ts`
2. Update the `ReflectionAnswers` interface
3. Update encryption/decryption logic if needed

### Styling Changes

- Modify Tailwind classes in components
- Update the theme in `app/globals.css`
- Customize shadcn/ui components in `components/ui/`

### Adding Features

- Create new pages in the `app/` directory
- Add new components in `components/`
- Extend the database schema with new migrations

## 🐛 Troubleshooting

### Common Issues

1. **"supabaseUrl is required" error**:
   - Check your `.env.local` file exists and has correct values
   - Restart the development server after adding environment variables

2. **Database connection issues**:
   - Verify your Supabase project is active
   - Check that migrations have been run
   - Ensure RLS policies are in place

3. **Encryption/decryption errors**:
   - Verify the passphrase is correct
   - Check that the encrypted content is valid JSON

4. **Authentication issues**:
   - Check Supabase Auth settings
   - Verify site URL configuration
   - Ensure email confirmation settings match your setup

### Getting Help

- Check the browser console for detailed error messages
- Review the Supabase dashboard for database issues
- Ensure all environment variables are set correctly

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Inspired by Codie Sanchez's "1 in 60 rule" philosophy
- Built with the amazing Next.js and Supabase ecosystems
- UI components from shadcn/ui
- Icons from Lucide React