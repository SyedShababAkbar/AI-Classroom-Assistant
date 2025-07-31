import React, { useState } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './components/Pages/Dashboard';
import { ProgressTracker } from './components/Pages/ProgressTracker';
import { AssignmentViewer } from './components/Pages/AssignmentViewer';
import { NotificationsLog } from './components/Pages/NotificationsLog';
import { Settings } from './components/Pages/Settings';
import { Assignment } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setCurrentPage('assignment-viewer');
  };

  const handleBackToDashboard = () => {
    setSelectedAssignment(null);
    setCurrentPage('dashboard');
  };


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onViewAssignment={handleViewAssignment} />;
      case 'progress':
        return <ProgressTracker />;
      case 'assignments':
        return <Dashboard onViewAssignment={handleViewAssignment} />;
      case 'assignment-viewer':
        return <AssignmentViewer assignment={selectedAssignment} onBack={handleBackToDashboard} />;
      case 'notifications':
        return <NotificationsLog />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewAssignment={handleViewAssignment} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <Header
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      <main className="flex-1 ml-16">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;