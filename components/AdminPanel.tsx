import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/dataService';
import { Project, SiteSettings, Message, Skill } from '../types';
import { Trash2, Save, Plus, BarChart2, MessageSquare, Database, Settings, Layout, LogOut, Search, ChevronLeft, ChevronRight, Edit, Upload, Image as ImageIcon, X, Shield, Reply, CheckSquare, Square, Send, Menu, Cpu, ZoomIn, Move } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'projects' | 'skills' | 'messages' | 'stats'>('settings');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Image Cropper State ---
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Project Management State
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectPage, setProjectPage] = useState(1);
  const itemsPerPage = 5;

  // Skills Management State
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillPage, setSkillPage] = useState(1);

  // Message Management State
  const [msgSearch, setMsgSearch] = useState('');
  const [msgPage, setMsgPage] = useState(1);
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  
  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [currentReplyMsg, setCurrentReplyMsg] = useState<Message | null>(null);
  const [replyBody, setReplyBody] = useState('');

  // Initial Load
  useEffect(() => {
    loadData('settings');
    loadData('projects');
    loadData('skills');
    loadData('messages');
    loadData('stats');
  }, []);

  const loadData = async (type: string) => {
      if(type === 'settings') setSettings(await dbService.getSettings());
      if(type === 'projects') setProjects(await dbService.getProjects());
      if(type === 'skills') setSkills(await dbService.getSkills());
      if(type === 'messages') setMessages(await dbService.getMessages());
      if(type === 'stats') setStats(await dbService.getStats() as any);
  };

  const handleSaveSettings = async () => {
    if(settings) {
        const success = await dbService.saveSettings(settings);
        if(success) {
            toast.success('Settings Saved!');
            // Reload settings to get the proper image URL from server if changed
            loadData('settings');
        }
        else toast.error('Failed to save settings');
    }
  };

  // --- Hero Image Upload & Cropper Handlers ---
  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImage(reader.result as string);
            setCropperOpen(true);
            setCropPos({ x: 0, y: 0 });
            // Scale will be set in onLoad of the img element
        };
        reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if(isDragging) {
          e.preventDefault();
          setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const saveCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (canvas && img && settings) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const outputSize = 400; // Final output size (e.g., 400x400)
            const cropperSize = 250; // Visual cropper size (e.g., 250x250)

            canvas.width = outputSize;
            canvas.height = outputSize;

            // 1. Fill background with white
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, outputSize, outputSize);

            // 2. Clip Circle
            ctx.beginPath();
            ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
            ctx.clip();

            // 3. Calculate the displayed image dimensions
            const scale = cropScale; // Zoom scale
            const displayedWidth = img.naturalWidth * scale; // Width of the image as displayed
            const displayedHeight = img.naturalHeight * scale; // Height of the image as displayed

            // 4. Calculate the crop area in the original image
            const cropX = Math.max(0, (cropPos.x / cropperSize) * img.naturalWidth);
            const cropY = Math.max(0, (cropPos.y / cropperSize) * img.naturalHeight);

            const cropWidth = (cropperSize / displayedWidth) * img.naturalWidth;
            const cropHeight = (cropperSize / displayedHeight) * img.naturalHeight;

            // 5. Draw the cropped area onto the canvas
            ctx.drawImage(
                img,
                cropX, // Start X position in the original image
                cropY, // Start Y position in the original image
                cropWidth, // Width of the cropped area in the original image
                cropHeight, // Height of the cropped area in the original image
                0, // Start X position on the canvas
                0, // Start Y position on the canvas
                canvas.width, // Width of the canvas
                canvas.height // Height of the canvas
            );

            // 6. Convert the canvas content to a Base64 string
            const base64 = canvas.toDataURL('image/jpeg', 0.9);

            // Update the settings with the new image
            setSettings((prev) => (prev ? { ...prev, heroImageUrl: base64 } : null));
            setCropperOpen(false);
            setTempImage(null);
        }
    }
};

  const removeHeroImage = () => {
      if(settings) setSettings({...settings, heroImageUrl: ''});
  }

  const handleProjectSave = async () => {
    if (editingProject && editingProject.title) {
        const newProject = {
            id: editingProject.id || '',
            title: editingProject.title,
            description: editingProject.description || { en: '', fi: '', fa: '' },
            techStack: typeof editingProject.techStack === 'string' ? (editingProject.techStack as string).split(',').map((s:string) => s.trim()) : editingProject.techStack || [],
            githubUrl: editingProject.githubUrl,
            demoUrl: editingProject.demoUrl,
            likes: editingProject.likes || 0,
            imageUrl: editingProject.imageUrl
        } as Project;
        
        const success = await dbService.saveProject(newProject);
        if(success) {
            await loadData('projects');
            setEditingProject(null);
            toast.success(editingProject.id ? 'Project updated' : 'Project created');
        } else {
            toast.error('Failed to save project');
        }
    }
  };

  const handleDeleteProject = async (id: string) => {
    const success = await dbService.deleteProject(id);
    if(success) {
        await loadData('projects');
        toast.success('Project deleted');
    } else {
        toast.error('Failed to delete project');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProject) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditingProject({ ...editingProject, imageUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
      if(editingProject) setEditingProject({...editingProject, imageUrl: ''});
  }

  // ---- Skills Handlers ----
  const handleSkillSave = async () => {
      if(editingSkill && editingSkill.name) {
          const newSkill = {
              id: editingSkill.id || '',
              name: editingSkill.name,
              category: editingSkill.category || 'other',
              iconClass: editingSkill.iconClass || '',
              imageUrl: editingSkill.imageUrl || ''
          } as Skill;
          
          const success = await dbService.saveSkill(newSkill);
          if(success) {
              await loadData('skills');
              setEditingSkill(null);
              toast.success('Skill saved');
          } else {
              toast.error('Failed to save skill');
          }
      }
  };

  const handleDeleteSkill = async (id: string) => {
      const success = await dbService.deleteSkill(id);
      if(success) {
          await loadData('skills');
          toast.success('Skill deleted');
      } else {
          toast.error('Failed to delete skill');
      }
  };

  const handleSkillImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingSkill) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditingSkill({ ...editingSkill, imageUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const removeSkillImage = () => {
      if(editingSkill) setEditingSkill({...editingSkill, imageUrl: ''});
  }

  // ---- Message Handlers ----
  const toggleMessageSelect = (id: string) => {
      if(selectedMsgIds.includes(id)) {
          setSelectedMsgIds(selectedMsgIds.filter(mid => mid !== id));
      } else {
          setSelectedMsgIds([...selectedMsgIds, id]);
      }
  };

  const handleDeleteMessage = async (id: string) => {
      const success = await dbService.deleteMessage(id);
      if(success) {
          await loadData('messages');
          setSelectedMsgIds(prev => prev.filter(mid => mid !== id));
          toast.success('Message deleted');
      } else {
          toast.error('Failed to delete');
      }
  };

  const handleBulkDelete = async () => {
      const success = await dbService.deleteMessages(selectedMsgIds);
      if(success) {
          await loadData('messages');
          setSelectedMsgIds([]);
          toast.success('Selected messages deleted');
      } else {
          toast.error('Bulk delete failed');
      }
  };

  const openReplyModal = async (msg: Message) => {
      setCurrentReplyMsg(msg);
      setReplyBody(`Dear Visitor,\n\nThank you for your message regarding "${msg.subject}".\n\n\nBest Regards,\nHossein Farahkordmahaleh`);
      setReplyModalOpen(true);
      if(!msg.read) {
          await dbService.markMessageRead(msg.id);
          loadData('messages');
      }
  };

  const sendReply = async () => {
      if(currentReplyMsg) {
          const success = await dbService.sendReply(currentReplyMsg.email, `Re: ${currentReplyMsg.subject}`, replyBody);
          if(success) {
              toast.success(`Reply sent to ${currentReplyMsg.email}`);
              setReplyModalOpen(false);
              setCurrentReplyMsg(null);
          } else {
              toast.error('Failed to send email');
          }
      }
  };

  // Filters...
  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.techStack.some(t => t.toLowerCase().includes(projectSearch.toLowerCase()))
  );
  const displayedProjects = filteredProjects.slice((projectPage - 1) * itemsPerPage, projectPage * itemsPerPage);

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(skillSearch.toLowerCase())
  );
  const displayedSkills = filteredSkills.slice((skillPage - 1) * itemsPerPage, skillPage * itemsPerPage);


  const filteredMessages = messages.filter(m => 
    m.subject.toLowerCase().includes(msgSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(msgSearch.toLowerCase()) ||
    m.message.toLowerCase().includes(msgSearch.toLowerCase())
  );
  const displayedMessages = filteredMessages.slice((msgPage - 1) * itemsPerPage, msgPage * itemsPerPage);

  const toggleSelectAllMessages = () => {
      const allIdsOnPage = displayedMessages.map(m => m.id);
      const allSelected = allIdsOnPage.every(id => selectedMsgIds.includes(id));
      
      if(allSelected) {
          setSelectedMsgIds(selectedMsgIds.filter(id => !allIdsOnPage.includes(id)));
      } else {
          const newIds = [...new Set([...selectedMsgIds, ...allIdsOnPage])];
          setSelectedMsgIds(newIds);
      }
  };

  const inputClass = "w-full bg-gray-900 border border-gray-600 rounded p-2 text-white placeholder-gray-500 focus:border-primary focus:outline-none";
  const closeMobileMenu = () => setMobileMenuOpen(false);

  if(!settings) return <div className="text-white p-10">Loading Admin Panel...</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobileMenu}></div>
      )}

      {/* CROPPER MODAL */}
      {cropperOpen && tempImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full flex flex-col items-center animate-in zoom-in-95">
                <h3 className="text-xl font-bold mb-4 text-white">Adjust Profile Image</h3>
                
                {/* Visual Cropper Area */}
                <div 
                    className="relative w-[250px] h-[250px] bg-black rounded-full overflow-hidden border-4 border-primary cursor-move mb-6 select-none shadow-lg"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <img 
                        ref={imageRef}
                        src={tempImage} 
                        alt="Crop Source" 
                        style={{
                            transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`,
                            transformOrigin: '0 0', // CRITICAL FIX: Top-Left origin for easier math
                            maxWidth: 'none', 
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                        className="absolute top-0 left-0 max-w-none pointer-events-none select-none"
                        draggable={false}
                        onLoad={(e) => {
                             const img = e.currentTarget;
                             const minDim = Math.min(img.naturalWidth, img.naturalHeight);
                             const fitScale = 250 / minDim;
                             setCropScale(fitScale);
                             setCropPos({ x: (250 - img.naturalWidth * fitScale)/2, y: (250 - img.naturalHeight * fitScale)/2 });
                        }}
                    />
                </div>
                
                {/* Controls */}
                <div className="w-full mb-6 px-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                        <span>Zoom Out</span>
                        <span>Zoom In</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.05" 
                        max="2" 
                        step="0.01" 
                        value={cropScale}
                        onChange={(e) => setCropScale(parseFloat(e.target.value))}
                        className="w-full accent-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-center text-xs text-gray-500 mt-2">Drag image to position • Use slider to zoom</p>
                </div>

                <div className="flex gap-4 w-full">
                    <button onClick={() => {setCropperOpen(false); setTempImage(null);}} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors font-medium">Cancel</button>
                    <button onClick={saveCrop} className="flex-1 py-3 bg-primary hover:bg-blue-600 rounded-lg text-white font-bold transition-colors shadow-lg">Save Image</button>
                </div>
                
                {/* Hidden Canvas */}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
            <p className="text-xs text-gray-400">Manage your Portfolio</p>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => { setActiveTab('settings'); closeMobileMenu(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'}`}>
            <Database size={20} /> <span>Site Settings</span>
          </button>
          <button onClick={() => { setActiveTab('projects'); closeMobileMenu(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'}`}>
            <Layout size={20} /> <span>Projects CRUD</span>
          </button>
          <button onClick={() => { setActiveTab('skills'); closeMobileMenu(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'skills' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'}`}>
            <Cpu size={20} /> <span>Skills CRUD</span>
          </button>
          <button onClick={() => { setActiveTab('messages'); closeMobileMenu(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'}`}>
            <MessageSquare size={20} /> <span>Messages</span>
          </button>
          <button onClick={() => { setActiveTab('stats'); closeMobileMenu(); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'stats' ? 'bg-primary/20 text-primary' : 'hover:bg-gray-700'}`}>
            <BarChart2 size={20} /> <span>Analytics</span>
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-2 rounded-lg transition-all">
                <LogOut size={18} /> <span>Logout</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <h2 className="font-bold text-primary">Admin Panel</h2>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-700 rounded text-gray-200">
                <Menu size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'settings' && (
            <div className="space-y-6 md:space-y-8 max-w-4xl mx-auto animate-in fade-in">
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Site Content</h3>
                    <label className="block text-sm text-gray-400 mb-1">Map Embed URL (iframe src)</label>
                    <input type="text" value={settings.mapEmbedUrl} onChange={e => setSettings({...settings, mapEmbedUrl: e.target.value})} className={inputClass + " mb-4"} />
                    
                    <label className="block text-sm text-gray-400 mb-1">Hero Title</label>
                    <input type="text" value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className={inputClass + " mb-4"} />
                    
                    <label className="block text-sm text-gray-400 mb-1">Hero Subtitle</label>
                    <input type="text" value={settings.heroSubtitle} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className={inputClass + " mb-4"} />
                    
                    {/* HERO IMAGE UPLOAD SECTION */}
                    <div className="bg-gray-900 p-4 rounded border border-gray-700">
                        <label className="block text-sm text-gray-300 mb-2 font-bold flex items-center gap-2">
                            <ImageIcon size={16}/> Hero Profile Image
                        </label>
                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-1 w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                        <p className="text-sm text-gray-400"><span className="font-semibold">Click to Select & Crop</span></p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleHeroImageSelect} />
                                </label>
                            </div>
                            
                            <div className="w-32 h-32 bg-black rounded-full border border-gray-600 overflow-hidden relative group shrink-0 mx-auto md:mx-0">
                                {settings.heroImageUrl ? (
                                    <img src={`/me/${settings.heroImageUrl}`} alt="Hero Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                )}
                                {settings.heroImageUrl && <button onClick={removeHeroImage} className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"><X size={12} /></button>}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* About Me Section Update */}
                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">About Me (Multi-language)</h3>
                    
                    <label className="block text-sm text-gray-400 mb-1">English</label>
                    <textarea rows={4} value={settings.aboutText.en} onChange={e => setSettings({...settings, aboutText: {...settings.aboutText, en: e.target.value}})} className={inputClass + " mb-4"} />

                    <label className="block text-sm text-gray-400 mb-1">Finnish (Suomi)</label>
                    <textarea rows={4} value={settings.aboutText.fi} onChange={e => setSettings({...settings, aboutText: {...settings.aboutText, fi: e.target.value}})} className={inputClass + " mb-4"} />

                    <label className="block text-sm text-gray-400 mb-1">Persian (فارسی)</label>
                    <textarea rows={4} value={settings.aboutText.fa} onChange={e => setSettings({...settings, aboutText: {...settings.aboutText, fa: e.target.value}})} className={inputClass + " text-right font-[Vazirmatn]"} dir="rtl" />
                </div>

                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Contact Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm text-gray-400 mb-1">Contact Email</label><input type="text" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className={inputClass} /></div>
                        <div><label className="block text-sm text-gray-400 mb-1">Contact Phone</label><input type="text" value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} className={inputClass} /></div>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings className="text-orange-400"/> Mail Server (SMTP)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-400 mb-1">SMTP Host</label><input type="text" value={settings.smtpHost} onChange={e => setSettings({...settings, smtpHost: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">SMTP Port</label><input type="text" value={settings.smtpPort} onChange={e => setSettings({...settings, smtpPort: e.target.value})} className={inputClass} /></div>
                    <div className="md:col-span-2"><label className="block text-sm text-gray-400 mb-1">User</label><input type="text" value={settings.smtpUser} onChange={e => setSettings({...settings, smtpUser: e.target.value})} className={inputClass} /></div>
                </div>
                </div>

                <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield className="text-blue-400"/> Google reCAPTCHA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm text-gray-400 mb-1">Site Key</label><input type="text" value={settings.recaptchaSiteKey} onChange={e => setSettings({...settings, recaptchaSiteKey: e.target.value})} className={inputClass} placeholder="6LeI..." /></div>
                    <div><label className="block text-sm text-gray-400 mb-1">Secret Key</label><input type="text" value={settings.recaptchaSecretKey} onChange={e => setSettings({...settings, recaptchaSecretKey: e.target.value})} className={inputClass} placeholder="6LeI..." /></div>
                </div>
                </div>

                <button onClick={handleSaveSettings} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold shadow-lg">
                    <Save size={18}/> Save All Configuration
                </button>
            </div>
            )}
            
            {activeTab === 'projects' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                    {/* ... Existing Project UI ... */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-2xl font-bold">Projects Manager</h3>
                        <button onClick={() => setEditingProject({ title: '', description: {en:'',fi:'',fa:''}, techStack: [], likes: 0, imageUrl: '' })} className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors">
                            <Plus size={18} /> Add New Project
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search projects..." value={projectSearch} onChange={(e) => { setProjectSearch(e.target.value); setProjectPage(1); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none" />
                    </div>
                    
                    {editingProject && (
                        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4 shadow-2xl z-20 relative">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Title</label>
                                    <input value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Tech Stack</label>
                                    <input value={Array.isArray(editingProject.techStack) ? editingProject.techStack.join(',') : editingProject.techStack} onChange={e => setEditingProject({...editingProject, techStack: e.target.value.split(',')})} className={inputClass} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Description (English)</label>
                                    <textarea value={editingProject.description?.en} onChange={e => setEditingProject({...editingProject, description: {...editingProject.description!, en: e.target.value}})} className={inputClass + " h-24"} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Description (Finnish)</label>
                                    <textarea value={editingProject.description?.fi} onChange={e => setEditingProject({...editingProject, description: {...editingProject.description!, fi: e.target.value}})} className={inputClass + " h-24"} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Description (Farsi)</label>
                                    <textarea dir="rtl" value={editingProject.description?.fa} onChange={e => setEditingProject({...editingProject, description: {...editingProject.description!, fa: e.target.value}})} className={inputClass + " h-24 text-right font-[Vazirmatn]"} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">GitHub URL</label>
                                    <input value={editingProject.githubUrl || ''} onChange={e => setEditingProject({...editingProject, githubUrl: e.target.value})} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Demo URL</label>
                                    <input value={editingProject.demoUrl || ''} onChange={e => setEditingProject({...editingProject, demoUrl: e.target.value})} className={inputClass} />
                                </div>
                                
                                <div className="md:col-span-2 bg-gray-900 p-4 rounded border border-gray-700">
                                    <label className="block text-sm text-gray-300 mb-2 font-bold flex items-center gap-2">
                                        <ImageIcon size={16}/> Project Image
                                    </label>
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex-1 w-full">
                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="text-sm text-gray-400"><span className="font-semibold">Click to upload</span></p>
                                                </div>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                            <div className="mt-2">
                                                <input value={editingProject.imageUrl || ''} onChange={e => setEditingProject({...editingProject, imageUrl: e.target.value})} className={inputClass + " text-xs"} placeholder="or paste URL" />
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-48 h-32 bg-black rounded-lg border border-gray-600 overflow-hidden relative group shrink-0">
                                            {editingProject.imageUrl && <img src={editingProject.imageUrl} alt="Preview" className="w-full h-full object-cover" />}
                                            {editingProject.imageUrl && <button onClick={removeImage} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"><X size={12} /></button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingProject(null)} className="flex-1 md:flex-none bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors">Cancel</button>
                                <button onClick={handleProjectSave} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center justify-center gap-2"><Save size={16}/> Save Project</button>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Project</th>
                                        <th className="px-6 py-3">Tech Stack</th>
                                        <th className="px-6 py-3 text-center">Likes</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {displayedProjects.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {p.imageUrl && <img src={p.imageUrl} className="w-10 h-10 rounded object-cover border border-gray-600" alt="thumb" />}
                                                    <div><div className="font-bold text-white">{p.title}</div></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.techStack.slice(0, 3).map((t, i) => <span key={i} className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">{t}</span>)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-mono">{p.likes}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingProject(p)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded"><Edit size={16}/></button>
                                                    <button onClick={() => handleDeleteProject(p.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'skills' && (
                <div className="space-y-6 max-w-6xl mx-auto">
                    {/* ... Skills Tab Content ... */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-2xl font-bold">Skills Manager</h3>
                        <button onClick={() => setEditingSkill({ name: '', category: 'frontend', iconClass: '', imageUrl: '' })} className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors">
                            <Plus size={18} /> Add New Skill
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search skills..." value={skillSearch} onChange={(e) => { setSkillSearch(e.target.value); setSkillPage(1); }} className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary focus:outline-none" />
                    </div>

                    {editingSkill && (
                        <div className="bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-700 animate-in fade-in slide-in-from-top-4 shadow-2xl z-20 relative">
                             {/* ... Skill Edit Form ... */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                                    <input value={editingSkill.name} onChange={e => setEditingSkill({...editingSkill, name: e.target.value})} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Category</label>
                                    <select value={editingSkill.category} onChange={e => setEditingSkill({...editingSkill, category: e.target.value as any})} className={inputClass}>
                                        <option value="frontend">Frontend</option>
                                        <option value="backend">Backend</option>
                                        <option value="tools">Tools</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Devicon Class</label>
                                    <input value={editingSkill.iconClass} onChange={e => setEditingSkill({...editingSkill, iconClass: e.target.value})} className={inputClass} />
                                </div>
                                <div className="md:col-span-2 bg-gray-900 p-4 rounded border border-gray-700">
                                    <label className="block text-sm text-gray-300 mb-2 font-bold flex items-center gap-2">
                                        <ImageIcon size={16}/> Custom Icon
                                    </label>
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex-1 w-full">
                                            <input type="file" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-600" accept="image/*" onChange={handleSkillImageUpload} />
                                        </div>
                                        <div className="w-16 h-16 bg-black rounded flex items-center justify-center border border-gray-600 relative">
                                            {editingSkill.imageUrl ? <img src={editingSkill.imageUrl} className="w-12 h-12 object-contain" /> : <span className="text-xs text-gray-500">None</span>}
                                            {editingSkill.imageUrl && <button onClick={removeSkillImage} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-0.5"><X size={10}/></button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setEditingSkill(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                                <button onClick={handleSkillSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded flex items-center gap-2"><Save size={16}/> Save</button>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3 w-20">Icon</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {displayedSkills.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {s.imageUrl ? <img src={s.imageUrl} className="w-8 h-8 object-contain" /> : <i className={`${s.iconClass} text-2xl`}></i>}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white">{s.name}</td>
                                            <td className="px-6 py-4"><span className="bg-gray-700 px-2 py-1 rounded text-xs">{s.category}</span></td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingSkill(s)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 rounded"><Edit size={16}/></button>
                                                    <button onClick={() => handleDeleteSkill(s.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 rounded"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="space-y-6 relative max-w-6xl mx-auto">
                    {/* ... Messages ... */}
                    {replyModalOpen && currentReplyMsg && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                            <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl w-full max-w-lg p-6">
                                <h3 className="font-bold text-lg mb-4">Reply to {currentReplyMsg.email}</h3>
                                <textarea rows={8} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white mb-4" value={replyBody} onChange={e => setReplyBody(e.target.value)}></textarea>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setReplyModalOpen(false)} className="px-4 py-2 text-gray-300">Cancel</button>
                                    <button onClick={sendReply} className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2"><Send size={16}/> Send</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold">Inbox</h3>
                        {selectedMsgIds.length > 0 && <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Delete ({selectedMsgIds.length})</button>}
                    </div>

                    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3 w-10"><button onClick={toggleSelectAllMessages}><Square size={18}/></button></th>
                                        <th className="px-6 py-3">From</th>
                                        <th className="px-6 py-3">Subject / Message</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {displayedMessages.map(m => (
                                        <tr key={m.id} className={`hover:bg-gray-700/50 ${!m.read ? 'bg-gray-800/80' : ''}`}>
                                            <td className="px-4 py-4 pt-5"><button onClick={() => toggleMessageSelect(m.id)}>{selectedMsgIds.includes(m.id) ? <CheckSquare size={18} className="text-primary"/> : <Square size={18}/>}</button></td>
                                            <td className="px-6 py-4"><div>{m.email}</div></td>
                                            <td className="px-6 py-4">
                                                <div className={!m.read ? 'font-bold text-primary' : ''}>{m.subject}</div>
                                                <div className="text-xs text-gray-400 line-clamp-1">{m.message}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openReplyModal(m)} className="p-2 bg-blue-500/10 text-blue-500 rounded"><Reply size={16}/></button>
                                                    <button onClick={() => handleDeleteMessage(m.id)} className="p-2 bg-red-500/10 text-red-500 rounded"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'stats' && (
                <div className="max-w-6xl mx-auto">
                    <h3 className="text-2xl font-bold mb-6">Visitor Analytics</h3>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-96 shadow-xl mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} itemStyle={{ color: '#fff' }} />
                                <Line type="monotone" dataKey="visits" stroke="#3b82f6" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};