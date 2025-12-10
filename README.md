<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This repository contains everything you need to run and manage your AI Studio app locally or in production.

View your app in AI Studio: https://ai.studio/apps/drive/190DI_1O5mJLQzXkUDINuR8aXY3kaAR8E

---

## Features

- **AI Assistant**: Chat with an AI assistant powered by Gemini API.
- **Admin Panel**: Manage projects, skills, messages, and site settings.
- **Analytics**: View visitor statistics for the last 30 days.
- **Dynamic Content**: Multi-language support for projects and site content.
- **Secure Login**: Admin authentication with hashed passwords.
- **RESTful APIs**: Endpoints for managing projects, skills, messages, and settings.

---

## Run Locally

### Prerequisites

- Node.js
- PHP
- MySQL

### Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   - Update database credentials in `db_connect.php`:
     ```php
     $host = 'your_db_host';
     $db   = 'your_db_name';
     $user = 'your_db_user';
     $pass = 'your_db_password';
     ```
   - Create a MySQL database and import the provided `database.sql` file.

3. **Configure environment variables**:
   - Create a `.env` file in the root directory.
   - Add your Gemini API key and other necessary configurations:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   - Open your browser and navigate to `http://localhost:3000`.
   - Access the admin panel at `http://localhost:3000/admin`.

---

## API Endpoints

### **Stats API**
- **GET** `/api/stats.php`: Fetch visitor stats for the last 30 days.
- **POST** `/api/stats.php`: Record a new visit.

### **Skills API**
- **GET** `/api/skills.php`: Fetch all skills.
- **POST** `/api/skills.php`: Add or update a skill.
- **DELETE** `/api/skills.php?id={id}`: Delete a skill.

### **Projects API**
- **GET** `/api/projects.php`: Fetch all projects.
- **POST** `/api/projects.php`: Add, update, or like a project.
- **DELETE** `/api/projects.php?id={id}`: Delete a project.

### **Messages API**
- **GET** `/api/messages.php`: Fetch all messages.
- **POST** `/api/messages.php`: Send, reply, or delete messages.
- **DELETE** `/api/messages.php?id={id}`: Delete a message.

### **Settings API**
- **GET** `/api/settings.php`: Fetch site settings.
- **POST** `/api/settings.php`: Update site settings.

### **Login API**
- **POST** `/api/login.php`: Authenticate admin user.

---

## Admin Panel

The admin panel allows you to manage the following:

1. **Site Settings**:
   - Update hero section content, contact info, and SMTP settings.
   - Upload and crop the hero image.

2. **Projects**:
   - Add, edit, or delete projects.
   - Manage multi-language descriptions and tech stacks.

3. **Skills**:
   - Add, edit, or delete skills.
   - Upload custom icons or use Devicon classes.

4. **Messages**:
   - View, reply to, or delete messages.
   - Bulk delete messages.

5. **Analytics**:
   - View visitor statistics with a line chart.

---

## Deployment

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to a server**:
   - Copy the built files to your server.
   - Ensure PHP and MySQL are configured correctly.

---

## License

This project is licensed under the [MIT License](LICENSE).

