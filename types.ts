
export interface ContactInfo {
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
  address: string;
}

export interface EducationInfo {
  degree: string;
  field: string;
  university: string;
  gradYear: string;
  details: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  contact: ContactInfo;
  summary: string;
  experience: string; // Raw text, parsed by templates
  education: EducationInfo; 
  skills: string; // Raw text, simple display or split by comma
}

export enum TemplateOption {
  MODERN = 'modern',
  CLASSIC = 'classic',
  CREATIVE = 'creative',
}

export interface ParsedExperienceItem {
  jobTitle: string;
  company: string;
  date: string;
  responsibilities: string[];
  rawFirstLine?: string;
}
