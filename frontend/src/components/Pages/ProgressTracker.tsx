import { ToggleLeft, ToggleRight } from 'lucide-react';
import { Assignment } from '../../types';
import { AssignmentCard } from '../Common/AssignmentCard';
import { ProgressBar } from '../Common/ProgressBar';
import { RadialProgress } from '../Common/RadialProgress';
import { useEffect, useState } from "react";
import axios from "axios";

type AssignmentsAPIResponse = {
  assignments: Assignment[];
};

export const ProgressTracker: React.FC = () => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await axios.get<AssignmentsAPIResponse>("http://127.0.0.1:5000/api/assignments");
        console.log("Assignments Response:", response.data);

        const data = response.data.assignments.map((a: any) => {
          let dueDateObj: Date | null = null;

          if (a.dueDate && a.dueDate.year && a.dueDate.month && a.dueDate.day) {
            const { year, month, day } = a.dueDate;
            const { hours = 0, minutes = 0 } = a.dueTime || {};
            dueDateObj = new Date(year, month - 1, day, hours, minutes);
          }

          return {
            ...a,
            dueDate: dueDateObj,
          } as Assignment;
        });

        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch assignments", error);
      }
    };

    fetchAssignments();
  }, []);

  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const totalCount = assignments.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredAssignments = assignments.filter(a =>
    showCompleted ? a.status === 'completed' : a.status === 'pending'
  );

  const handleToggleStatus = async (id: string) => {
    console.log("Clicked toggle for assignment ID:", id);
    const current = assignments.find(a => a.id === id);
    if (!current) return;

    const newStatus = current.status === 'completed' ? 'pending' : 'completed';

    setAssignments(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: newStatus } : a
      )
    );

    try {
      await axios.put(`http://127.0.0.1:5000/api/assignments/${id}/status`, {
        status: newStatus,
      });
      console.log(`Status updated to ${newStatus} for assignment ${id}`);
    } catch (error) {
      console.error("Failed to update assignment status:", error);
      setAssignments(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: current.status } : a
        )
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracker</h1>
        <p className="text-gray-600">Track your assignment completion progress</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Overall Progress</h2>
            <div className="space-y-4">
              <ProgressBar
                progress={progressPercentage}
                label="Completion Rate"
                color="bg-gradient-to-r from-blue-500 to-green-500"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Completed: {completedCount}</span>
                <span>Total: {totalCount}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <RadialProgress
              progress={progressPercentage}
              size={160}
              strokeWidth={12}
              label="Overall"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">View Assignments</h2>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${!showCompleted ? 'text-blue-600' : 'text-gray-500'}`}>
              Pending ({assignments.filter(a => a.status === 'pending').length})
            </span>

            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center p-1 bg-gray-100 rounded-full transition-colors duration-200 hover:bg-gray-200"
            >
              {showCompleted ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>

            <span className={`text-sm font-medium ${showCompleted ? 'text-green-600' : 'text-gray-500'}`}>
              Completed ({assignments.filter(a => a.status === 'completed').length})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {showCompleted ? 'Completed' : 'Pending'} Assignments ({filteredAssignments.length})
        </h3>

        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleStatus={handleToggleStatus}
                showToggle={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400">📋</span>
            </div>
            <p className="text-gray-500">
              No {showCompleted ? 'completed' : 'pending'} assignments found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
