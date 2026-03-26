import type { NavLink, Skill, Project, BlogPost, Stat, SocialLink } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export const MARQUEE_ITEMS: string[] = [
  "React", "Node.js", "TypeScript", "PostgreSQL",
  "Next.js", "Docker", "AWS", "Python", "GraphQL", "Redis",
];

export const STATS: Stat[] = [
  { value: "1+", label: "Year of experience" },
  { value: "5+", label: "Projects shipped" },
  { value: "∞", label: "Lines debugged" },
];

export const SKILLS: Skill[] = [
  {
    id: "frontend",
    number: "// 01",
    name: "Frontend",
    description: "Pixel-perfect UIs with React & Next.js. Fast, accessible, and responsive by default.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "backend",
    number: "// 02",
    name: "Backend",
    description: "Scalable APIs and server architecture. RESTful, GraphQL, real-time — whatever the job needs.",
    tags: ["Node.js", "Python", "GraphQL", "REST"],
  },
  {
    id: "database",
    number: "// 03",
    name: "Database",
    description: "Schema design, query optimisation, and caching strategies for data-heavy applications.",
    tags: ["PostgreSQL", "MongoDB", "Redis", "Prisma"],
  },
  {
    id: "devops",
    number: "// 04",
    name: "DevOps",
    description: "CI/CD pipelines, containerisation, and cloud deployment. Ship with confidence.",
    tags: ["Docker", "AWS", "GitHub Actions", "Nginx"],
  },
  {
    id: "mobile",
    number: "// 05",
    name: "Mobile",
    description: "Cross-platform mobile apps that feel native. One codebase, everywhere.",
    tags: ["React Native", "Expo", "iOS", "Android"],
  },
  {
    id: "testing",
    number: "// 06",
    name: "Testing",
    description: "Test-driven development. Unit, integration, and E2E coverage that catches bugs before users do.",
    tags: ["Jest", "Vitest", "Playwright", "Cypress"],
  },
];

export const PROJECTS: Project[] = [
  {
    number: "01",
    title: "The Forge Hub",
    tag: "Leadership",
    meta: "A hub for leadership development & community · TypeScript · Tailwind CSS",
    href: "https://challenge6-theforge.vercel.app/",
  },
  {
    number: "02",
    title: "Car Management System",
    tag: "Full Stack",
    meta: "Full-stack platform for managing vehicle records & operations · React · Express · MongoDB · Node.js · Tailwind CSS",
    href: "#",
  },
  {
    number: "03",
    title: "Renovation Construction",
    tag: "Web App",
    meta: "Website for a construction & renovation company · Next.js · Tailwind CSS",
    href: "#",
  },
  {
    number: "04",
    title: "Ikoro Apartments",
    tag: "Web App",
    meta: "Website for an Apartment complex · Next.js · MongoDB · Node.js · Tailwind CSS",
    href: "#",
  },
  {
    number: "05",
    title: "RNMU Conference 2025",
    tag: "Project Management",
    meta: "International Nurses & Midwives Scientific Conference · Lemigo Hotel, Kigali · Rwanda Nurses & Midwives Union",
    href: "#",
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    date: "March 2025",
    title: "Why I stopped using Redux for most projects",
    excerpt:
      "After three years of Redux, I found simpler patterns that solve 90% of state problems with a fraction of the boilerplate.",
    href: "#",
  },
  {
    date: "February 2025",
    title: "Building for low-bandwidth users in East Africa",
    excerpt:
      "Performance isn't optional when your users are on 2G. Real techniques for shipping fast apps in bandwidth-constrained environments.",
    href: "#",
  },
  {
    date: "January 2025",
    title: "PostgreSQL indexing: a practical guide for developers",
    excerpt:
      "Indexes are misunderstood. Here's what I learned after optimising a query that went from 8 seconds to 40 milliseconds.",
    href: "#",
  },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/jimmyshimwa" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jimmy-shimwa-7181763b9/" },
  { label: "Twitter / X", href: "https://twitter.com/jimmyshimwa" },
  { label: "Download CV", href: "/Jimmy_Shimwa_CV.pdf" },
];