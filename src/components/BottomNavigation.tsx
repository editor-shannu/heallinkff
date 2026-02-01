import React from "react";
import { useApp } from "../contexts/AppContext";
import { Button } from "./ui/button";
import { 
  Home, 
  ClipboardList,
  MessageCircle, 
  Bell, 
  Settings 
} from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  const { t } = useApp();

  const tabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'records', icon: ClipboardList, label: t('nav.records') },
    { id: 'chatbot', icon: MessageCircle, label: t('nav.chatbot') },
    { id: 'notifications', icon: Bell, label: t('nav.notifications') },
    { id: 'settings', icon: Settings, label: t('nav.settings') }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            aria-label={`Navigate to ${label.toLowerCase()} screen`}
            title={label}
            className={`flex flex-col items-center space-y-1 p-2 min-w-0 flex-1 transition-all duration-200 hover:scale-105 ${
              activeTab === id 
                ? 'text-[#3B82F6] bg-blue-50 rounded-lg' 
                : 'text-gray-600 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg'
            }`}
            onClick={() => onTabChange(id)}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'text-[#3B82F6]' : 'text-gray-600'}`} aria-hidden="true" />
            <span className={`text-xs font-medium ${
              activeTab === id ? 'text-[#3B82F6]' : 'text-gray-600'
            }`}>
              {label}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
};