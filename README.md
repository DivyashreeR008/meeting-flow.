# Meeting Flow

Build a modern, responsive web application called "MinuteFlow" that helps users capture meeting notes, generate AI summaries, and track action items.

Design Style:

- Minimal and professional

- White and blue theme with subtle gradients

- Rounded cards and smooth animations

- Mobile responsive

- Dashboard-style layout

Pages:

1. Landing Page

- Hero section with headline:

  "Turn Every Meeting into Clear Action"

- Features section

- Testimonials

- Pricing section

- FAQ

- Footer

2. Authentication

- Sign Up

- Login

- Forgot Password

3. Dashboard

- Welcome card

- Upcoming meetings

- Recent notes

- Action items

- Statistics cards

- Sidebar navigation

4. Meetings

Users can:

- Create meeting

- Upload transcript or paste text

- Add title

- Add participants

- Select meeting type

- Save meeting

5. AI Features

After submitting a transcript:

Generate:

- Executive Summary

- Key Discussion Points

- Decisions Made

- Action Items

- Risks

- Follow-up Questions

6. Action Tracker

Each action item should include:

- Task

- Assigned Person

- Due Date

- Status

- Priority

- Progress

Support:

- Drag and drop status changes

- Filter

- Search

7. Calendar View

Display meetings and deadlines.

8. Team Workspace

Invite members

Assign tasks

Comment on meetings

Share notes

9. Profile Page

Update profile

Change password

Notification settings

Theme settings

10. Admin Panel

Manage users

View analytics

System statistics

Additional Features

- Dark Mode

- Export meeting notes as PDF

- Download action items as CSV

- Notifications

- Search everything

- Responsive layout

- Toast notifications

- Loading skeletons

- Empty states

- Error handling

Tech Stack

Frontend:

React

TypeScript

Tailwind CSS

shadcn/ui

Backend:

Supabase

Database:

Supabase PostgreSQL

Authentication:

Supabase Auth

Storage:

Supabase Storage

Charts:

Recharts

Icons:

Lucide React

Use clean component architecture, reusable components, modern UI patterns, and production-ready code.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/37fe0fde-3020-4c47-830c-d77717bce874).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
