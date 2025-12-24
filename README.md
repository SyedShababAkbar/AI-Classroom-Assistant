# 🤖 AI Classroom Assistant

A smart desktop dashboard that helps students stay on top of their assignments! This app automatically fetches assignments from Google Classroom, generates AI-based guidance using ChatGPT, and tracks progress via an elegant UI. Built with **React + Flask + Electron**.

---

🚀 Features

* 📥 Automatically fetch assignments from Google Classroom
* ✍️ Generates detailed task breakdown using ChatGPT
* 📂 View assignment details, attachments, and AI responses
* 🟢 Track progress with pending/completed toggles
* 🔔 Email and WhatsApp notifications for deadlines
* 🖥️ Runs as a desktop app via Electron (no browser needed!)

---

📸 Screenshots

<img width="1896" height="920" alt="Screenshot 2025-07-31 130027" src="https://github.com/user-attachments/assets/c482ccc2-380a-420a-a93d-f2bd49cf03e6" />
<img width="1812" height="841" alt="Screenshot 2025-07-31 130132" src="https://github.com/user-attachments/assets/c680edd3-a6da-4823-9c3d-200ea16d2688" />
<img width="1919" height="926" alt="Screenshot 2025-07-31 130109" src="https://github.com/user-attachments/assets/f36262c0-7318-49fd-bf75-20f6a1d3a184" />
<img width="1919" height="932" alt="Screenshot 2025-07-31 130117" src="https://github.com/user-attachments/assets/ab07b863-973e-4356-a2af-1bb63e07632e" />
<img width="1812" height="841" alt="Screenshot 2025-07-31 130132" src="https://github.com/user-attachments/assets/90e0e790-0cea-4430-bf4b-d25bd0e2a557" />
<img width="312" height="866" alt="image" src="https://github.com/user-attachments/assets/eea559a2-58e9-4f26-b09e-94a55adb2e18" />

---

🧱 Tech Stack

* Frontend: **React + Vite + Tailwind CSS**
* Backend: **Flask + Python**
* Desktop Shell: **Electron.js**
* AI Engine: **OpenAI GPT-4 API**
* Notifications: **Gmail SMTP & WhatsApp API (optional)**

---

🛠️ Local Installation

1. Clone the Repository

```bash
**git clone https://github.com/yourusername/AI_Classroom_Assistant.git
**cd AI_Classroom_Assistant
```

2. Backend Setup (Python + Flask)

```bash
cd backend
pip install -r requirements.txt
```

3. Frontend Setup (React + Vite)

```bash
cd ../frontend
npm install
npm run build  # This creates the dist folder
```

4. Run the Flask App

```bash
cd ../backend
python app.py
```

Visit: http://127.0.0.1:5000/

---

💬 OpenAI Integration

This app uses OpenAI's GPT to generate assignment guidance.

🔑 Add your OpenAI Key

Instead of hardcoding, we read it from system variables. Set it up:

```bash
set OPENAI_API_KEY=your-key-here  # For Windows
export OPENAI_API_KEY=your-key-here  # For Linux/macOS
```

Or permanently set it via your system environment variable settings.

---

✉️ Email Notifications (Optional)

If you want to receive deadline reminders via Gmail:

1. Generate an **App Password** in your Gmail account.
2. In `email_notifier.py`, update:

   * Sender email
   * App password
3. In `config.json`, update:

```json
{
  "receiverEmail": "your-email@gmail.com"
}
```

---

💬 WhatsApp Notifications (Optional)

You can integrate Twilio API for WhatsApp notifications:

Setup Steps:

1. Create account at [https://www.twilio.com/whatsapp](https://www.twilio.com/whatsapp)
2. Verify your WhatsApp number.
3. Get the following:

   * `TWILIO_ACCOUNT_SID`
   * `TWILIO_AUTH_TOKEN`
   * `TWILIO_WHATSAPP_NUMBER`
4. Create a Python script (e.g., `whatsapp_notify.py`) using Twilio SDK to send messages.
5. Call this script when deadlines approach or assignments are updated.

---

🖥️ Run as Desktop App (Electron)

You can convert the project into a desktop app:

1. Install Electron

```bash
cd electron-app
npm install
```

2. Start App

```bash
npm start
```

Electron will open your app in a native window.

🧼 Clean Reversal

If you want to go back to browser version:

* Delete `electron-app/`
* Revert `app.py` static folder to: `static_folder="../frontend/dist"`

---

🌐 Deployment (Optional)

You can host the app online:

Option 1: Flask + Vercel/Render

* Host Flask backend on Render
* Host `dist/` folder via Netlify/Vercel

### Option 2: Docker

* Containerize Flask + Frontend in one image
* Deploy to any VPS or cloud provider

---

🎥 YouTube Setup Tutorial (Coming Soon)

We’ll add a full step-by-step YouTube video to:

* Setup Google Classroom API
* Generate your `credentials.json`
* Setup OpenAI key & run the app
* Build and test notifications

🔗 **Video Link**: [https://youtube.com/@automate_with_shabab](https://youtu.be/H8ZDPKbvcdo?si=fgcvOlEqrHZD2h2m)

---

📁 Folder Structure

```
AI_Classroom_Assistant/
├── backend/            # Flask API + logic
│   └── app.py          # Main backend app
│   └── config.json     # Receiver email
├── frontend/           # React + Tailwind UI
│   └── dist/           # Built frontend for Flask
├── electron-app/       # Optional: Desktop version
├── Assignments/        # Assignment JSONs
├── Generated_Responses/ # AI-generated content
```

---

🙋‍♂️ Contribution

If you'd like to improve this project, feel free to fork and submit pull requests.

---

🔒 License

MIT License — Free for personal or academic use.

---

👨‍💻 Author

Created by **Shabab Akbar** | 2025

---

📣 Like this project?

If you found this project helpful or inspiring, **support it by following me on social media** 💙

🔗 [Instagram](https://www.instagram.com/shababxagents?igsh=NGpwbG5tbm5zbGhr)  
🔗 [YouTube](https://youtube.com/@the_mr.hacker1?si=g9u7ZSKjvObO8u1U)  
🔗 [Facebook](https://www.facebook.com/share/1ApwZsmDis/)  

---

