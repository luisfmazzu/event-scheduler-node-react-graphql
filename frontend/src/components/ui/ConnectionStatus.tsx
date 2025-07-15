/**
 * Connection Status Component
 * 
 * Shows the real-time WebSocket connection status with indicators and controls
 */

import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { 
  useConnectionStatus, 
  forceReconnect, 
  getConnectionStats,
  ConnectionStatus as Status 
} from '@/lib/subscriptionClient';

interface ConnectionStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function ConnectionStatus({ showDetails = false, compact = false, className = '' }: ConnectionStatusProps) {
  const { status, isConnected, isConnecting, isReconnecting, hasError, reconnect, stats } = useConnectionStatus();
  const [showStats, setShowStats] = useState(false);

  const getStatusConfig = (status: Status) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Connected',
          description: 'Real-time updates active'
        };
      case 'connecting':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Connecting',
          description: 'Establishing connection...'
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Reconnecting',
          description: 'Attempting to reconnect...'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Disconnected',
          description: 'Real-time updates unavailable'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Error',
          description: 'Connection failed'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 
          (isConnecting || isReconnecting) ? 'bg-yellow-500 animate-pulse' : 
          'bg-red-500'
        }`} />
        <span className="text-xs text-gray-600">
          {isConnected ? 'Live' : config.label}
        </span>
        {hasError && (
          <Button
            variant="outline"
            size="sm"
            onClick={reconnect}
            className="h-6 px-2 text-xs"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon 
            className={`w-5 h-5 ${config.color} ${
              (isConnecting || isReconnecting) ? 'animate-spin' : ''
            }`} 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${config.color}`}>
                {config.label}
              </span>
              {isReconnecting && (
                <span className="text-xs text-gray-500">
                  (Attempt {stats.reconnectAttempts + 1})
                </span>
              )}
            </div>
            {showDetails && (
              <p className="text-sm text-gray-600 mt-1">
                {config.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="text-xs"
            >
              {showStats ? 'Hide' : 'Stats'}
            </Button>
          )}
          
          {(hasError || status === 'disconnected') && (
            <Button
              variant="outline"
              size="sm"
              onClick={reconnect}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reconnect
            </Button>
          )}
        </div>
      </div>

      {showStats && showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-600">{status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Reconnect Attempts:</span>
              <span className="ml-2 text-gray-600">{stats.reconnectAttempts}/{stats.maxReconnectAttempts}</span>
            </div>
            {stats.lastHeartbeat > 0 && (
              <>
                <div>
                  <span className="font-medium text-gray-700">Last Heartbeat:</span>
                  <span className="ml-2 text-gray-600">
                    {Math.round(stats.timeSinceLastHeartbeat / 1000)}s ago
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Connection Health:</span>
                  <span className={`ml-2 ${
                    stats.timeSinceLastHeartbeat < 30000 ? 'text-green-600' : 
                    stats.timeSinceLastHeartbeat < 60000 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {stats.timeSinceLastHeartbeat < 30000 ? 'Good' : 
                     stats.timeSinceLastHeartbeat < 60000 ? 'Fair' : 'Poor'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Toast-style connection status notification
export function ConnectionStatusToast() {
  const { status, isConnected } = useConnectionStatus();
  const [isVisible, setIsVisible] = React.useState(false);
  const [lastStatus, setLastStatus] = React.useState<Status>(status);

  React.useEffect(() => {
    // Show toast when status changes to error or disconnected
    if (status !== lastStatus) {
      if (status === 'error' || status === 'disconnected') {
        setIsVisible(true);
        // Auto-hide after 5 seconds
        setTimeout(() => setIsVisible(false), 5000);
      } else if (status === 'connected' && (lastStatus === 'error' || lastStatus === 'disconnected')) {
        // Show reconnection success briefly
        setIsVisible(true);
        setTimeout(() => setIsVisible(false), 3000);
      }
      setLastStatus(status);
    }
  }, [status, lastStatus]);

  if (!isVisible) return null;

  const config = {
    connected: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Connection restored! Real-time updates are active.'
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Connection error. Real-time updates may not work.'
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      message: 'Disconnected. Real-time updates are not available.'
    }
  }[status] || config.error;

  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Connection Status
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {config.message}
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {status === 'error' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={forceReconnect}
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Try Reconnecting
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 