import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const TrackingPage = () => {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // loading, requesting, success, error
  const [message, setMessage] = useState('');
  const [linkInfo, setLinkInfo] = useState(null);
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    // Verify link exists first
    verifyLink();
  }, [id]);

  const verifyLink = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/links/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setStatus('error');
          setMessage('Link not found or expired');
          setErrorDetail('The tracking link you clicked is invalid or has been removed.');
          return;
        }
        throw new Error('Failed to verify link');
      }
      
      const linkData = await response.json();
      setLinkInfo(linkData);
      
      // Start GPS capture process
      setTimeout(() => {
        captureLocation();
      }, 1000);
      
    } catch (error) {
      console.error('Error verifying link:', error);
      setStatus('error');
      setMessage('Unable to verify tracking link');
      setErrorDetail('There was a problem connecting to the server. Please try again later.');
    }
  };

  const captureLocation = () => {
    setStatus('requesting');
    setMessage('Requesting your location...');

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('Geolocation not supported');
      setErrorDetail('Your browser does not support location services.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch('http://localhost:3001/api/locations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              linkId: id,
              latitude,
              longitude,
            }),
          });

          if (!response.ok) throw new Error('Failed to store location');

          setStatus('success');
          setMessage('Location captured successfully!');
        } catch (error) {
          console.error('Error storing location:', error);
          setStatus('error');
          setMessage('Failed to store location');
          setErrorDetail('Your location was detected but could not be saved. Please try again.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setStatus('error');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage('Location access denied');
            setErrorDetail('You denied the request for location access. Please refresh and allow location access to continue.');
            break;
          case error.POSITION_UNAVAILABLE:
            setMessage('Location unavailable');
            setErrorDetail('Your location could not be determined. Please check your device settings and try again.');
            break;
          case error.TIMEOUT:
            setMessage('Location request timeout');
            setErrorDetail('The location request timed out. Please refresh and try again.');
            break;
          default:
            setMessage('Location error occurred');
            setErrorDetail('An unknown error occurred while trying to get your location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
      case 'requesting':
        return <Clock className="h-12 w-12 text-blue-600 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-600" />;
      default:
        return <MapPin className="h-12 w-12 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className={`bg-white rounded-2xl shadow-xl p-8 border-2 ${getStatusColor()}`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            
            {linkInfo && (
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {linkInfo.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Created: {new Date(linkInfo.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {message}
            </h2>

            {status === 'loading' && (
              <p className="text-gray-600">
                Verifying tracking link...
              </p>
            )}

            {status === 'requesting' && (
              <div className="space-y-3">
                <p className="text-gray-600">
                  Please allow location access when prompted by your browser.
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-green-700 font-medium">
                  Thank you! Your location has been recorded.
                </p>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    You can now close this page. Your location data has been securely stored.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-red-700 font-medium">
                  {errorDetail}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {status !== 'error' && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                This page automatically captures your GPS location for tracking purposes. 
                Your privacy is protected and location data is only stored temporarily.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;