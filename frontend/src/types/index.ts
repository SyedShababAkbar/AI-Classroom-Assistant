export interface Assignment {
  id: string;
  title: string;
  course: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  downloadLink?: string;
  aiResponseFile?: string;
  courseName?: string;
  local_attachment_path?: string;

}

export interface Course {
  id: string;
  name: string;
  color: string;
  assignments: Assignment[];
}

export interface Notification {
  id: string;
  assignment: string;
  course: string;
  sentTime: Date;
  channel: 'email' | 'whatsapp' | 'both';
}

export interface MarksEntry {
  id: string;
  assignmentName: string;
  course: string;
  marksObtained: number;
  totalMarks: number;
  dateAdded: Date;
}

export interface UserSettings {
  email: string;
  notificationPreferences: 'email' | 'whatsapp' | 'both';
  theme: 'light' | 'dark';
  name: string;
  studentId: string;
}