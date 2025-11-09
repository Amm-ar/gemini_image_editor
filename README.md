# Online AI Image Editor

An intuitive web application that allows users to edit images using simple text prompts, powered by Google's Gemini 2.5 Flash Image model. Upload a photo, describe your desired change, and let the AI bring your vision to life.

## Features

- **AI-Powered Image Editing:** Leverage the Gemini model to perform complex image edits with simple text instructions.
- **File Upload:** Easily upload images from your device via a file picker or drag-and-drop.
- **Example Prompts:** Get started quickly with a list of creative example prompts.
- **Iterative Editing:** Use the "Edit Again" feature to take a generated image and apply further edits, creating a seamless creative workflow.
- **Image Download:** Save your edited images with a descriptive filename that includes the original name and a timestamp.
- **Light & Dark Mode:** Choose your preferred viewing experience with a persistent theme switcher.
- **Error Handling:** Gracefully handles API quota limits with a countdown timer and automatic retries.
- **Responsive Design:** A clean, modern UI that works beautifully on both desktop and mobile devices.

## How to Deploy

This is a static frontend application built with React and TypeScript. You can deploy it to any static hosting service like Netlify, Vercel, or GitHub Pages.

### Configuration

The application requires a Google Gemini API key to function.

1.  **Obtain an API Key:** Get your API key from [Google AI Studio](https://ai.google.dev/).
2.  **Set Environment Variable:** The hosting service where you deploy the app must provide the API key as an environment variable named `API_KEY`. The application is configured to read `process.env.API_KEY` to authenticate with the Gemini API.

    For example, in a Vercel or Netlify project settings, you would add a new environment variable:
    - **Name:** `API_KEY`
    - **Value:** `Your-Gemini-API-Key-Here`

Once the environment variable is set, the application will be able to make requests to the Gemini API.

## Project Structure

```
.
├── components/         # Reusable React UI components
│   ├── icons/          # SVG icon components
│   └── ImageDisplay.tsx
├── hooks/              # Custom React hooks for shared logic
│   └── useTheme.ts
├── services/           # Modules for interacting with external APIs
│   └── geminiService.ts
├── utils/              # Helper functions
│   └── fileUtils.ts
├── App.tsx             # Main application component and UI layout
├── index.html          # HTML entry point
├── index.tsx           # React application root
└── README.md           # This file
```
