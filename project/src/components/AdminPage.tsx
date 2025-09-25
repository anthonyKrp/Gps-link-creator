import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, Clock, Users, ExternalLink, RefreshCw } from 'lucide-react';

const AdminPage = () => {
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    if (selectedLink) {
      loadLocations(selectedLink.id);
    }
  }, [selectedLink]);

  const loadLinks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/links');
      const data = await response.json();
      setLinks(data);
      if (data.length > 0 && !selectedLink) {
        setSelectedLink(data[0]);
      }
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (linkId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/links/${linkId}/locations`);
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadLinks();
    if (selectedLink) {
      await loadLocations(selectedLink.id);
    }
    setRefreshing(false);
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Monitor GPS tracking links and collected locations</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={refresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <a
                href="/"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create New Link
              </a>
            </div>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tracking Links Yet</h2>
            <p className="text-gray-600 mb-6">Create your first GPS tracking link to start collecting location data.</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Link
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Links Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tracking Links</h2>
                
                <div className="space-y-3">
                  {links.map((link) => (
                    <div
                      key={link.id}
                      onClick={() => setSelectedLink(link)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedLink?.id === link.id
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Created: {new Date(link.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">
                          {locations.filter(loc => loc.link_id === link.id).length} captures
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/track/${link.id}`);
                            alert('Link copied!');
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedLink && (
                <div className="space-y-6">
                  {/* Link Details */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedLink.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-500" />
                        <span className="text-lg font-semibold text-blue-600">
                          {locations.length} locations captured
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Shareable URL:</p>
                      <div className="flex gap-2">
                        <code className="flex-1 text-sm bg-white p-2 rounded border font-mono">
                          {`${window.location.origin}/track/${selectedLink.id}`}
                        </code>
                        <button
                          onClick={() => window.open(`/track/${selectedLink.id}`, '_blank')}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Locations Table */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      Captured Locations
                    </h3>

                    {locations.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No locations captured yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Share the link above to start collecting GPS data
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Coordinates</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {locations.map((location) => (
                              <tr key={location.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {new Date(location.timestamp).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {new Date(location.timestamp).toLocaleTimeString()}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-mono text-sm">
                                    <div>Lat: {location.latitude.toFixed(6)}</div>
                                    <div>Lng: {location.longitude.toFixed(6)}</div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => openGoogleMaps(location.latitude, location.longitude)}
                                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View on Map
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;