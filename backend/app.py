from flask import Flask, request, jsonify, send_from_directory
from flask import send_file
from flask_cors import CORS
import json
import os
import uuid

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RESPONSE_DIR = os.path.join(BASE_DIR, "Generated_Responses")
ASSIGNMENTS_DIR = os.path.join(BASE_DIR, "Assignments")
ATTACHMENT_DIR = os.path.join(BASE_DIR, "Assignment_Files")
COURSES_FILE = os.path.join(BASE_DIR, "courses.json")
NOTIFICATIONS_FILE = os.path.join(BASE_DIR, "backend/notifications.json")



# @app.route('/static/<path:filename>')
# def serve_static_file(filename):
#     return send_from_directory('', filename)


def load_courses():
    if os.path.exists(COURSES_FILE):
        with open(COURSES_FILE, 'r') as f:
            return json.load(f)
    return {}


# ✅ List all assignments with useful metadata
@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    assignment_list = []
    
    with open('backend/courses.json') as f:
        course_data = json.load(f)
    course_map = course_data 

    try:
        for filename in os.listdir(ASSIGNMENTS_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(ASSIGNMENTS_DIR, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    course_id = data.get('courseId') or data.get('course')
                    course_name = course_map.get(course_id, course_id)

                    assignment_list.append({
                        'id': data.get('id', filename.replace('.json', '')),
                        'title': data.get('title', 'Untitled'),
                        'description': data.get('description', 'No description'),
                        'dueDate': data.get('dueDate', {}),
                        'course': course_id,
                        'courseName': course_name,
                        'status': data.get('status', 'pending'),
                        'priority': data.get('priority', 'medium'),
                        'downloadLink': f"/api/assignments/{filename.replace('.json', '')}/download",
                        'aiResponseFile': f"/api/assignments/{filename.replace('.json', '')}/ai-response"
                    })
                except Exception as file_error:
                    print(f"❌ Error in file {filename}: {file_error}")
                    continue  # Skip broken file

        return jsonify({'assignments': assignment_list})

    except Exception as e:
        print(f"❌ Top-level error: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ Serve AI Response (.md)
@app.route('/api/assignments/<assignment_id>/ai-response', methods=['GET'])
def get_ai_response(assignment_id):
    # Search the JSON files to get the correct ai_response_file path
    for file in os.listdir(ASSIGNMENTS_DIR):
        if file.endswith(".json"):
            file_path = os.path.join(ASSIGNMENTS_DIR, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                assignment = json.load(f)
                if assignment.get("id") == assignment_id:
                    response_path = assignment.get("ai_response_file")
                    if not response_path:
                        return jsonify({"error": "No AI response path set"}), 404

                    full_path = os.path.join(BASE_DIR, response_path)
                    if not os.path.exists(full_path):
                        return jsonify({"error": "AI response file not found"}), 404

                    with open(full_path, 'r', encoding='utf-8') as rf:
                        content = rf.read()
                    return jsonify({"content": content})

    return jsonify({"error": "Assignment not found"}), 404

@app.route('/api/assignments/<assignment_id>/download', methods=['GET'])
def download_attachment(assignment_id):
    try:
        filepath = os.path.join(ASSIGNMENTS_DIR, f"{assignment_id}.json")
        with open(filepath, 'r', encoding='utf-8') as f:
            assignment = json.load(f)

        attachment_path = assignment.get("local_attachment_path", "").replace("\\", "/")
        print("📂 Normalized Attachment path:", attachment_path)

        if not attachment_path or not os.path.exists(attachment_path):
            return jsonify({"error": "Attachment not found", "path": attachment_path}), 404

        abs_path = os.path.abspath(attachment_path)
        print("📁 Absolute path:", abs_path)

        return send_file(abs_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔁 Optional: Serve raw markdown or attachment file (fallback use)
@app.route('/Generated_Responses/<filename>', methods=['GET'])
def get_response_file(filename):
    return send_from_directory(RESPONSE_DIR, filename)

@app.route('/Assignment_Files/<filename>', methods=['GET'])
def get_attachment_file(filename):
    return send_from_directory(ATTACHMENT_DIR, filename)


@app.route('/api/assignments/<assignment_id>/status', methods=['PUT'])
def update_assignment_status(assignment_id):
    data = request.get_json()
    new_status = data.get('status')

    if new_status not in ['pending', 'completed']:
        return jsonify({"error": "Invalid status"}), 400

    assignment_files = os.listdir(ASSIGNMENTS_DIR)
    matched_file = None

    # 🔍 Find the file by ID
    for filename in assignment_files:
        if filename.endswith(".json"):
            filepath = os.path.join(ASSIGNMENTS_DIR, filename)
            with open(filepath, 'r') as f:
                assignment = json.load(f)
                if assignment.get("id") == assignment_id:
                    matched_file = filepath
                    break

    if not matched_file:
        return jsonify({"error": "Assignment not found"}), 404

    # ✅ Update the status
    with open(matched_file, 'r') as f:
        assignment_data = json.load(f)

    assignment_data['status'] = new_status

    with open(matched_file, 'w') as f:
        json.dump(assignment_data, f, indent=2)
        
    print(f"Received status update for {assignment_id}: {new_status}")
    return jsonify({"message": f"Status updated to '{new_status}'"}), 200
    




def load_json_file(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_json_file(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)



# ✅ Return course names (mock or static)
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = load_json_file(COURSES_FILE)
    return jsonify(courses)


@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    try:
        with open(NOTIFICATIONS_FILE, "r", encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify([]), 200
    

@app.route('/api/settings/email', methods=['POST'])
def update_email():
    data = request.json
    email = data.get("email")

    if not email:
        return {"error": "Email is required"}, 400

    try:
        config_path = os.path.join(BASE_DIR, 'config.json')
        with open(config_path, 'r') as f:
            config = json.load(f)

        config['receiverEmail'] = email

        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)

        return {"message": "Email updated successfully"}
    except Exception as e:
        return {"error": str(e)}, 500
    

if __name__ == '__main__':
    app.run(port=5000)
