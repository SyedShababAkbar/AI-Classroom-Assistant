# 🚀 Generate AI Response for Assignments

import os
import json
import openai
import fitz  
import docx
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
from email_notifier import send_email

# 📁 Folder Paths
ASSIGNMENTS_DIR = "Assignments"
RESPONSES_DIR = "Generated_Responses"
ASSIGNMENT_FILES_DIR = "Assignment_Files"
TOKEN_PATH = "token.json"
CREDENTIALS_PATH = "credentials.json"

# 🔐 OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

# 📌 Ensure folders exist
os.makedirs(RESPONSES_DIR, exist_ok=True)
os.makedirs(ASSIGNMENT_FILES_DIR, exist_ok=True)

# ✅ Auth to Google Drive
SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly'
]

# Email dynamic loading
CONFIG_PATH = "config.json"

def load_receiver_email():
    try:
        with open(CONFIG_PATH, 'r') as f:
            config = json.load(f)
            return config.get("receiverEmail", "default@email.com")
    except:
        return "default@email.com"


def authenticate_google():
    creds = None
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)

# 📌 File Reading Functions
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        return "\n".join([page.get_text() for page in doc])
    except Exception as e:
        return f"(Error reading PDF: {e})"

def extract_text_from_docx(docx_path):
    try:
        doc = docx.Document(docx_path)
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        return f"(Error reading DOCX: {e})"

def download_file_from_drive(drive_service, file_id, file_name):
    try:
        request = drive_service.files().get_media(fileId=file_id)
        filepath = os.path.join(ASSIGNMENT_FILES_DIR, file_name)
        fh = io.FileIO(filepath, 'wb')
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
        print(f"⬇️ Downloaded missing file: {file_name}")
        return filepath
    except Exception as e:
        return f"(Failed to download file from Drive: {e})"

def extract_text_from_file(filename, file_id=None, drive_service=None):
    ext = filename.split('.')[-1].lower()
    filepath = os.path.join(ASSIGNMENT_FILES_DIR, filename)

    # ❗ Try to download if not exists
    if not os.path.exists(filepath):
        if drive_service and file_id:
            result = download_file_from_drive(drive_service, file_id, filename)
            if isinstance(result, str) and result.startswith("("):  # error string
                return result
        else:
            return f"(Assignment file '{filename}' not found locally)"

    # 🔍 Read the file
    if ext == "pdf":
        return extract_text_from_pdf(filepath)
    elif ext == "docx":
        return extract_text_from_docx(filepath)
    elif ext == "txt":
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return f"(Unsupported file type: {ext})"

# 📌 Prompt Builder
def generate_prompt(title, description):
    return f"""
You are an intelligent and helpful academic assistant. Your task is to read the following assignment statement and do two things:

1. **Answer the Assignment** clearly, to the point, and academically.
2. **Break it down into steps** that a student could follow to complete it themselves.

---

📘 **Assignment Title**: {title}

📝 **Statement**:
{description}

---

Please format your response in markdown using clear sections.
"""

# 📌 ChatGPT Handler
def generate_assignment_response(prompt):
    client = openai.OpenAI()
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert academic assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content


# 📌 Main Processor
def process_assignment_file(filepath, drive_service):
    with open(filepath, 'r', encoding='utf-8') as f:
        assignment = json.load(f)

    title = assignment.get("title", "Untitled Assignment")
    description = assignment.get("description", "").strip()

    # 📎 Always try extracting text from all attachments (if any)
    materials = assignment.get("materials", [])
    attachment_texts = []

    for material in materials:
        try:
            drive_file = material.get("driveFile", {}).get("driveFile", {})
            filename = drive_file.get("title")
            file_id = drive_file.get("id")
            if not filename or not file_id:
                continue

            ext = filename.split('.')[-1].lower()
            if ext not in ["pdf", "docx", "txt"]:
                print(f"⚠️ Skipping unsupported file: {filename}")
                continue

            text = extract_text_from_file(filename, file_id, drive_service)
            if text:
                attachment_texts.append(f"📎 **{filename}**:\n{text.strip()}")
        except Exception as e:
            attachment_texts.append(f"(Error extracting from attachment: {e})")

    if attachment_texts:
        description += "\n\n---\n📂 **Attached File Content:**\n\n" + "\n\n---\n".join(attachment_texts)

    prompt = generate_prompt(title, description)
    print("🎯 Prompt sent to OpenAI...")

    try:
        result = generate_assignment_response(prompt)
        filename = os.path.basename(filepath).replace(".json", "_response.md")
        output_path = os.path.join(RESPONSES_DIR, filename)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(result)
        print(f"✅ Response saved to {output_path}\n")

        # ✅ Send Email Notification
        course_id = assignment.get("courseId", "Unknown")
        course_name = "Unknown"
        try:
            with open("backend/courses.json", "r", encoding="utf-8") as f:
                courses_map = json.load(f)
            course_name = courses_map.get(course_id, "Unknown")
        except Exception as e:
            print(f"⚠️ Could not load course name: {e}")

        due = assignment.get("dueDate", {})
        due_str = f"{due.get('day', '')}/{due.get('month', '')}/{due.get('year', '')}" if due else "N/A"

        email_subject = f"📢 New Assignment: {title}"
        email_body = f"""📘 Course: {course_name} ({course_id})
📄 Title: {title}
📅 Due Date: {due_str}
📂 Response File: {output_path}

Your AI assistant has generated a solution. Please review it!"""

        receiver_email = load_receiver_email()
        send_email(email_subject, email_body, receiver_email, {
            "id": course_id,
            "name": course_name
        })

    except Exception as e:
        print(f"❌ Error from OpenAI: {e}\n")


# 📌 Entry
def main():
    drive_service = authenticate_google()
    assignment_files = [f for f in os.listdir(ASSIGNMENTS_DIR) if f.endswith(".json")]
    for file in assignment_files:
        response_file = file.replace(".json", "_response.md")
        response_path = os.path.join(RESPONSES_DIR, response_file)
        if not os.path.exists(response_path):
            process_assignment_file(os.path.join(ASSIGNMENTS_DIR, file), drive_service)

if __name__ == '__main__':
    main()
