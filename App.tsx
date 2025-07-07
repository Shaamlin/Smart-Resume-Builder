
import React, { useState, useCallback, useRef } from 'react';
import { ResumeData, TemplateOption, EducationInfo, ContactInfo } from './types';
import { InputSection } from './components/InputSection';
import { PreviewSection } from './components/PreviewSection';
import { generateResumeSummary } from './services/geminiService';
import { Header } from './components/Header';

const initialResumeData: ResumeData = {
  fullName: 'John Doe',
  jobTitle: 'Software Engineer',
  contact: { 
    phone: '(123) 456-7890', 
    email: 'john.doe@example.com', 
    linkedin: 'linkedin.com/in/johndoe', 
    portfolio: 'johndoe.dev', 
    address: 'City, State' 
  },
  summary: 'Experienced professional with 5+ years in software development, specializing in web technologies and agile methodologies. Proven ability to deliver high-quality software solutions.',
  experience: `Senior Developer, XYZ Company (2020-Present)
- Led a team of 5 developers in creating innovative web applications.
- Implemented new features resulting in a 20% increase in user engagement.
- Mentored junior developers and conducted code reviews.

Software Developer, ABC Corp (2018-2020)
- Developed and maintained client-side and server-side applications.
- Collaborated with cross-functional teams to define project requirements.
- Contributed to the improvement of development processes.`,
  education: { 
    degree: 'Bachelor of Science', 
    field: 'Computer Science', 
    university: 'State University', 
    gradYear: '2018', 
    details: 'GPA: 3.8, Magna Cum Laude' 
  },
  skills: 'JavaScript, React, Node.js, Python, SQL, Agile, Git, Docker',
};

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TemplateOption.MODERN);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback((section: keyof ResumeData | `contact.${keyof ContactInfo}` | `education.${keyof EducationInfo}`, value: string) => {
    setResumeData(prev => {
      if (section.startsWith('contact.')) {
        const field = section.split('.')[1] as keyof ContactInfo;
        return { ...prev, contact: { ...prev.contact, [field]: value } };
      }
      if (section.startsWith('education.')) {
        const field = section.split('.')[1] as keyof EducationInfo;
        return { ...prev, education: { ...prev.education, [field]: value } };
      }
      return { ...prev, [section as keyof ResumeData]: value };
    });
  }, []);
  
  const formatEducationForAI = (edu: EducationInfo): string => {
    let educationStr = '';
    if (edu.degree) educationStr += edu.degree;
    if (edu.field) educationStr += (educationStr ? ' in ' : '') + edu.field;
    if (edu.university) educationStr += (educationStr ? ' from ' : '') + edu.university;
    if (edu.gradYear) educationStr += (educationStr ? ', graduated ' : '') + edu.gradYear;
    if (edu.details) educationStr += (educationStr ? '. Additional details: ' : '') + edu.details;
    return educationStr || 'No education details provided.';
  };

  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    try {
      const contentPrompt = `Based on the following inputs, generate a concise and impactful professional summary for a resume.
      User's request for summary focus: "${aiPrompt || 'general professional summary'}"
      Job Title: "${resumeData.jobTitle}"
      Experience Highlights: 
      "${resumeData.experience.substring(0, 500)}${resumeData.experience.length > 500 ? '...' : ''}" 
      Education Background: "${formatEducationForAI(resumeData.education)}"
      Current Skills: "${resumeData.skills.substring(0, 200)}${resumeData.skills.length > 200 ? '...' : ''}"
      
      The summary should be 2-4 sentences long.
      `;
      const summary = await generateResumeSummary(contentPrompt);
      setResumeData(prev => ({ ...prev, summary }));
      setAiPrompt(''); // Clear prompt after use
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please check console for details and ensure your API key is configured.');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [aiPrompt, resumeData]);

  const handlePrint = useCallback(() => {
    if (previewRef.current) {
      const printContainer = document.getElementById('print-container'); // This is a hidden utility div
      if (printContainer) {
        printContainer.innerHTML = previewRef.current.innerHTML; // Get the rendered resume content
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write('<html><head><title>Print Resume</title>');
          printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
          // Inject Tailwind configuration for custom colors
          printWindow.document.write(`
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      primary: '#3498db',
                      secondary: '#2ecc71',
                      dark: '#2c3e50',
                      light: '#ecf0f1',
                      danger: '#e74c3c',
                    },
                  }
                }
              }
            <\/script>
          `);
           printWindow.document.write(`
            <style>
              @media print {
                body { 
                  margin: 0mm !important; 
                  padding: 0mm !important; 
                  -webkit-print-color-adjust: exact !important; 
                  print-color-adjust: exact !important; 
                  background-color: white !important;
                  width: 210mm; /* A4 width */
                  /* height: 297mm; /* A4 height - let content flow or set min-height on templates */
                }
                .modern-resume, .classic-resume, .creative-resume {
                  box-shadow: none !important; 
                  border: none !important; 
                  margin: 0 !important;
                  padding: 15mm !important; /* Standard padding for print */
                  transform: scale(0.90); /* Slightly scale down to ensure fit, adjust as needed */
                  transform-origin: top left;
                  width: 100% !important;
                  min-height: 267mm; /* Approx A4 height minus padding, encourage full page */
                  box-sizing: border-box !important;
                  overflow: hidden; /* Prevent scrollbars in print if content overflows slightly with scale */
                }

                /* Creative Template Specifics for Print */
                .creative-resume {
                  display: flex !important;
                  flex-direction: row !important;
                }
                .creative-resume .sidebar {
                  width: 30% !important;
                  background-color: #2c3e50 !important; /* Custom 'dark' color */
                  color: white !important;
                  padding: 15mm !important; /* Match overall padding */
                  box-sizing: border-box !important;
                }
                .creative-resume .main-content {
                  width: 70% !important;
                  padding: 15mm !important; /* Match overall padding */
                  box-sizing: border-box !important;
                  background-color: #f1f5f9 !important; /* Custom 'light' color (Tailwind slate-100) or white */
                }
                
                /* General text and link adjustments for print */
                * {
                  color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                  word-wrap: break-word; /* Help prevent text overflow */
                }
                h1, h2, h3, h4, h5, h6 {
                   page-break-after: avoid !important; /* Try to keep titles with their content */
                }
                ul, p {
                    page-break-inside: avoid !important; /* Try to keep paragraphs and lists together */
                }
                a {
                  color: inherit !important;
                  text-decoration: none !important;
                }
                /* Remove interactive elements if they somehow get included */
                button, input[type="button"], input[type="submit"] {
                  display: none !important;
                }
              }
            </style>
          `);
          printWindow.document.write('</head><body class="bg-white">');
          printWindow.document.write(printContainer.innerHTML); // Write the cloned resume content
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          
          setTimeout(() => { 
            try {
                printWindow.focus(); // Focus the new window before printing
                printWindow.print();
            } catch (e) {
                console.error("Error during print:", e);
                alert("Could not execute print command. Your browser might be blocking it.");
            } finally {
                 // Delay closing to ensure print dialog is processed, especially in some browsers
                setTimeout(() => printWindow.close(), 500);
            }
            printContainer.innerHTML = ''; // Clean up utility div
          }, 1000); // Increased timeout for rendering
        } else {
          alert('Could not open print window. Please check your browser pop-up blocker settings.');
        }
      } else {
        console.error("Print container not found.");
      }
    } else {
        console.error("Preview reference not found.");
    }
  }, [previewRef]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all fields?')) {
      setResumeData({
        fullName: '', jobTitle: '',
        contact: { phone: '', email: '', linkedin: '', portfolio: '', address: '' },
        summary: '', experience: '',
        education: { degree: '', field: '', university: '', gradYear: '', details: '' },
        skills: '',
      });
      setAiPrompt('');
    }
  }, []);

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Header />
        <main className="flex flex-col lg:flex-row gap-6">
          <InputSection
            resumeData={resumeData}
            onDataChange={handleInputChange}
            aiPrompt={aiPrompt}
            onAiPromptChange={setAiPrompt}
            onGenerateSummary={handleGenerateSummary}
            isGeneratingSummary={isGeneratingSummary}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            onPrint={handlePrint}
            onReset={handleReset}
          />
          <PreviewSection
            resumeData={resumeData}
            selectedTemplate={selectedTemplate}
            ref={previewRef}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
