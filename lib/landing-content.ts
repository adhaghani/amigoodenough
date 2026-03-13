import { Sparkles, ScanSearch, FileUp, ChartNoAxesCombined, ShieldCheck, Timer } from "lucide-react";

export const landingContent = {
  brand: "Am I Good Enough?",
  eyebrow: "Resume-job fit analyzer",
  title: "Know your interview odds before you apply.",
  description:
    "Paste a LinkedIn job post, upload your resume, and get a focused match report with strengths, gaps, and practical improvements.",
  primaryCta: "Check your resume now",
  secondaryCta: "See how it works",
};

export const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Checker", href: "#resume-checker" },
];

export const steps = [
  {
    title: "Paste the job URL",
    description: "Use any public LinkedIn job listing URL to define the role requirements.",
    icon: ScanSearch,
  },
  {
    title: "Upload your resume",
    description: "Submit a PDF or DOCX file. We parse the content and prepare it for analysis.",
    icon: FileUp,
  },
  {
    title: "Get an actionable score",
    description: "Receive a match score, missing requirements, and targeted recommendations.",
    icon: ChartNoAxesCombined,
  },
];

export const features = [
  {
    title: "Focused match score",
    description: "A fast confidence signal for role alignment before you submit applications.",
    icon: Sparkles,
  },
  {
    title: "Strength and gap mapping",
    description: "See where your resume already aligns and where requirements are missing.",
    icon: ShieldCheck,
  },
  {
    title: "Fast feedback loop",
    description: "Iterate quickly on resume updates and re-check fit in seconds.",
    icon: Timer,
  },
];
