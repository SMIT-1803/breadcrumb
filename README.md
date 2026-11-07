# Breadcrumb

A digital sidekick that helps you return to interrupted tasks and ideas.

Save a quick note, optional screenshot and source links. Return later to recover the context you need to resume.

Built for SFU Fall Hacks 2026 — **DIGITAL SIDEKICK**.

## Current status

The app is live at [breadcrumb-alpha.vercel.app](https://breadcrumb-alpha.vercel.app).

- Google sign-in and private notes, links and screenshots.
- Screenshot preview, reload recovery and original-image viewing.
- Gemini organization of saved notes and screenshots, with originals preserved and retry if processing fails.
- **Remind me** for recent memories or questions about saved context, with exact saved source links.
- AI organization runs automatically after saving; the app explains that note/image contents are processed by Gemini.
- Edit original notes, mark memories done/reopen, and confirm deletion with retryable screenshot cleanup.
- Desktop extension source pre-fills the current page title and URL into the normal save flow.

To try it: sign in, save a note or screenshot, then use **Remind me**. Existing unorganized notes have an **Organize memory** action.

89 focused tests pass, along with type, lint and build checks. Browser checks cover real Gemini text/image organization, co-op/coding recall, source links, account switching and a 390px phone layout. Separate physical-phone testing and a real provider-outage recovery test remain unrun; failure and retry behavior has deterministic test coverage.

Stage4 code is implemented and deployed. User testing confirms done/reopen, deletion, installed extension handoff and phone/laptop access. User testing found duplicate organization UI after save/edit; a React DOM regression reproduces it and the fix passes. The user retested save/edit and confirmed the fix works. Agent browser verification remains blocked.

Unfinished deletion cleanup can be retried from the same browser; recovery tickets are stored separately for each account and memory.

Install the extension using [these instructions](extension/README.md). It is a load-unpacked hackathon build, not a Chrome Web Store listing.

 Search uses database text matching with small query expansions; it is not unrestricted semantic search or a general chatbot. Closing a tab can interrupt AI processing; the saved original remains available for retry.

Built with Next.js, TypeScript, Tailwind CSS, Supabase and Google Gemini.

## Configuration

Copy `.env.example` to `.env.local` and supply your own provider values locally. Never commit credential files. Install with `npm install`, then run `npm run dev`. Use `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` for checks. Node.js 24 is the development runtime.

## Database

Apply the SQL files in `supabase/migrations/` in filename order to a dedicated Supabase project. The rollback-only test in `supabase/tests/private_memories.sql` checks ownership isolation, validation and revision behavior. It uses synthetic accounts and must be run as the project database administrator.

SQL storage metadata checks do not replace actual Storage API upload/download/delete testing.

## Submission and demo

See [SUBMISSION.md](SUBMISSION.md) for the project story, technology tags, demo walkthrough and remaining submission items.
