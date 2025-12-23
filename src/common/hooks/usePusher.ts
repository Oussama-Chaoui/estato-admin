import { useEffect, useRef, useState } from 'react';
import Pusher, { Channel } from 'pusher-js';
import ApiRoutes from '@common/defs/api-routes';

interface NotificationData {
  [key: string]: unknown;
}

interface ConnectionStates {
  previous: string;
  current: string;
}

interface UsePusherOptions {
  onNotification?: (notification: NotificationData) => void;
  onConnectionStateChange?: (state: string) => void;
}

const usePusher = (options?: UsePusherOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    // Don't initialize Pusher if no options provided (user not authenticated)
    if (!options) {
      return;
    }

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}${ApiRoutes.Broadcasting.Auth}`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      },
    });

    pusherRef.current = pusher;

    // Connection state change handler
    pusher.connection.bind('state_change', (states: ConnectionStates) => {
      const newState = states.current;
      setConnectionState(newState);
      setIsConnected(newState === 'connected');

      if (options?.onConnectionStateChange) {
        options.onConnectionStateChange(newState);
      }
    });

    // Subscribe to admin notifications channel
    const channel = pusher.subscribe('private-admin-notifications');
    channelRef.current = channel;

    // Listen for notification events (Laravel notifications broadcast with class name as event)
    channel.bind('AgentApplicationNotification', (data: NotificationData) => {
      if (options?.onNotification) {
        options.onNotification(data);
      }
    });

    channel.bind('PropertyStatusChangeNotification', (data: NotificationData) => {
      if (options?.onNotification) {
        options.onNotification(data);
      }
    });

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe('private-admin-notifications');
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [options]);

  const disconnect = () => {
    if (pusherRef.current) {
      pusherRef.current.disconnect();
    }
  };

  const reconnect = () => {
    if (pusherRef.current) {
      pusherRef.current.connect();
    }
  };

  return {
    isConnected,
    connectionState,
    disconnect,
    reconnect,
  };
};

export default usePusher;
