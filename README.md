# Breadcrumb

A digital sidekick that helps you return to interrupted tasks and ideas.

Save a quick note, optional screenshot and source links. Return later to recover the context you need to resume.

Built for SFU Fall Hacks 2026 — **DIGITAL SIDEKICK**.

## Current status

Service configuration and private database policies are prepared and checked. The web application is not implemented yet.

Planned stack: Next.js, TypeScript, Tailwind CSS, Supabase and Google Gemini.

The planned web app includes private Google sign-in, text/screenshot/link capture, grounded AI reminders and basic memory management. A minimal desktop extension will pass the current page title and URL into the same web capture flow.

## Configuration

Copy `.env.example` to `.env.local` and supply your own provider values locally. Never commit credential files. Application install/run instructions will be added with the first working version.

## Database

Apply the SQL files in `supabase/migrations/` in filename order to a dedicated Supabase project. The rollback-only test in `supabase/tests/private_memories.sql` checks ownership isolation, validation and revision behavior. It uses synthetic accounts and must be run as the project database administrator.

SQL storage metadata checks do not replace actual Storage API upload/download/delete testing.
