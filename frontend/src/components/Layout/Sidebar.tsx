import React, { useEffect, useState } from 'react';
import { Settings, User } from 'lucide-react';
import { FaInstagram, FaYoutube, FaFacebook, FaTiktok } from 'react-icons/fa';


interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onPageChange, currentPage }) => {
  const [userName, setUserName] = useState<string>('Guest');
  const [studentId, setStudentId] = useState<string>('STXXXXXXX');

  useEffect(() => {
    const storedSettings = localStorage.getItem('userSettings');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setUserName(parsed.name || 'Guest');
      setStudentId(parsed.studentId || 'STXXXXXXX');
    }
  }, []);

  return (
    <div className="fixed left-0 top-0 h-full w-16 hover:w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col z-30 transition-all duration-300 ease-in-out group">

      {/* Spacer to push bottom items down */}
      <div className="flex-1"></div>

      {/* Social Media Icons */}
      <div className="p-4 space-y-2">
        <button
          className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-pink-500 transition-all duration-200"
          onClick={() => window.open("https://www.instagram.com/shababxagents?igsh=NGpwbG5tbm5zbGhr", "_blank")}
        >
          <FaInstagram size={20} className="flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Instagram
          </span>
        </button>

        <button
          className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all duration-200"
          onClick={() => window.open("https://youtube.com/@the_mr.hacker1?si=g9u7ZSKjvObO8u1U", "_blank")}
        >
          <FaYoutube size={20} className="flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            YouTube
          </span>
        </button>

        <button
          className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200"
          onClick={() => window.open("https://www.facebook.com/share/1ApwZsmDis/", "_blank")}
        >
          <FaFacebook size={20} className="flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Facebook
          </span>
        </button>

        <button
          className="w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-all duration-200"
          onClick={() => window.open("https://www.tiktok.com/@the_mr.hacker?_t=ZS-8yTnzU3Ujjd&_r=1", "_blank")}
        >
          <FaTiktok size={20} className="flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            TikTok
          </span>
        </button>
      </div>


      {/* Bottom Section - Settings and Admin */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => onPageChange('settings')}
          className={`
            w-full flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200
            ${currentPage === 'settings'
              ? 'bg-blue-50 text-blue-600 shadow-sm'
              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
            }
          `}
        >
          <Settings size={20} className="flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Settings
          </span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center p-3 bg-gray-50 rounded-xl">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">S</span>
          </div>
          <div className="ml-3 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <p className="text-sm font-medium text-gray-900">{userName || 'Guest'}</p>
            <p className="text-xs text-gray-500">{studentId || 'STXXXXXXX'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
