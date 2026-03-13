import * as cheerio from "cheerio";

export interface LinkedInJobDetails {
  jobTitle: string;
  company: string;
  location: string;
  description: string;
}

export function buildJobPosting(details: LinkedInJobDetails): string {
  return `
Job Title: ${details.jobTitle}
Company: ${details.company}
Location: ${details.location}

Job Description:
${details.description}
  `.trim();
}

export async function scrapeLinkedInJobDetails(url: string): Promise<LinkedInJobDetails> {
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

    const jobTitle =
      $("h1.top-card-layout__title").text().trim() || $("h1").first().text().trim();

    const company =
      $("a.topcard__org-name-link").text().trim() ||
      $(".topcard__org-name-link").text().trim();

    const description =
      $(".show-more-less-html__markup").text().trim() ||
      $(".description__text").text().trim() ||
      $("article").text().trim();

    const location = $(".topcard__flavor--bullet").text().trim();

    const posting = buildJobPosting({
      jobTitle,
      company,
      location,
      description,
    });

    if (!posting || posting.length < 100) {
      throw new Error("Could not extract sufficient job information");
    }

    return {
      jobTitle,
      company,
      location,
      description,
    };
  } catch (error) {
    console.error("Error scraping LinkedIn:", error);
    throw new Error("Failed to retrieve job posting information");
  }
}