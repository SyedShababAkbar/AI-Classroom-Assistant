import smtplib
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os

NOTIFICATION_LOG_FILE = "notifications.json"

def log_notification(subject, course, channel="email"):
    new_entry = {
        "id": str(int(datetime.now().timestamp())),
        "assignment": subject,
        "course": course,
        "channel": channel,
        "sentTime": datetime.now().isoformat()
    }

    try:
        with open(NOTIFICATION_LOG_FILE, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []

    data.append(new_entry)

    with open(NOTIFICATION_LOG_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def send_email(subject, body, to_email, course_info):
    sender_email = "sender_email@example.com"
    app_password = "Your gmail app password"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.send_message(msg)
        server.quit()
        print("✅ Email sent successfully!")

        # --- UPDATE backend/notifications.json ---
        notification_data = {
            "id": str(int(datetime.now().timestamp())),
            "assignment": subject,
            "course": course_info.get("name", "Unknown"),
            "channel": "email",
            "sentTime": datetime.now().isoformat()
        }


        notifications_path = os.path.join("backend", "notifications.json")

        if os.path.exists(notifications_path):
            with open(notifications_path, "r") as f:
                notifications = json.load(f)
        else:
            notifications = []

        notifications.append(notification_data)

        with open(notifications_path, "w") as f:
            json.dump(notifications, f, indent=2)

    except Exception as e:
        error_message = f"❌ Failed to send email: {e}"
        print(error_message)
        with open("email_errors.log", "a", encoding="utf-8") as log_file:
            log_file.write(f"{datetime.now()} - {error_message}\n")