import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export const NewsSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock health news data (in production, use real news API)
  const mockHealthNews: NewsArticle[] = [
    {
      title: "New Breakthrough in Heart Disease Treatment",
      description: "Researchers discover innovative therapy that reduces heart attack risk by 40%",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { name: "Health News Today" }
    },
    {
      title: "Mental Health Awareness Week",
      description: "Join millions in promoting mental wellness and breaking stigma around mental health",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { name: "Wellness Weekly" }
    },
    {
      title: "COVID-19 Vaccination Updates",
      description: "Latest guidelines for booster shots and new variant protection measures",
      url: "#",
      urlToImage: "https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop",
      publishedAt: new Date().toISOString(),
      source: { name: "Medical Journal" }
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchNews = async () => {
      setLoading(true);
      try {
        // In production, replace with actual news API call
        // const response = await fetch(`https://newsapi.org/v2/everything?q=health&apiKey=${API_KEY}`);
        // const data = await response.json();
        // setNews(data.articles.slice(0, 5));
        
        setTimeout(() => {
          setNews(mockHealthNews);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews(mockHealthNews);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    if (news.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % news.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [news.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % news.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl mb-6">
        <CardContent className="p-0">
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse">
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (news.length === 0) return null;

  const currentArticle = news[currentSlide];

  return (
    <div className="relative mb-6">
      <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
        <CardContent className="p-0 relative">
          <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
            <img
              src={currentArticle.urlToImage}
              alt={currentArticle.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/90 to-blue-600/90" />
            
            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {currentArticle.source.name}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(currentArticle.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 line-clamp-2">
                  {currentArticle.title}
                </h3>
                <p className="text-sm opacity-90 line-clamp-2">
                  {currentArticle.description}
                </p>
              </div>
              
              <button
                onClick={() => window.open(currentArticle.url, '_blank')}
                className="self-start bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
              >
                <span>Read More</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {news.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};