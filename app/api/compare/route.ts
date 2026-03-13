import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { config } from "@/lib/config";

// Initialize OpenAI client to connect to OpenRouter
const openai = new OpenAI({
  baseURL: config.openRouter.baseURL,
  apiKey: config.openRouter.apiKey,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Optional, for including your app on openrouter.ai rankings.
    "X-Title": "Am I Good Enough?", // Optional. Shows in rankings on openrouter.ai.
  },
});

async function scrapeLinkedInJob(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch LinkedIn job posting");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract job information from LinkedIn
    const jobTitle = $("h1.top-card-layout__title").text().trim() ||
                     $("h1").first().text().trim();
    
    const companyName = $("a.topcard__org-name-link").text().trim() ||
                       $(".topcard__org-name-link").text().trim();
    
    const jobDescription = $(".show-more-less-html__markup").text().trim() ||
                          $(".description__text").text().trim() ||
                          $("article").text().trim();

    const location = $(".topcard__flavor--bullet").text().trim();

    // Combine all extracted information
    const jobInfo = `
Job Title: ${jobTitle}
Company: ${companyName}
Location: ${location}

Job Description:
${jobDescription}
    `.trim();

    if (!jobInfo || jobInfo.length < 100) {
      throw new Error("Could not extract sufficient job information");
    }

    return jobInfo;
  } catch (error) {
    console.error("Error scraping LinkedIn:", error);
    throw new Error("Failed to retrieve job posting information");
  }
}

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
}

async function analyzeWithAI(
  jobPosting: string,
  resumeText: string
): Promise<AnalysisResult> {
  try {
    const prompt = `You are an expert career advisor and resume analyst. Compare the following job posting with the candidate's resume and provide a detailed analysis.

JOB POSTING:
${jobPosting}

CANDIDATE'S RESUME:
${resumeText}

Please analyze the resume against the job posting and provide:
1. A match score (0-100%) indicating how well the resume aligns with the job requirements
2. Key strengths where the candidate's experience matches the job requirements
3. Gaps or missing skills/experiences that are mentioned in the job posting but not in the resume
4. Specific recommendations for improving the resume for this position
5. A brief summary of the overall fit

Respond in JSON format with the following structure:
{
  "matchScore": <number 0-100>,
  "strengths": [<array of strings>],
  "gaps": [<array of strings>],
  "recommendations": [<array of strings>],
  "summary": "<overall summary string>"
}`;

    const completion = await openai.chat.completions.create({
      model: config.openRouter.model,
      messages: [
        {
          role: "system",
          content: "You are an expert career advisor specializing in resume analysis. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    if (!completion.choices) {
      console.error("OpenRouter API returned an unexpected response:", JSON.stringify(completion, null, 2));
      throw new Error("Invalid response structure from OpenRouter API.");
    }

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (
      typeof result.matchScore !== "number" ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.gaps) ||
      !Array.isArray(result.recommendations) ||
      typeof result.summary !== "string"
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return result;
  } catch (error) {
    console.error("Error analyzing with AI:", error);
    throw new Error("Failed to analyze resume with AI");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl, resumeText } = await request.json();

    if (!linkedinUrl || !resumeText) {
      return NextResponse.json(
        { error: "Missing LinkedIn URL or resume text" },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL
    if (!linkedinUrl.includes("linkedin.com/jobs")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn job posting URL" },
        { status: 400 }
      );
    }

    // Scrape job posting
    const jobPosting = await scrapeLinkedInJob(linkedinUrl);

    // Analyze with AI
    const analysis = await analyzeWithAI(jobPosting, resumeText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in compare API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
