import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import axios from 'axios';

interface Alert {
  id: string;
  name: string;
  status: 'active' | 'resolved' | 'acknowledged';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  source: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/alerts`);
      
      if (response.data.alerts && response.data.alerts.length > 0) {
        setAlerts(response.data.alerts);
      } else {
        // Fallback to mock data if no real alerts
        setAlerts([
          {
            id: '1',
            name: 'High Valuation Alert: ByteDance',
            status: 'active',
            severity: 'high',
            message: 'ByteDance valuation exceeded $140B threshold',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: 'Valuation Monitor',
          },
          {
            id: '2',
            name: 'Market Saturation Warning',
            status: 'active',
            severity: 'medium',
            message: 'Fintech sector showing signs of saturation (85+ companies)',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            source: 'Market Analysis',
          },
          {
            id: '3',
            name: 'New Unicorn Detected',
            status: 'acknowledged',
            severity: 'low',
            message: 'Scale AI reached $1B valuation',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            source: 'Unicorn Tracker',
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      // Use mock data on error
      setAlerts([
        {
          id: '1',
          name: 'Demo Alert',
          status: 'active',
          severity: 'medium',
          message: 'Configure Kibana alerting rules to see real alerts here',
          timestamp: new Date().toISOString(),
          source: 'System',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'acknowledged':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Alerts & Rules</h1>
        <p className="text-gray-400">Monitor market conditions and rule triggers from Kibana</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#27272A] rounded-xl p-6 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Alerts</p>
              <p className="text-3xl font-bold text-white">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#27272A] rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Rules</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#27272A] rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Resolved Today</p>
              <p className="text-3xl font-bold text-white">8</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#27272A] rounded-xl p-8 text-center">
            <p className="text-gray-400">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-[#27272A] rounded-xl p-8 text-center">
            <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300">No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-[#27272A] rounded-xl p-6 border ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getStatusIcon(alert.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{alert.name}</h3>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{alert.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{alert.source}</span>
                      <span>•</span>
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.status === 'active' && (
                    <>
                      <button className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        Acknowledge
                      </button>
                      <button className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                        Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-400">
          💡 <strong>Tip:</strong> Alerts are automatically generated from Kibana rules monitoring
          your unicorn market data. Configure rules in Kibana Stack Management → Alerts and Actions.
        </p>
      </div>
    </div>
  );
}
