import React, { useState, useEffect } from 'react';
import { Project, Skill, Language, SiteSettings } from '../types';
import { dbService } from '../services/dataService';
import { ProjectCard } from './ProjectCard';
import { AIAssistant } from './AIAssistant';
import { Mail, Phone, Hand, Globe, ChevronLeft, ChevronRight, Menu, X, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export const PublicView: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.EN);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Track active section for background animation
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ subject: '', email: '', phone: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [p, s, st] = await Promise.all([
                dbService.getProjects(),
                dbService.getSkills(),
                dbService.getSettings()
            ]);
            setProjects(p);
            setSkills(s);
            setSettings(st);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-10% 0px -10% 0px" }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [loading]);

  const projectsPerPage = 5;
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const handleLike = async (id: string) => {
    await dbService.likeProject(id);
    const updatedProjects = await dbService.getProjects(); // Refresh from DB
    setProjects(updatedProjects);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await dbService.sendMessage(contactForm);
    if (success) {
        toast.success('Message sent successfully! We will contact you soon.');
        setContactForm({ subject: '', email: '', phone: '', message: '' });
    } else {
        toast.error('Failed to send message.');
    }
  };

  const toggleLang = (l: Language) => setLang(l);

  const navigateToLogin = (e: React.MouseEvent) => {
      e.preventDefault();
      window.location.hash = '#/login';
      setIsMenuOpen(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getSectionClass = (id: string) => {
      const baseClass = "py-20 scroll-mt-20 transition-all duration-700 ease-in-out relative overflow-hidden border-y";
      const activeClass = activeSection === id 
        ? "bg-gradient-to-br from-indigo-950/90 via-blue-900/50 to-sky-900/20 border-blue-500/30 shadow-[inset_0_0_80px_rgba(59,130,246,0.15)]" 
        : "bg-transparent border-transparent";
      return `${baseClass} ${activeClass}`;
  };

  // Helper to guess Devicon class from name if missing
  const getSkillIcon = (skill: Skill) => {
      if (skill.imageUrl) {
          return <img src={skill.imageUrl} alt={skill.name} className="w-12 h-12 md:w-16 md:h-16 object-contain" />;
      }
      
      let iconClass = skill.iconClass;
      if (!iconClass) {
          // Auto-guess: devicon-[name]-plain
          const normalized = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          // Common mapping overrides
          const map: Record<string, string> = {
              'c': 'devicon-c-plain',
              'cplusplus': 'devicon-cplusplus-plain',
              'csharp': 'devicon-csharp-plain',
              'dot-net': 'devicon-dotnetcore-plain',
              'js': 'devicon-javascript-plain',
              'ts': 'devicon-typescript-plain',
              'aws': 'devicon-amazonwebservices-original',
              'azure': 'devicon-azure-plain',
              'html': 'devicon-html5-plain',
              'css': 'devicon-css3-plain',
              'node': 'devicon-nodejs-plain',
              'express': 'devicon-express-original',
              'sql': 'devicon-mysql-plain'
          };
          iconClass = map[normalized] || `devicon-${normalized}-plain`;
      }

      return <i className={`${iconClass} text-4xl md:text-5xl`}></i>;
  };

  const isRTL = lang === Language.FA;

  if (loading || !settings) {
      return <div className="min-h-screen bg-darker flex items-center justify-center text-primary">Loading Portfolio...</div>;
  }

  return (
    <div className={`min-h-screen bg-darker text-gray-200 ${isRTL ? 'rtl' : ''} selection:bg-primary selection:text-white`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-darker/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                HF.
            </h1>
            
            <div className="hidden md:flex items-center space-x-6">
                <a href="#" onClick={(e) => scrollToSection(e, 'about')} className={`transition-colors ${activeSection === 'about' ? 'text-primary font-bold shadow-[0_2px_0_0_rgba(59,130,246,1)]' : 'text-gray-300 hover:text-primary'}`}>About</a>
                <a href="#" onClick={(e) => scrollToSection(e, 'skills')} className={`transition-colors ${activeSection === 'skills' ? 'text-primary font-bold shadow-[0_2px_0_0_rgba(59,130,246,1)]' : 'text-gray-300 hover:text-primary'}`}>Skills</a>
                <a href="#" onClick={(e) => scrollToSection(e, 'projects')} className={`transition-colors ${activeSection === 'projects' ? 'text-primary font-bold shadow-[0_2px_0_0_rgba(59,130,246,1)]' : 'text-gray-300 hover:text-primary'}`}>Projects</a>
                <a href="#" onClick={(e) => scrollToSection(e, 'contact')} className={`transition-colors ${activeSection === 'contact' ? 'text-primary font-bold shadow-[0_2px_0_0_rgba(59,130,246,1)]' : 'text-gray-300 hover:text-primary'}`}>Contact</a>
                <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                    <button onClick={() => toggleLang(Language.EN)} className={`text-xs ${lang === Language.EN ? 'text-primary' : 'text-gray-500'}`}>EN</button>
                    <button onClick={() => toggleLang(Language.FI)} className={`text-xs ${lang === Language.FI ? 'text-primary' : 'text-gray-500'}`}>FI</button>
                    <button onClick={() => toggleLang(Language.FA)} className={`text-xs ${lang === Language.FA ? 'text-primary' : 'text-gray-500'}`}>FA</button>
                </div>
                <a href="#/login" onClick={navigateToLogin} className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full text-sm transition-all cursor-pointer">Login</a>
            </div>

             <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {isMenuOpen && (
            <div className="md:hidden bg-darker border-b border-white/10 p-4 space-y-4 fixed w-full z-50 top-[73px]">
                <a href="#" className={`block ${activeSection === 'about' ? 'text-primary' : 'text-gray-300'}`} onClick={(e) => scrollToSection(e, 'about')}>About</a>
                <a href="#" className={`block ${activeSection === 'skills' ? 'text-primary' : 'text-gray-300'}`} onClick={(e) => scrollToSection(e, 'skills')}>Skills</a>
                <a href="#" className={`block ${activeSection === 'projects' ? 'text-primary' : 'text-gray-300'}`} onClick={(e) => scrollToSection(e, 'projects')}>Projects</a>
                <a href="#" className={`block ${activeSection === 'contact' ? 'text-primary' : 'text-gray-300'}`} onClick={(e) => scrollToSection(e, 'contact')}>Contact</a>
                <a href="#/login" className="block text-primary font-bold" onClick={navigateToLogin}>Admin Login</a>
            </div>
        )}
      </nav>

      {/* Hero Section - UPDATED LAYOUT: Text Left / Image Right on Desktop */}
      <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden bg-darker">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse delay-700"></div>

        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 z-10">
            {/* Text Side (Left on Desktop, 2nd on Mobile) */}
            <div className="text-center md:text-left space-y-6 flex-1 order-2 md:order-1">
                <h2 className="text-2xl md:text-3xl font-light flex items-center justify-center md:justify-start gap-2">
                    Hello, I'm <Hand className="text-yellow-400 animate-bounce" />
                </h2>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary pb-2 leading-tight">
                    {settings.heroTitle}
                </h1>
                <p className="text-xl md:text-2xl text-primary font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    {settings.heroSubtitle}
                </p>
            </div>

            {/* Image Side (Right on Desktop, 1st on Mobile) */}
            <div className="flex-1 order-1 md:order-2 flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    {/* Construct the full URL if it's a relative path, otherwise use as is (if external) */}
                    <img 
                        src={settings.heroImageUrl ? (settings.heroImageUrl.startsWith('http') || settings.heroImageUrl.startsWith('data') ? settings.heroImageUrl : `/${settings.heroImageUrl}`) : "https://picsum.photos/200/200?grayscale"} 
                        alt="Profile" 
                        className="relative w-56 h-56 md:w-80 md:h-80 rounded-full border-4 border-primary/50 object-cover shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:grayscale-0 transition-all duration-700"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={getSectionClass('about')}>
        <div className="container mx-auto px-6 max-w-6xl text-center z-10 relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-900 inline-block pb-2">About Me</h2>
            <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur border border-white/5 shadow-xl transition-transform hover:scale-[1.01] duration-500">
                {settings.aboutText[lang]?.split('.').map((paragraph, index) => (
                    paragraph.trim() && (
                        <p 
                            key={index} 
                            className={`text-lg leading-relaxed text-justify`}
                            style={{ color: index % 4 === 0 ? 'white' : index % 4 === 1 ? 'yellow' : index % 4 === 2 ? 'lightgreen' : 'green' }}
                        >
                            {paragraph}.
                        </p>
                    )
                ))}
            </div>
        </div>
      </section>

      {/* Skills Section - UPDATED Auto-Icon & No Text */}
      <section id="skills" className={getSectionClass('skills')}>
        <div className="container mx-auto px-6 max-w-5xl z-10 relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center w-fit mx-auto bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-900 pb-2">My Technical Skills</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6">
                {skills.map(skill => (
                    <div key={skill.id} className="group relative flex flex-col items-center justify-center p-4 bg-gray-800/30 rounded-xl border border-white/5 hover:border-primary/50 hover:bg-gray-800/80 transition-all hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] aspect-square">
                        <div className="transition-transform group-hover:scale-110 flex items-center justify-center w-full h-full">
                            {getSkillIcon(skill)}
                        </div>
                        {/* Tooltip - Only visible on hover */}
                        <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                            {skill.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className={getSectionClass('projects')}>
        <div className="container mx-auto px-6 z-10 relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center w-fit mx-auto bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-900 pb-2">My Projects</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentProjects.map(project => (
                    <ProjectCard key={project.id} project={project} lang={lang} onLike={() => handleLike(project.id)} skills={skills} />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-primary transition-colors">
                    <ChevronLeft />
                </button>
                <span className="text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-gray-800 rounded-full disabled:opacity-50 hover:bg-primary transition-colors">
                    <ChevronRight />
                </button>
            </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={getSectionClass('contact')}>
        <div className="container mx-auto px-6 max-w-5xl z-10 relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center w-fit mx-auto bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-900 pb-2">Contact Me</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
                {/* Info */}
                <div className="space-y-8">
                    <p className="text-xl text-gray-300">Are you ready to have your own website or update it? Contact me and let's make your dream a reality together.</p>
                    <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition-colors group">
                        <div className="p-3 bg-primary/20 rounded-full text-primary group-hover:scale-110 transition-transform"><Mail /></div>
                        <div><p className="text-sm text-gray-400">Email Me</p><p className="font-semibold">{settings.contactEmail}</p></div>
                    </a>
                    <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition-colors group">
                         <div className="p-3 bg-green-500/20 rounded-full text-green-500 group-hover:scale-110 transition-transform"><Phone /></div>
                         <div><p className="text-sm text-gray-400">Call Me</p><p className="font-semibold">{settings.contactPhone}</p></div>
                    </a>
                </div>
                {/* Form */}
                <form onSubmit={handleContactSubmit} className="bg-gray-800 p-8 rounded-2xl border border-white/5 shadow-2xl space-y-4">
                    <input type="text" placeholder="Subject" required className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-primary outline-none" value={contactForm.subject} onChange={e => setContactForm({...contactForm, subject: e.target.value})} />
                     <div className="grid grid-cols-2 gap-4">
                        <input type="email" placeholder="Email" required className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-primary outline-none" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                        <input type="text" placeholder="Phone" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-primary outline-none" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                     </div>
                     <textarea rows={5} placeholder="Message" required className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:border-primary outline-none" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} ></textarea>
                     <div className="flex items-center gap-2 mb-4">
                        <input type="checkbox" required id="captcha" className="w-5 h-5 accent-primary cursor-pointer" />
                        <label htmlFor="captcha" className="text-sm text-gray-400 cursor-pointer select-none">I am not a robot</label>
                     </div>
                     <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary p-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow">Send Message</button>
                </form>
            </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-64 md:h-96 w-full grayscale hover:grayscale-0 transition-all duration-500">
         <iframe src={settings.mapEmbedUrl} width="100%" height="100%" style={{border:0}} allowFullScreen={true} loading="lazy" title="Location"></iframe>
      </section>

      <footer className="bg-black py-8 border-t border-white/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Hossein Farahkordmahaleh. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <span>Visitors Today: {settings ? 1 : 0}</span> {/* Placeholder */}
                <Globe size={16} />
            </div>
        </div>
      </footer>
      <AIAssistant />
    </div>
  );
};