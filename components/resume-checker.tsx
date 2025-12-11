"use client";

import { useState } from "react";
import { Upload, Link2, CheckCircle2, Loader2 } from "lucide-react";

interface ComparisonResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
}

export default function ResumeChecker() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a PDF or DOCX file");
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Resume Reviewer
          </h1>
          <p className="text-slate-600">
            Compare your resume against LinkedIn job postings with AI-powered analysis
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LinkedIn URL Input */}
            <div>
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-slate-700 mb-2">
                <Link2 className="inline w-4 h-4 mr-1" />
                LinkedIn Job Posting URL
              </label>
              <input
                id="linkedin-url"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label htmlFor="resume-upload" className="block text-sm font-medium text-slate-700 mb-2">
                <Upload className="inline w-4 h-4 mr-1" />
                Upload Your Resume
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-slate-500" />
                    <p className="mb-2 text-sm text-slate-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF or DOCX (MAX. 10MB)</p>
                    {resumeFile && (
                      <p className="mt-2 text-sm text-blue-600 font-medium">
                        {resumeFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Check My Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Results</h2>
              <div className="flex items-center">
                <span className="text-sm text-slate-600 mr-2">Match Score:</span>
                <div className="flex-1 bg-slate-200 rounded-full h-3 max-w-xs">
                  <div
                    className="bg-linear-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                    style={{ width: `${result.matchScore}%` }}
                  />
                </div>
                <span className="ml-2 font-bold text-lg text-blue-600">
                  {result.matchScore}%
                </span>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Summary</h3>
                <p className="text-slate-700">{result.summary}</p>
              </div>
            )}

            {/* Strengths */}
            {result.strengths && result.strengths.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                  Your Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {result.gaps && result.gaps.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  Missing Skills/Experience
                </h3>
                <ul className="space-y-2">
                  {result.gaps.map((gap, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 mr-2">×</span>
                      <span className="text-slate-700">{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <span className="text-blue-600 mr-2">💡</span>
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">→</span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
