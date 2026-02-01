import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { MoodData } from '../components/MoodSurvey';
import { moodAPI } from '../services/api';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  ArrowLeft, 
  Send, 
  Bot,
  User,
  Heart,
  Stethoscope,
  Calendar
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotScreenProps {
  onBack: () => void;
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({
  onBack
}) => {
  const { user } = useFirebaseAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getInitialMessage(),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [userMood, setUserMood] = useState<MoodData | null>(null);

  React.useEffect(() => {
    const loadUserMood = async () => {
      if (user?.uid) {
        try {
          const moodData = await moodAPI.getMood(user.uid);
          setUserMood(moodData.mood);
          
          // Update the initial message with empathic greeting if mood is loaded
          if (moodData.mood) {
            setMessages(prev => prev.map((msg, index) => 
              index === 0 ? { ...msg, text: getEmpathicGreeting(moodData.mood) } : msg
            ));
          }
        } catch (error) {
          console.error('Failed to load user mood:', error);
        }
      }
    };

    loadUserMood();
  }, [user]);

  function getInitialMessage(): string {
    return 'Hello! I\'m your AI health assistant. How can I help you today?';
  }

  function getEmpathicGreeting(mood: MoodData): string {
    switch (mood.mood) {
      case 'great':
        return `Hello! ${mood.emoji} I can see you're feeling great today! That's wonderful. How can I help you maintain this positive energy?`;
      case 'good':
        return `Hi there! ${mood.emoji} I'm glad you're feeling good today. What can I do to support your health and wellness?`;
      case 'okay':
        return `Hello! ${mood.emoji} I notice you're feeling okay today. Is there anything specific I can help you with to brighten your day?`;
      case 'sad':
        return `Hi there. ${mood.emoji} I understand you're feeling sad right now. I'm here to listen and support you. How can I help?`;
      case 'anxious':
        return `Hello. ${mood.emoji} I can see you're feeling anxious today. Take a deep breath - I'm here to help you through this. What's on your mind?`;
      default:
        return 'Hello! I\'m your AI health assistant. How can I help you today?';
    }
  }

  const quickActions = [
    { text: 'Book an appointment', icon: Calendar },
    { text: 'Check symptoms', icon: Stethoscope },
    { text: 'Health tips', icon: Heart }
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText, userMood),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string, mood: MoodData | null): string => {
    const input = userInput.toLowerCase();
    
    // Empathic responses based on mood
    if (mood) {
      if (mood.mood === 'sad' && (input.includes('sad') || input.includes('down') || input.includes('depressed'))) {
        return `I understand you're going through a difficult time ${mood.emoji}. It's completely normal to feel this way sometimes. Have you considered speaking with a mental health professional? I can help you find resources or book an appointment.`;
      }
      if (mood.mood === 'anxious' && (input.includes('anxious') || input.includes('worried') || input.includes('stress'))) {
        return `I hear that you're feeling anxious ${mood.emoji}. Here are some quick techniques that might help: try deep breathing (4 counts in, 4 counts out), or the 5-4-3-2-1 grounding technique. Would you like me to guide you through a breathing exercise?`;
      }
    }
    
    if (input.includes('appointment') || input.includes('book')) {
      return 'I can help you book an appointment! Please go to the Services section and select "Book Appointment" to schedule with a doctor.';
    } else if (input.includes('symptom') || input.includes('pain') || input.includes('sick')) {
      const empathicPrefix = mood?.mood === 'sad' ? 'I\'m sorry you\'re not feeling well. ' : 
                            mood?.mood === 'anxious' ? 'I understand this might be worrying for you. ' : '';
      return `${empathicPrefix}While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis and treatment. Would you like me to help you book an appointment?`;
    } else if (input.includes('hello') || input.includes('hi')) {
      const greeting = mood ? `Hello! ${mood.emoji} ` : 'Hello! ';
      return `${greeting}I'm here to help with your health-related questions. What would you like to know?`;
    } else if (input.includes('emergency')) {
      return 'If this is a medical emergency, please call 911 immediately or go to the nearest emergency room.';
    } else if (input.includes('thank')) {
      return mood?.mood === 'great' ? 'You\'re very welcome! Keep up that positive energy! 😊' :
             mood?.mood === 'sad' ? 'You\'re welcome. Remember, I\'m here whenever you need support. 💙' :
             'You\'re welcome! I\'m always here to help with your health questions.';
    } else {
      const supportiveEnding = mood?.mood === 'sad' ? ' Remember, seeking help is a sign of strength.' :
                              mood?.mood === 'anxious' ? ' Take things one step at a time.' : '';
      return `Thank you for your question. For specific medical advice, I recommend consulting with one of our healthcare professionals through the appointment booking system.${supportiveEnding}`;
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center space-x-4 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800 font-['Inter']">
              AI Health Assistant
            </h1>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-32">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className={`p-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.text)}
                  className="flex items-center space-x-2 rounded-full border-gray-300"
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{action.text}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-300"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 p-0"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};