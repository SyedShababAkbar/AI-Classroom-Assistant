# 🚀 Auto Fetch & Process Assignments 

import os
import json
import re
import io
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# ✅ Import response processor
from chatgpt_generate import process_assignment_file

COURSES_FILE = "courses.json"

# 1. Load existing courses from file
if os.path.exists(COURSES_FILE):
    with open(COURSES_FILE, "r") as f:
        courses_data = json.load(f)
else:
    courses_data = {}

# 📁 Paths
ASSIGNMENTS_DIR = "Assignments"
FETCHED_IDS_PATH = "fetched_ids.json"
TOKEN_PATH = "token.json"
CREDENTIALS_PATH = "credentials.json"
ASSIGNMENT_FILES_DIR = "Assignment_Files"

# 📅 Only fetch assignments created ON or AFTER this date
CUTOFF_DATE = datetime(2025, 7, 13) # set date which u want

# 🔐 Required Scopes
SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.course-work.readonly',
    'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
]

# ✅ Authenticate with Google APIs
def authenticate():
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
    return creds

# ✅ Load fetched assignment IDs
def load_fetched_ids():
    if not os.path.exists(FETCHED_IDS_PATH):
        return {}
    try:
        with open(FETCHED_IDS_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print("⚠️ fetched_ids.json is invalid or empty. Resetting...")
        return {}

# ✅ Sanitize filenames
def sanitize_filename(name):
    return re.sub(r'[^\w\-_\. ]', '_', name)

# ✅ Download attachment from Google Drive
def download_file_from_drive(service, file_id, file_name):
    if not os.path.exists(ASSIGNMENT_FILES_DIR):
        os.makedirs(ASSIGNMENT_FILES_DIR)
    request = service.files().get_media(fileId=file_id)
    filepath = os.path.join(ASSIGNMENT_FILES_DIR, file_name)
    fh = io.FileIO(filepath, 'wb')
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        status, done = downloader.next_chunk()
        print(f"⬇️ Downloading {file_name}... {int(status.progress() * 100)}%")

# ✅ Save assignment and download attached file (if available)
def save_assignment(course_name, assignment, drive_service, course_id):
    
    sanitized_course = sanitize_filename(course_name)
    sanitized_title = sanitize_filename(assignment['title'])

    filename = f"{sanitized_course}_{sanitized_title}.json"
    filepath = os.path.join(ASSIGNMENTS_DIR, filename)

    # Add AI-generated response path
    assignment["ai_response_file"] = f"Generated_Responses/{sanitized_course}_{sanitized_title}_response.md"

    assignment['courseName'] = course_name
    assignment['courseId'] = course_id
   

    materials = assignment.get("materials", [])
    for material in materials:
        drive_info = material.get("driveFile", {}).get("driveFile", {}) 
        file_id = drive_info.get("id")
        file_title = drive_info.get("title", "Attachment")
        if file_id and drive_service:
            download_file_from_drive(drive_service, file_id, file_title)
            assignment['local_attachment_path'] = os.path.join(ASSIGNMENT_FILES_DIR, file_title)

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(assignment, f, indent=2)

    # 🧠 Generate AI response immediately
    process_assignment_file(filepath, drive_service)

# ✅ Main function
def main():
    creds = authenticate()
    classroom_service = build('classroom', 'v1', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)

    if not os.path.exists(ASSIGNMENTS_DIR):
        os.makedirs(ASSIGNMENTS_DIR)

    fetched_records = load_fetched_ids()
    updated_records = fetched_records.copy()

    courses = classroom_service.courses().list().execute().get('courses', [])

    for course in courses:
        course_id = course['id']
        course_name = course['name']
        print(f"\n📘 Course: {course_name}")
        # 🔄 Update courses_data with new courseId-name pair
        if course_id not in courses_data:
            courses_data[course_id] = course_name


        try:
            assignments = classroom_service.courses().courseWork().list(courseId=course_id).execute().get('courseWork', [])
            print(f"  🔍 Found {len(assignments)} assignments in course '{course_name}'")
            
            for assignment in assignments:
                assignment_id = assignment['id']
                last_updated = assignment.get('updateTime')
                previous_update = fetched_records.get(assignment_id)

                # Skip if old
                created_at_str = assignment.get("creationTime", "")[:19]
                if created_at_str:
                    try:
                        created_at = datetime.strptime(created_at_str, "%Y-%m-%dT%H:%M:%S")
                        if created_at < CUTOFF_DATE:
                            continue
                    except Exception as e:
                        print(f"⚠️ Invalid creationTime: {e}")
                        continue

                if previous_update != last_updated:
                    try:
                        save_assignment(course_name, assignment, drive_service, course_id)
                        print(f"  ➕ Saved: {assignment['title']}")
                        updated_records[assignment_id] = last_updated
                    except Exception as e:
                        print(f"  ❌ Failed to save: {assignment['title']} | Error: {e}")

        except Exception as e:
            print(f"⚠️ Error fetching from {course_name}: {e}")

    
    # Save updated assignment ID list
    with open(FETCHED_IDS_PATH, 'w') as f:
        json.dump(updated_records, f, indent=2)
        print(f"📝 Saving {len(updated_records)} fetched assignment IDs to fetched_ids.json")
        
    # 💾 Save updated courses.json
    with open("backend/courses.json", "w", encoding="utf-8") as f:
        json.dump(courses_data, f, indent=2)
        print(f"✅ Updated backend/courses.json with {len(courses_data)} courses")
    

if __name__ == '__main__':
    main()
