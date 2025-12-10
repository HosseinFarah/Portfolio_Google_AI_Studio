import React from 'react';
import { Project, Language, Skill } from '../types';
import { Github, ExternalLink, ThumbsUp } from 'lucide-react';

interface Props {
  project: Project;
  lang: Language;
  skills: Skill[]; // Now accepting skills from parent
  onLike: () => void;
}

export const ProjectCard: React.FC<Props> = ({ project, lang, skills, onLike }) => {
  // Generate a unique border color for each card based on the project title
  const borderColor = `hsl(${project.title.length * 37 % 360}, 70%, 50%)`;

  const getTechSkill = (techName: string): Skill | undefined => {
    // Normalize string for better matching
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const techNorm = normalize(techName);
    return skills.find(s => normalize(s.name) === techNorm || s.name.toLowerCase() === techName.toLowerCase());
  };

  return (
    <div 
      className="bg-white/5 backdrop-blur-sm border rounded-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group"
      style={{ borderColor }}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={project.imageUrl || 'https://picsum.photos/400/250'} 
          alt={project.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <h3 
            className="text-xl font-bold shadow-md" 
            style={{
              background: 'linear-gradient(to right, lightblue, violet)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {project.title}
          </h3>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Removed line-clamp-3 and flex-1 to allow full text expansion */}
        <p className="text-gray-300 text-sm mb-4 text-justify">
          {project.description[lang] || project.description.en}
        </p>
        
        {/* Tech Stack Icons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {project.techStack.map((tech, i) => {
            const skill = getTechSkill(tech);
            
            return (
              <div key={i} className="relative group/icon" title={tech}>
                 {skill?.imageUrl ? (
                    <img src={skill.imageUrl} alt={tech} className="w-8 h-8 object-contain hover:scale-110 transition-transform" />
                 ) : skill?.iconClass ? (
                    <i className={`${skill.iconClass} text-2xl hover:scale-110 transition-transform cursor-help`}></i>
                 ) : (
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
                        {tech}
                    </span>
                 )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
          <div className="flex space-x-3">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-green-500 hover:text-green-400 transition-colors" 
                title="View Code"
              >
                <Github size={20} />
              </a>
            )}
            {project.demoUrl && (
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 transition-colors" 
                title="Live Demo"
              >
                <ExternalLink size={20} />
              </a>
            )}
          </div>
          {/* <button 
            onClick={onLike}
            className="flex items-center space-x-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <ThumbsUp size={18} />
            <span className="text-sm">{project.likes}</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};
