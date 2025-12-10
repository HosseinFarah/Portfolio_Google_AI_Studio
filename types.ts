export enum Language {
  EN = 'en',
  FI = 'fi',
  FA = 'fa',
}

export interface LocalizedString {
  en: string;
  fi: string;
  fa: string;
}

export interface Project {
  id: string;
  title: string;
  description: LocalizedString;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  likes: number;
  imageUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tools' | 'other';
  iconClass?: string; // Class name for Devicon
  imageUrl?: string; // Base64 string for custom uploads
}

export interface Message {
  id: string;
  subject: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SiteSettings {
  dbHost: string;
  dbUser: string;
  dbPass: string;
  dbName: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string; // Added field for Hero Image
  aboutText: LocalizedString;
  contactEmail: string;
  contactPhone: string;
  mapEmbedUrl: string;
  geminiApiKey?: string; // NEW: Gemini API key for Google AI Studio
}

export interface VisitorStat {
  date: string;
  visits: number;
}
