
import { Project, Skill, Message, SiteSettings, VisitorStat } from '../types';

const API_BASE = '/api'; // Relative path assuming PHP files are in public/api folder

class DataService {
  
  // --- Auth ---
  async login(email: string, pass: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pass })
      });
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error("Login Error:", e);
      return false;
    }
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${API_BASE}/projects.php`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async saveProject(project: Project): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/projects.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      // Using POST with action or DELETE method depending on server config. 
      // Standard fetch DELETE:
      const res = await fetch(`${API_BASE}/projects.php?id=${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async likeProject(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/projects.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', id })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // --- Skills ---
  async getSkills(): Promise<Skill[]> {
    try {
      const res = await fetch(`${API_BASE}/skills.php`);
      if (!res.ok) throw new Error('Failed to fetch skills');
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async saveSkill(skill: Skill): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/skills.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async deleteSkill(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/skills.php?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // --- Settings ---
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings.php`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch (e) {
      // Return default empty structure to prevent crashes if API fails
      return {
        dbHost: '', dbUser: '', dbPass: '', dbName: '',
        smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '',
        recaptchaSiteKey: '', recaptchaSecretKey: '',
        heroTitle: 'Hossein Farahkordmahaleh',
        heroSubtitle: 'Full Stack Developer',
        aboutText: { en: '', fi: '', fa: '' },
        contactEmail: '', contactPhone: '', mapEmbedUrl: ''
      };
    }
  }

  async saveSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  // --- Messages ---
  async getMessages(): Promise<Message[]> {
    try {
      const res = await fetch(`${API_BASE}/messages.php`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  async sendMessage(msg: Omit<Message, 'id' | 'date' | 'read'>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/messages.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/messages.php?id=${id}`, { method: 'DELETE' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async deleteMessages(ids: string[]): Promise<boolean> {
    try {
        // Sending bulk delete as a POST with specific action or body
        const res = await fetch(`${API_BASE}/messages.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk_delete', ids })
        });
        return res.ok;
    } catch (e) {
        return false;
    }
  }

  async markMessageRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/messages.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', id })
      });
    } catch (e) {}
  }

  async sendReply(to: string, subject: string, body: string): Promise<boolean> {
      try {
        const res = await fetch(`${API_BASE}/messages.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reply', to, subject, body })
        });
        return res.ok;
      } catch (e) {
          return false;
      }
  }

  // --- Stats ---
  async getStats(): Promise<VisitorStat[]> {
    try {
      const res = await fetch(`${API_BASE}/stats.php`);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      return [];
    }
  }

  async incrementVisit(): Promise<void> {
     try {
         await fetch(`${API_BASE}/stats.php`, { method: 'POST', body: JSON.stringify({action: 'visit'})});
     } catch (e) {}
  }
}

export const dbService = new DataService();
