import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Heart, Frown, Meh, Smile, Laugh } from 'lucide-react';

interface MoodSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onMoodSelect: (mood: MoodData) => void;
}

export interface MoodData {
  mood: string;
  intensity: number;
  description: string;
  emoji: string;
}

export const MoodSurvey: React.FC<MoodSurveyProps> = ({
  isOpen,
  onClose,
  onMoodSelect
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(5);

  const moods = [
    { id: 'great', label: 'Great', icon: Laugh, color: 'text-green-600', emoji: '😄' },
    { id: 'good', label: 'Good', icon: Smile, color: 'text-blue-600', emoji: '😊' },
    { id: 'okay', label: 'Okay', icon: Meh, color: 'text-yellow-600', emoji: '😐' },
    { id: 'sad', label: 'Sad', icon: Frown, color: 'text-orange-600', emoji: '😢' },
    { id: 'anxious', label: 'Anxious', icon: Heart, color: 'text-red-600', emoji: '😰' }
  ];

  const handleSubmit = () => {
    if (!selectedMood) return;
    
    const mood = moods.find(m => m.id === selectedMood);
    if (mood) {
      const moodData: MoodData = {
        mood: selectedMood,
        intensity,
        description: mood.label,
        emoji: mood.emoji
      };
      onMoodSelect(moodData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">How are you feeling?</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-gray-600 text-sm">
              Select your current mood to help us provide better support:
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                      selectedMood === mood.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <IconComponent className={`w-5 h-5 ${mood.color}`} />
                    <span className="font-medium text-gray-800">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedMood && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensity (1-10):
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span className="font-medium">{intensity}</span>
                  <span>High</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedMood}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};