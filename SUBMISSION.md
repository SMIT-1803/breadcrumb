# Breadcrumb submission and demo

## Links

- Live app: https://breadcrumb-alpha.vercel.app/
- Public source: https://github.com/SMIT-1803/breadcrumb
- Extension source and installation: [extension/README.md](extension/README.md)

## Elevator pitch

Pick up where you left off—with your thoughts, screenshots and links remembered.

## Inspiration

An interruption can make you lose the details of what you were doing. You may remember that you wanted to apply for co-op jobs, but forget which companies or postings you found. The same thing happens with an unfinished coding idea or a thought that arrives while you are away from your laptop. Breadcrumb saves those details so returning to work takes less effort.

## What it does

Save a quick note, an optional screenshot and links. Gemini organizes the saved context and helps you recall it when you ask “What was I working on?” or search for something specific. The original note, screenshot and exact saved links stay available. You can use the same account on your phone and laptop, edit memories, mark them done, reopen them or delete them. A small desktop extension brings the current page title and link into the save form.

## How we built it

We built the web app with Next.js, React, TypeScript and Tailwind CSS. Supabase handles Google sign-in, private notes and screenshot storage. Google Gemini reads saved text and images and writes short reminders from that context. Vercel hosts the app. The extension opens the same web save flow rather than needing a separate account.

## Challenges we ran into

Saving had to work even when AI processing failed. We save the original first and allow organization to be retried. We also had to protect each account’s notes, preserve drafts through sign-in, and stop old AI responses from replacing newer edits. User testing caught repeated organization panels after edits; we reproduced that rendering bug in a test and fixed it.

## Accomplishments that we're proud of

The complete journey works across phone and laptop: save context, return later, recover a reminder and open the original source. Screenshots do not require a long explanation before saving, and a useful note does not require a screenshot. The interface keeps capture short and gives users control over their saved memories.

## What we learned

Remembering a task name is different from remembering enough context to resume it. Screenshots preserve visible details, while a short note can preserve the user's intention. AI works best here when it stays close to the saved evidence and leaves the originals accessible. Testing the actual update flow matters as much as testing the saved data.

## What's next for BreadCrumb

Improve search relevance, make interrupted AI processing easier to recover, and explore a smoother extension installation experience. These are future ideas rather than features included in this submission.

## Built with

Next.js, React, TypeScript, Tailwind CSS, Supabase, Google Gemini API, Vercel, Chrome Extensions API.

## Demo walkthrough

This is a flexible outline; adjust it to the organizer's actual time limit.

1. Explain the problem: “I found jobs to apply for, left to cook lunch, and forgot the specific pages.”
2. On a public careers webpage, click Breadcrumb's extension. Add “Apply after lunch” and save. Show the exact link and organized context.
3. Save a non-private coding screenshot and a tentative idea such as “Maybe try validation before submit.” Show that the idea remains tentative and the original screenshot is available.
4. Ask “Which jobs was I applying for?” Show the short reminder and original links.
5. Briefly show a phone-saved idea appearing on the laptop after refresh, then mark a test memory done and reopen it.
6. Close: “Breadcrumb is a digital sidekick that remembers enough context to help you get started again.”

Before presenting: sign in, enable AI help, pin the extension, use only non-private samples, and verify the public app. If AI is unavailable, show saved originals and explain the limitation. Any backup recording must be identified as a recording.

## Remaining submission items

- Confirm the organizer's demo length and required submission fields.
- Confirm the initial entry is submitted; this repository does not establish that it was.
- Add required screenshots/video if requested by the organizer.
- Submit the final entry by November 7, 2026, 6:30 p.m. Pacific and retain confirmation.
