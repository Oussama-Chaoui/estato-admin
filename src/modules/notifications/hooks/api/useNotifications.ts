import { useState, useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import useApi, { ApiResponse } from '@common/hooks/useApi';
import useAuth from '@modules/auth/hooks/api/useAuth';
import ApiRoutes from '@modules/notifications/defs/api-routes';
import { Notification, NotificationData, UnreadCountData } from '@modules/notifications/defs/types';

export interface UseNotificationsOptions {
  page?: number;
  perPage?: number;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  meta: {
    currentPage: number;
    lastPage: number;
    totalItems: number;
  } | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  mutate: () => void;
  mutateNotifications: () => void;
  mutateUnreadCount: () => void;
}

const useNotifications = (options?: UseNotificationsOptions): UseNotificationsReturn => {
  const fetchApi = useApi();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page = 1, perPage = 15 } = options || {};
  const apiUrl = user ? `${ApiRoutes.ReadAll}?page=${page}&per_page=${perPage}` : null;

  // SWR for notifications - only fetch if user is authenticated
  const { data: notificationsData, mutate: mutateNotifications } = useSWR<NotificationData>(
    apiUrl,
    async (url: string): Promise<NotificationData> => {
      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<NotificationData> = await fetchApi(url, {
          method: 'GET',
          verbose: false,
        });

        if (!response.success) {
          throw new Error(response.errors?.[0] || 'Failed to fetch notifications');
        }

        return response.data!;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // SWR for unread count - only fetch if user is authenticated
  const { data: unreadCountData, mutate: mutateUnreadCount } = useSWR<UnreadCountData>(
    user ? ApiRoutes.UnreadCount : null,
    async (url: string): Promise<UnreadCountData> => {
      try {
        const response: ApiResponse<UnreadCountData> = await fetchApi(url, {
          method: 'GET',
          verbose: false,
        });

        if (!response.success) {
          throw new Error(response.errors?.[0] || 'Failed to fetch unread count');
        }

        return response.data!;
      } catch (err) {
        console.error('Error fetching unread count:', err);
        return { count: 0 };
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Mark notification as read with optimistic UI
  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update: immediately update the UI for ALL notification caches
      globalMutate(
        (key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll),
        (currentData: NotificationData | undefined) => {
          if (!currentData || !currentData.items || !Array.isArray(currentData.items)) {
            return currentData;
          }

          return {
            ...currentData,
            items: currentData.items.map((notification) =>
              notification.id === id
                ? { ...notification, readAt: new Date().toISOString() }
                : notification
            ),
          };
        },
        false
      );

      // Optimistic update for unread count
      mutateUnreadCount((currentData) => {
        if (!currentData) {
          return currentData;
        }
        return {
          ...currentData,
          count: Math.max(0, currentData.count - 1),
        };
      }, false);

      try {
        const response = await fetchApi(ApiRoutes.MarkAsRead.replace('{id}', id), {
          method: 'PATCH',
          verbose: false,
        });

        if (!response.success) {
          // Revert optimistic update on failure - revalidate all notification caches
          globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
          mutateUnreadCount();
        }
        // On success, we don't need to revalidate since optimistic update is already correct
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert optimistic update on error
        globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
        mutateUnreadCount();
      }
    },
    [fetchApi, mutateUnreadCount]
  );

  // Mark all notifications as read with optimistic UI
  const markAllAsRead = useCallback(async () => {
    // Optimistic update: immediately mark all notifications as read in ALL caches
    globalMutate(
      (key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll),
      (currentData: NotificationData | undefined) => {
        if (!currentData || !currentData.items || !Array.isArray(currentData.items)) {
          return currentData;
        }

        return {
          ...currentData,
          items: currentData.items.map((notification) => ({
            ...notification,
            readAt: notification.readAt || new Date().toISOString(),
          })),
        };
      },
      false
    );

    // Optimistic update for unread count (set to 0)
    mutateUnreadCount((currentData) => {
      if (!currentData) {
        return currentData;
      }
      return {
        ...currentData,
        count: 0,
      };
    }, false);

    try {
      const response = await fetchApi(ApiRoutes.MarkAllAsRead, {
        method: 'PATCH',
        verbose: false,
      });

      if (!response.success) {
        // Revert optimistic update on failure
        globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
        mutateUnreadCount();
      }
      // On success, we don't need to revalidate since optimistic update is already correct
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
      mutateUnreadCount();
    }
  }, [fetchApi, mutateUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        const response = await fetchApi(ApiRoutes.DeleteOne.replace('{id}', id), {
          method: 'DELETE',
          verbose: false,
        });

        if (response.success) {
          // Invalidate ALL notification caches globally
          globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
          mutateUnreadCount();
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    },
    [fetchApi, mutateUnreadCount]
  );

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetchApi(ApiRoutes.DeleteAll, {
        method: 'DELETE',
        verbose: false,
      });

      if (response.success) {
        // Invalidate ALL notification caches globally
        globalMutate((key) => typeof key === 'string' && key.startsWith(ApiRoutes.ReadAll));
        mutateUnreadCount();
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [fetchApi, mutateUnreadCount]);

  return {
    notifications: notificationsData?.items || [],
    unreadCount: unreadCountData?.count || 0,
    isLoading,
    error,
    meta: notificationsData?.meta || null,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    mutate: mutateNotifications,
    mutateNotifications,
    mutateUnreadCount,
  };
};

export default useNotifications;
