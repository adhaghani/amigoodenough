# LinkedIn Resume Review App

An AI-powered web application that compares your resume against LinkedIn job postings using local AI through LM Studio.

## Features

- 📝 Upload your resume (PDF or DOCX)
- 🔗 Paste LinkedIn job posting URL
- 🤖 AI-powered analysis using local LM Studio
- 📊 Get match score and detailed feedback
- ✅ Identify strengths and gaps
- 💡 Receive personalized recommendations

## Prerequisites

1. **Node.js** (v18 or higher)
2. **LM Studio** - Download from [https://lmstudio.ai/](https://lmstudio.ai/)
   - Install and run LM Studio
   - Download a model (recommended: Llama 3 or similar)
   - Start the local server (default: http://localhost:1234)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure LM Studio:**
   - Open LM Studio
   - Load your preferred model
   - Go to "Local Server" tab
   - Click "Start Server"
   - Ensure it's running on `http://localhost:1234` (default)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Use

1. **Copy a LinkedIn job posting URL**
   - Go to LinkedIn and find a job posting
   - Copy the full URL (e.g., `https://www.linkedin.com/jobs/view/123456789`)

2. **Paste the URL** into the input field

3. **Upload your resume**
   - Click the upload area or drag and drop
   - Supports PDF and DOCX formats

4. **Click "Check My Resume"**

5. **Review the results:**
   - Match score percentage
   - Your strengths for this position
   - Missing skills or experience
   - Recommendations for improvement

## Configuration

### LM Studio Settings

If your LM Studio is running on a different port or host, update the configuration in:
`app/api/compare/route.ts`

```typescript
const openai = new OpenAI({
  baseURL: "http://localhost:1234/v1", // Change this if needed
  apiKey: "lm-studio",
});
```

### Scraping Limitations

Note: LinkedIn may block automated scraping. For production use, consider:
- Using LinkedIn's official API
- Implementing rate limiting
- Adding authentication
- Using proxy services

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI SDK (connecting to LM Studio)
- **Resume Parsing:** pdf-parse, mammoth
- **Web Scraping:** cheerio

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── compare/       # Main comparison logic
│   │   └── parse-resume/  # Resume file parsing
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/
│   └── resume-checker.tsx # Main UI component
└── package.json
```

## Troubleshooting

### "Failed to fetch LinkedIn job posting"
- Ensure the URL is a valid LinkedIn job posting
- Check your internet connection
- LinkedIn may be blocking the request (try a different job posting)

### "Failed to parse resume"
- Ensure your file is PDF or DOCX format
- Check that the file isn't corrupted
- Try a different resume file

### "Failed to analyze resume with AI"
- Make sure LM Studio is running
- Verify the server is on http://localhost:1234
- Check that a model is loaded in LM Studio
- Look at the browser console for detailed error messages

## Future Enhancements

- [ ] Support for more file formats
- [ ] Batch processing multiple resumes
- [ ] Save and compare previous analyses
- [ ] Export results as PDF
- [ ] Support for other job boards
- [ ] Custom AI prompts
- [ ] User authentication
- [ ] Resume optimization suggestions

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

