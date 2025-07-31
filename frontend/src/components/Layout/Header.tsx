import React from 'react';
import { 
  Home, 
  BarChart3, 
  FileText, 
  Bell, 
  Award, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const navigation = [
  { name: 'Dashboard', icon: Home, id: 'dashboard' },
  { name: 'Progress', icon: BarChart3, id: 'progress' },
  { name: 'Assignments', icon: FileText, id: 'assignments' },
  { name: 'Notifications', icon: Bell, id: 'notifications' },
  { name: 'Marks Summary', icon: Award, id: 'marks' },
  { name: 'Settings', icon: Settings, id: 'settings' }
];

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  onPageChange, 
  isMobileMenuOpen, 
  onToggleMobileMenu 
}) => {
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 ml-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl mr-3">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Assignment Assistant</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`
                      flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={onToggleMobileMenu}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white ml-16">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      onToggleMobileMenu();
                    }}
                    className={`
                      w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
};