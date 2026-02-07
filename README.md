# Gemini 3 Hackathon - Chatbot

A Next.js chatbot application powered by Google's Gemini AI.

## Features

- ?? Interactive chat interface
- ?? Conversation history support
- ?? Modern, responsive UI with Tailwind CSS
- ? Fast and efficient with Next.js 14

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
   - Copy `.env.example` to `.env` (e.g. `copy .env.example .env` on Windows, `cp .env.example .env` on Mac/Linux)
   - Add your Google Gemini API key to `.env` (get one at [Google AI Studio](https://aistudio.google.com/apikey))
   - **Never commit `.env`** — it's in `.gitignore` for security

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app directory
  - `api/chat/` - API route for handling chat requests
  - `components/` - React components
    - `Chatbot.tsx` - Main chatbot component
  - `page.tsx` - Home page
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles
- `.env` - Environment variables (not committed to git)

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Google Generative AI SDK
