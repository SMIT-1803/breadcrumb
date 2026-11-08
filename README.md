# Breadcrumb

**A handoff to your future self.**

When you step away from a task, Breadcrumb helps you remember the details you need to pick it up again. Save a quick note, a link, or a screenshot. Later, ask what you were working on and get a short reminder with your original sources.

**Try it:** [breadcrumb-alpha.vercel.app](https://breadcrumb-alpha.vercel.app)

## How it works

1. Save a thought or screenshot in the web app. On desktop, the [Chrome extension](extension/README.md) can bring the current page's title and link into the save form.
2. Gemini organizes the saved context into a summary and possible next step. Your original note, screenshot, and links remain available.
3. Ask **Where was I?** to find relevant memories. You can also edit, complete, reopen, or delete them.

Your notebook follows your Google account across phone and laptop. Notes and screenshots are private to that account. If Gemini is unavailable, your saved originals remain accessible.

## Built with

Next.js, TypeScript, Tailwind CSS, Supabase, Google Gemini, Vercel, and the Chrome Extensions API. Built for SFU Fall Hacks 2026.

## Run locally

Copy `.env.example` to `.env.local` and add your own Supabase and Gemini values. For a new Supabase project, apply the SQL files in `supabase/migrations/` in filename order and configure Google sign-in.

```bash
npm install
npm run dev
```

The extension is a load-unpacked Chrome build; see its [installation instructions](extension/README.md). See [SUBMISSION.md](SUBMISSION.md) for the project story and demo outline.
