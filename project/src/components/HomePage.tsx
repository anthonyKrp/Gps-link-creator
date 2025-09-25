import React, { useState } from 'react';
import { Link2, MapPin, Share2, BarChart3 } from 'lucide-react';

const HomePage = () => {
  const [newLink, setNewLink] = useState(null);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3001/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() || undefined }),
      });
      
      if (!response.ok) throw new Error('Failed to generate link');
      
      const data = await response.json();
      setNewLink(data);
      setTitle('');
    } catch (error) {
      console.error('Error generating link:', error);
      alert('Failed to generate link. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newLink.url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">GPS Auto Capture</h1>
          </div>
          <p className="text-xl text-gray-600">
            Generate shareable links that automatically capture visitors' GPS locations
          </p>
        </div>

        {/* Link Generator */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Link2 className="h-6 w-6 mr-2 text-blue-600" />
            Generate Tracking Link
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Link Title (Optional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Event Check-in, Survey Location..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <button
              onClick={generateLink}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                'Generate Link'
              )}
            </button>
          </div>
        </div>

        {/* Generated Link */}
        {newLink && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Link Generated Successfully!
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title: {newLink.title}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shareable URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLink.url}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> When someone clicks this link, their browser will automatically 
                  request location permission and capture their GPS coordinates. The location data will be 
                  stored and viewable in the admin dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Auto GPS Capture</h3>
            <p className="text-gray-600 text-sm">Automatically captures location when link is opened</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Share2 className="h-10 w-10 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-600 text-sm">Generate unique links that can be shared via any platform</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <BarChart3 className="h-10 w-10 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
            <p className="text-gray-600 text-sm">View collected locations in real-time admin dashboard</p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center">
          <a
            href="/admin"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            View Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;