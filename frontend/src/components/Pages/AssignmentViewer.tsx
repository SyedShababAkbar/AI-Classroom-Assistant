import React from 'react';
import { ArrowLeft, Download, FileText, Calendar, Clock, BookOpen } from 'lucide-react';
import { Assignment } from '../../types';
import { useEffect, useState } from "react";

interface AssignmentViewerProps {
  assignment: Assignment | null;
  onBack: () => void;
}

export const AssignmentViewer: React.FC<AssignmentViewerProps> = ({ assignment, onBack }) => {


  const [aiContent, setAiContent] = useState<string | null>(null);

  const fetchAiResponse = async (assignmentId: string) => {
    try {
      const encodedId = encodeURIComponent(assignmentId); // handles spaces, etc.
      const response = await fetch(`http://localhost:5000/api/assignments/${encodedId}/ai-response`);

      if (!response.ok) {
        console.error(`Server responded with status ${response.status}`);
        return;
      }

      const data = await response.json();
      if (data.content) {
        setAiContent(data.content);
      } else {
        console.error("AI response not found in content.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  const [courseName, setCourseName] = useState<string>("");

  useEffect(() => {
    const fetchCourseName = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        const courses = await response.json();
        const matchedCourse = courses.find((c: any) => c.id === assignment?.course);
        setCourseName(matchedCourse ? matchedCourse.name : assignment?.course);
      } catch (error) {
        console.error("Failed to fetch courses", error);
        setCourseName(assignment?.course || "Unknown Course");
      }
    };

    if (assignment) {
      fetchCourseName();
    }
  }, [assignment]);


  if (!assignment) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No assignment selected</p>
        </div>
      </div>
    );
  }

  const parseDueDate = (assignment: any): Date | null => {
    const { dueDate, dueTime } = assignment;
    if (!dueDate) return null;

    const year = dueDate.year;
    const month = dueDate.month - 1; // JS months are 0-based
    const day = dueDate.day;

    const hours = dueTime?.hours || 0;
    const minutes = dueTime?.minutes || 0;

    return new Date(year, month, day, hours, minutes);
  };



  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const parsedDueDate = parseDueDate(assignment);
  const daysUntilDue = parsedDueDate ? getDaysUntilDue(parsedDueDate) : NaN;

  const isUrgent = daysUntilDue <= 1 && assignment.status === 'pending';

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">{line.substring(3)}</h2>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1 text-gray-700">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2 text-gray-700">{line}</p>;
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Assignments
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-lg text-blue-600 font-medium">
                  {assignment.courseName || assignment.course}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {parsedDueDate ? formatDate(parsedDueDate) : 'Invalid Date'}</span>

                  <span className="text-sm font-semibold text-gray-600">
                    {
                      assignment.status === 'completed'
                        ? 'Completed'
                        : parsedDueDate
                          ? parsedDueDate < new Date()
                            ? 'Expired'
                            : daysUntilDue <= 2
                              ? 'Due Soon'
                              : 'Pending'
                          : 'Invalid Date'
                    }
                  </span>

                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                    assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {assignment.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className={`px-4 py-2 rounded-xl text-center font-medium ${assignment.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : isUrgent
                  ? 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
                }`}>
                {assignment.status === 'completed' ? 'Completed' :
                  isUrgent ? 'Due Soon' : 'Pending'}
              </div>

              {daysUntilDue > 0 && assignment.status === 'pending' && (
                <div className="text-center text-sm text-gray-600">
                  {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} remaining
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Description */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Assignment Description</h2>
            <div className="prose max-w-none">
              {renderMarkdown(assignment.description)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {aiContent && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Generated Response</h3>
              <div>{renderMarkdown(aiContent)}</div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {assignment.local_attachment_path && (
                <a
                  href={`http://localhost:5000/static/${assignment.local_attachment_path.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200"
                >
                  <Download className="w-5 h-5" />
                  View PDF
                </a>
              )}


              {assignment.id && (
                <button
                  onClick={() => {
                    fetchAiResponse(assignment.id); // ✅ pass the assignment ID
                  }}


                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors duration-200"
                >
                  <FileText className="w-5 h-5" />
                  View AI Response
                </button>
              )}

            </div>
          </div>

          {/* Assignment Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Course</p>
                <p className="font-medium text-gray-900">{assignment.course}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                  assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {assignment.priority.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
                  }`}>
                  {assignment.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};