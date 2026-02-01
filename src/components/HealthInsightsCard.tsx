import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent } from './ui/card';
import { CheckCircle, Circle, Droplets, Footprints, Moon, Apple } from 'lucide-react';

interface HealthTask {
  id: string;
  icon: React.ReactNode;
  task: string;
  completed: boolean;
  target: string;
}

export const HealthInsightsCard: React.FC = () => {
  const { t, settings } = useApp();
  const [tasks, setTasks] = useState<HealthTask[]>([
    {
      id: 'water',
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      task: 'Drink Water',
      completed: true,
      target: '6/8 glasses'
    },
    {
      id: 'walk',
      icon: <Footprints className="w-5 h-5 text-green-500" />,
      task: 'Daily Walk',
      completed: false,
      target: '3,200/10,000 steps'
    },
    {
      id: 'sleep',
      icon: <Moon className="w-5 h-5 text-purple-500" />,
      task: 'Sleep Schedule',
      completed: true,
      target: '8 hours'
    },
    {
      id: 'diet',
      icon: <Apple className="w-5 h-5 text-red-500" />,
      task: 'Healthy Diet',
      completed: false,
      target: '2/5 servings'
    }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const completionPercentage = (completedCount / tasks.length) * 100;

  return (
    <Card className={`border-0 shadow-sm hover:shadow-md transition-shadow rounded-2xl ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'} font-['Inter']`}>
            {t('dashboard.health_insights')}
          </h3>
          <div className={`text-sm ${settings.darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
            {completedCount}/{tasks.length} completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className={`flex items-center justify-between text-sm ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
            <span>Daily Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <div className={`w-full ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Health Tasks */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center space-x-3 p-2 rounded-lg ${settings.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
              onClick={() => toggleTask(task.id)}
            >
              <div className="flex-shrink-0">
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              
              <div className="flex-shrink-0">
                {task.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    task.completed 
                      ? (settings.darkMode ? 'text-gray-400 line-through' : 'text-gray-500 line-through')
                      : (settings.darkMode ? 'text-white' : 'text-gray-800')
                  }`}>
                    {task.task}
                  </span>
                  <span className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {task.target}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Personalized Tip */}
        <div className={`mt-4 p-3 ${settings.darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg`}>
          <p className={`text-sm ${settings.darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            💡 <strong>Tip:</strong> Try to complete your daily walk before 6 PM for better sleep quality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};