import { NextRequest, NextResponse } from "next/server";
import { buildJobPosting, scrapeLinkedInJobDetails } from "@/lib/linkedin-job";

export async function POST(request: NextRequest) {
  try {
    const { linkedinUrl } = await request.json();

    if (!linkedinUrl || typeof linkedinUrl !== "string") {
      return NextResponse.json(
        { error: "Missing LinkedIn URL" },
        { status: 400 }
      );
    }

    if (!linkedinUrl.includes("linkedin.com/jobs")) {
      return NextResponse.json(
        { error: "Please provide a valid LinkedIn job posting URL" },
        { status: 400 }
      );
    }

    const jobDetails = await scrapeLinkedInJobDetails(linkedinUrl);

    return NextResponse.json({
      ...jobDetails,
      rawJobInfo: buildJobPosting(jobDetails),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in fetch-job-details API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch job details",
      },
      { status: 500 }
    );
  }
}