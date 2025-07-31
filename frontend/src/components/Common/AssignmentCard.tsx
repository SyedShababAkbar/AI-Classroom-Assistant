import React from 'react';
import { Calendar, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Assignment } from '../../types';


interface AssignmentCardProps {
  assignment: Assignment;
  onToggleStatus?: (id: string) => void;
  onViewDetails?: (assignment: Assignment) => void;
  showToggle?: boolean;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onToggleStatus,
  onViewDetails,
  showToggle = false
}) => {
  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const parseDueDate = (assignment: any): Date | null => {
    const { dueDate, dueTime } = assignment;
    if (!dueDate) return null;

    // If it's already a Date object, return as is
    if (dueDate instanceof Date) return dueDate;

    const year = dueDate.year;
    const month = dueDate.month - 1; // JS months are 0-based
    const day = dueDate.day;
    const hours = dueTime?.hours || 0;
    const minutes = dueTime?.minutes || 0;

    return new Date(year, month, day, hours, minutes);
  };


  const parsedDueDate = parseDueDate(assignment);
  const daysUntilDue = parsedDueDate ? getDaysUntilDue(parsedDueDate) : NaN;

  const isUrgent = daysUntilDue <= 1 && assignment.status === 'pending';
  const isOverdue = daysUntilDue < 0 && assignment.status === 'pending';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className={`
      bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-md
      ${isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-100'}
      ${isOverdue ? 'border-red-300 bg-red-100' : ''}
    `}>


      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
              {isUrgent && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-blue-600 font-medium">
              {assignment.courseName || assignment.course}
            </p>
          </div>

          {showToggle && onToggleStatus && (
            <button
              onClick={() => onToggleStatus(assignment.id)}

              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                ${assignment.status === 'completed'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <CheckCircle className="w-4 h-4" />
              {assignment.status === 'completed' ? 'Completed' : 'Mark Done'}
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
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

            {isOverdue && (
              <span className="text-red-600 font-medium">(Overdue)</span>
            )}
            {isUrgent && !isOverdue && (
              <span className="text-red-600 font-medium">(Due Soon)</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${assignment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-orange-100 text-orange-800'
                }
              `}>
                {assignment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {onViewDetails && (
            <button
              onClick={() => onViewDetails(assignment)}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200"
            >
              <FileText className="w-4 h-4" />
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};