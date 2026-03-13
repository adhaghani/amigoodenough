"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Lightbulb, Link2, Loader2, RefreshCw, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComparisonResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
}

interface ResumeCheckerProps {
  id?: string;
}

interface JobDetailsResponse {
  jobTitle: string;
  company: string;
  location: string;
  description: string;
  rawJobInfo: string;
  fetchedAt: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const VALID_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const JOB_FETCH_DEBOUNCE_MS = 700;

function isLinkedInJobUrl(url: string) {
  return /linkedin\.com\/jobs/i.test(url);
}

function getScoreTone(score: number) {
  if (score >= 75) {
    return {
      label: "Strong fit",
      badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      progressClass: "bg-emerald-600",
      cardClass: "border-emerald-300/40 bg-emerald-500/5",
    };
  }

  if (score >= 50) {
    return {
      label: "Moderate fit",
      badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      progressClass: "bg-amber-600",
      cardClass: "border-amber-300/40 bg-amber-500/5",
    };
  }

  return {
    label: "Low fit",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    progressClass: "bg-rose-600",
    cardClass: "border-rose-300/40 bg-rose-500/5",
  };
}

export default function ResumeChecker({ id }: ResumeCheckerProps) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobFetchLoading, setJobFetchLoading] = useState(false);
  const [jobFetchError, setJobFetchError] = useState("");
  const [jobDetails, setJobDetails] = useState<JobDetailsResponse | null>(null);
  const [jobDetailsDraft, setJobDetailsDraft] = useState({
    jobTitle: "",
    company: "",
    location: "",
    description: "",
  });
  const [jobRefreshKey, setJobRefreshKey] = useState(0);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");
  const lastFetchedUrlRef = useRef("");
  const fetchIdRef = useRef(0);

  const canFetchLinkedIn = isLinkedInJobUrl(linkedinUrl.trim());
  const hasReadyJobDetails =
    jobDetailsDraft.jobTitle.trim().length > 0 &&
    jobDetailsDraft.company.trim().length > 0 &&
    jobDetailsDraft.description.trim().length > 0;
  const canAnalyze = Boolean(resumeFile) && hasReadyJobDetails && !loading && !jobFetchLoading;

  useEffect(() => {
    const trimmedUrl = linkedinUrl.trim();

    if (!trimmedUrl) {
      setJobFetchError("");
      setJobFetchLoading(false);
      setJobDetails(null);
      setJobDetailsDraft({
        jobTitle: "",
        company: "",
        location: "",
        description: "",
      });
      lastFetchedUrlRef.current = "";
      return;
    }

    if (!isLinkedInJobUrl(trimmedUrl)) {
      setJobFetchLoading(false);
      setJobFetchError("Please provide a valid LinkedIn jobs URL to fetch job details.");
      setJobDetails(null);
      setJobDetailsDraft({
        jobTitle: "",
        company: "",
        location: "",
        description: "",
      });
      lastFetchedUrlRef.current = "";
      return;
    }

    const abortController = new AbortController();
    const requestId = ++fetchIdRef.current;
    const timeoutId = setTimeout(async () => {
      setJobFetchLoading(true);
      setJobFetchError("");

      try {
        const response = await fetch("/api/fetch-job-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ linkedinUrl: trimmedUrl }),
          signal: abortController.signal,
        });

        const payload = await response.json();

        if (requestId !== fetchIdRef.current) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to fetch job details");
        }

        setJobDetails(payload as JobDetailsResponse);
        setJobDetailsDraft({
          jobTitle: payload.jobTitle || "",
          company: payload.company || "",
          location: payload.location || "",
          description: payload.description || "",
        });
        setResult(null);
        setError("");
        lastFetchedUrlRef.current = trimmedUrl;
      } catch (err) {
        if (abortController.signal.aborted || requestId !== fetchIdRef.current) {
          return;
        }

        setJobDetails(null);
        setJobDetailsDraft({
          jobTitle: "",
          company: "",
          location: "",
          description: "",
        });
        setJobFetchError(err instanceof Error ? err.message : "Failed to fetch job details");
        lastFetchedUrlRef.current = "";
      } finally {
        if (requestId === fetchIdRef.current) {
          setJobFetchLoading(false);
        }
      }
    }, JOB_FETCH_DEBOUNCE_MS);

    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [linkedinUrl, jobRefreshKey]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!VALID_FILE_TYPES.includes(file.type)) {
        setError("Please upload a PDF or DOCX file");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("File size must be 10MB or less");
        return;
      }

      setResumeFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinUrl || !resumeFile) {
      setError("Please provide both LinkedIn URL and resume file");
      return;
    }

    if (!hasReadyJobDetails) {
      setError("Job details are not ready yet. Please wait for fetch or edit missing fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Upload resume and get parsed text
      const formData = new FormData();
      formData.append("file", resumeFile);
      
      const parseResponse = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse resume");
      }

      const { text: resumeText } = await parseResponse.json();

      // Get job posting data and compare with resume
      const compareResponse = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkedinUrl,
          resumeText,
          jobPosting: `
Job Title: ${jobDetailsDraft.jobTitle}
Company: ${jobDetailsDraft.company}
Location: ${jobDetailsDraft.location}

Job Description:
${jobDetailsDraft.description}
          `.trim(),
        }),
      });

      if (!compareResponse.ok) {
        const errorData = await compareResponse.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const comparisonResult = await compareResponse.json();
      setResult(comparisonResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <Badge variant="secondary" className="rounded-full px-3 py-1 uppercase tracking-[0.12em]">
            Resume checker
          </Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Check role fit before applying</h2>
          <p className="mt-3 text-muted-foreground">
            Paste the LinkedIn posting URL and upload your resume to generate a score, strengths, gaps, and targeted recommendations.
          </p>
        </div>

        <Card className="mb-8 mx-auto border-border/70">
          <CardHeader>
            <CardTitle className="text-xl">Run an analysis</CardTitle>
            <CardDescription>
              Tip: if a LinkedIn post is blocked, retry with another public listing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="linkedin-url" className="flex items-center gap-2">
                  <Link2 className="size-4" />
                  LinkedIn job posting URL
                </Label>
                <Input
                  id="linkedin-url"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setLinkedinUrl(nextValue);
                    setResult(null);
                    setError("");

                    if (nextValue.trim() !== lastFetchedUrlRef.current) {
                      setJobDetails(null);
                      setJobDetailsDraft({
                        jobTitle: "",
                        company: "",
                        location: "",
                        description: "",
                      });
                    }
                  }}
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  required
                />
                <div className="flex min-h-5 items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {jobFetchLoading
                      ? "Fetching job details..."
                      : canFetchLinkedIn && jobDetails
                        ? `Job details fetched ${new Date(jobDetails.fetchedAt).toLocaleTimeString()}`
                        : "Paste a LinkedIn jobs URL to auto-fetch details"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => setJobRefreshKey((value) => value + 1)}
                    disabled={!canFetchLinkedIn || jobFetchLoading}
                  >
                    <RefreshCw className={`size-3 ${jobFetchLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {(jobFetchError || jobDetails) && (
                <Card className="border-border/70 bg-muted/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Fetched job details</CardTitle>
                    <CardDescription>
                      Review and edit these fields before analyzing your resume.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {jobFetchError ? (
                      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 size-4" />
                        <p>{jobFetchError}</p>
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job title</Label>
                        <Input
                          id="job-title"
                          value={jobDetailsDraft.jobTitle}
                          onChange={(e) =>
                            setJobDetailsDraft((prev) => ({ ...prev, jobTitle: e.target.value }))
                          }
                          placeholder="Job title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-company">Company</Label>
                        <Input
                          id="job-company"
                          value={jobDetailsDraft.company}
                          onChange={(e) =>
                            setJobDetailsDraft((prev) => ({ ...prev, company: e.target.value }))
                          }
                          placeholder="Company"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="job-location">Location</Label>
                        <Input
                          id="job-location"
                          value={jobDetailsDraft.location}
                          onChange={(e) =>
                            setJobDetailsDraft((prev) => ({ ...prev, location: e.target.value }))
                          }
                          placeholder="Location"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job-description">Job description</Label>
                      <textarea
                        id="job-description"
                        value={jobDetailsDraft.description}
                        onChange={(e) =>
                          setJobDetailsDraft((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Job description"
                        rows={9}
                        className="flex min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="resume-upload" className="flex items-center gap-2">
                  <Upload className="size-4" />
                  Resume file
                </Label>
                <label
                  htmlFor="resume-upload"
                  className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-9 text-center transition-colors hover:bg-muted/50"
                >
                  <FileText className="mb-3 size-7 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload your resume</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX, up to 10MB</p>
                  {resumeFile ? <p className="mt-2 text-sm text-foreground">{resumeFile.name}</p> : null}
                </label>
                <Input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4" />
                  <p>{error}</p>
                </div>
              ) : null}

              {!canAnalyze ? (
                <p className="text-xs text-muted-foreground">
                  Analyze is enabled after resume upload and valid job details are fetched.
                </p>
              ) : null}

              <Button type="submit" disabled={!canAnalyze} size="lg" className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing resume...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Check my resume
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            <Card className={`border-border/70 md:col-span-1 lg:col-span-5 ${getScoreTone(result.matchScore).cardClass}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>Match score</CardTitle>
                    <CardDescription>How your resume aligns with this role.</CardDescription>
                  </div>
                  <Badge className={getScoreTone(result.matchScore).badgeClass}>{getScoreTone(result.matchScore).label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-end justify-between">
                  <span className="text-sm text-muted-foreground">Overall alignment</span>
                  <span className="text-3xl font-semibold tracking-tight">{result.matchScore}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-background/70">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getScoreTone(result.matchScore).progressClass}`}
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {result.summary ? (
              <Card className="border-border/70 bg-muted/20 md:col-span-1 lg:col-span-7">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Quick view of your current fit and profile positioning.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>
            ) : null}

            {result.strengths && result.strengths.length > 0 ? (
              <Card className="border-emerald-300/40 bg-emerald-500/5 md:col-span-1 lg:col-span-6">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" />
                      Strengths
                    </CardTitle>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{result.strengths.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 size-1.5 rounded-full bg-emerald-600" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {result.gaps && result.gaps.length > 0 ? (
              <Card className="border-rose-300/40 bg-rose-500/5 md:col-span-1 lg:col-span-6">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-rose-600 dark:text-rose-300" />
                      Missing requirements
                    </CardTitle>
                    <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300">{result.gaps.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.gaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 size-1.5 rounded-full bg-rose-600" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}

            {result.recommendations && result.recommendations.length > 0 ? (
              <Card className="border-sky-300/40 bg-sky-500/5 md:col-span-2 lg:col-span-12">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="size-4 text-sky-600 dark:text-sky-300" />
                      Recommendations
                    </CardTitle>
                    <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300">{result.recommendations.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {result.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 size-1.5 rounded-full bg-sky-600" />
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
