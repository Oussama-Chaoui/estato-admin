import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Button,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTranslatedText } from '@common/utils/translations';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import { NotificationType, Notification } from '@modules/notifications/defs/types';
import { useRouter } from 'next/router';
import useNotifications from '@modules/notifications/hooks/api/useNotifications';
import { useSnackbar } from 'notistack';

dayjs.extend(relativeTime);

const ReadAllNotifications: React.FC = () => {
  const { t, i18n } = useTranslation(['notifications', 'common']);
  const theme = useTheme();
  const router = useRouter();
  const getTranslatedText = useTranslatedText();
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(1);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);

  // Update dayjs locale when language changes
  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  // Fetch notifications with pagination
  const {
    notifications,
    isLoading,
    meta,
    markAsRead,
    markAllAsRead: markAllAsReadHook,
    deleteNotification: deleteNotificationHook,
  } = useNotifications({ page, perPage: 10 });

  // Reset to page 1 when component mounts/unmounts (when navigating to/from page)
  useEffect(() => {
    setPage(1);
    setAllNotifications([]);
  }, []);

  // Accumulate notifications as we load more pages
  useEffect(() => {
    if (!isLoading && notifications.length > 0) {
      if (page === 1) {
        // Page 1: replace all notifications (handles both initial load and cache updates from mutations)
        setAllNotifications(notifications);
      } else {
        // Page > 1: merge with existing, updating any that changed (due to mutations) and adding new ones
        setAllNotifications((prev) => {
          const notificationMap = new Map(prev.map((n) => [n.id, n]));

          // Update existing notifications or add new ones from current page
          notifications.forEach((n) => {
            notificationMap.set(n.id, n);
          });

          return Array.from(notificationMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    }
  }, [notifications, page, isLoading]);

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      // Update local state optimistically
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
      );

      await markAsRead(notification.id);
    }

    if (notification.data.actionUrl) {
      router.push(notification.data.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadHook();
      // Update local state
      setAllNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      enqueueSnackbar(t('notifications:mark_all_read_success'), { variant: 'success' });
    } catch (error) {
      console.error('Error marking all as read:', error);
      enqueueSnackbar(t('notifications:mark_all_read_error'), { variant: 'error' });
    }
  };

  const handleDelete = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    try {
      await deleteNotificationHook(id);
      setAllNotifications((prev) => prev.filter((n) => n.id !== id));
      enqueueSnackbar(t('notifications:delete_notification_success'), { variant: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      enqueueSnackbar(t('notifications:delete_notification_error'), { variant: 'error' });
    }
  };

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // Update local state optimistically
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );

    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: undefined } : n))
      );
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.AGENT_APPLICATION:
        return <PersonAddIcon />;
      case NotificationType.PROPERTY_STATUS_CHANGE:
        return <HomeIcon />;
      case NotificationType.NEW_PROPERTY_INQUIRY:
        return <VisibilityIcon />;
      case NotificationType.NEW_APPOINTMENT:
        return <AssignmentIcon />;
      case NotificationType.SYSTEM_ALERT:
        return <BusinessIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.AGENT_APPLICATION:
        return theme.palette.primary.main;
      case NotificationType.PROPERTY_STATUS_CHANGE:
        return theme.palette.success.main;
      case NotificationType.NEW_PROPERTY_INQUIRY:
        return theme.palette.warning.main;
      case NotificationType.NEW_APPOINTMENT:
        return theme.palette.info.main;
      case NotificationType.SYSTEM_ALERT:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[600];
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.AGENT_APPLICATION:
        return theme.palette.primary.lighter;
      case NotificationType.PROPERTY_STATUS_CHANGE:
        return theme.palette.success.lighter;
      case NotificationType.NEW_PROPERTY_INQUIRY:
        return theme.palette.warning.lighter;
      case NotificationType.NEW_APPOINTMENT:
        return theme.palette.info.lighter;
      case NotificationType.SYSTEM_ALERT:
        return theme.palette.error.lighter;
      default:
        return theme.palette.grey[50];
    }
  };

  const unreadCount = allNotifications.filter((n) => !n.readAt).length;
  const totalItems = meta?.totalItems || 0;
  const hasMore = meta ? meta.currentPage < meta.lastPage : false;

  const renderNotificationsContent = () => {
    if (isLoading && page === 1) {
      return (
        <Stack spacing={2}>
          {[...Array(5)].map((_, index) => (
            <Card key={index} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton
                        variant="rectangular"
                        width={40}
                        height={20}
                        sx={{ borderRadius: 1 }}
                      />
                    </Stack>
                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Skeleton variant="text" width="20%" height={16} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }

    if (allNotifications.length === 0) {
      return (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <NotificationsIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {t('notifications:no_notifications_title')}
          </Typography>
          <Typography color="text.secondary">
            {t('notifications:no_notifications_message')}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Stack spacing={2}>
          {allNotifications.map((notification) => (
            <Card
              key={notification.id}
              sx={{
                borderRadius: 2,
                border: notification.readAt
                  ? `1px solid ${theme.palette.divider}`
                  : `2px solid ${getNotificationColor(notification.type)}40`,
                background: notification.readAt
                  ? theme.palette.background.paper
                  : getNotificationBgColor(notification.type),
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: notification.data.actionUrl ? 'pointer' : 'default',
                '&:hover': notification.data.actionUrl
                  ? {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    }
                  : {},
              }}
              onClick={() => notification.data.actionUrl && handleNotificationClick(notification)}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `linear-gradient(135deg, ${getNotificationColor(
                        notification.type
                      )}30 0%, ${getNotificationColor(notification.type)}20 100%)`,
                      color: getNotificationColor(notification.type),
                      border: `2px solid ${getNotificationColor(notification.type)}40`,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {getTranslatedText(notification.data.title, 'Notification')}
                      </Typography>
                      {!notification.readAt && (
                        <Chip
                          label={t('notifications:new_badge')}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                            color: theme.palette.error.contrastText,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        mb: 1.5,
                        lineHeight: 1.6,
                      }}
                    >
                      {getTranslatedText(notification.data.message, 'No message')}
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {dayjs(notification.createdAt).fromNow()}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        {!notification.readAt && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            sx={{
                              color: theme.palette.text.disabled,
                              '&:hover': {
                                color: theme.palette.success.main,
                                background: theme.palette.success.lighter,
                              },
                            }}
                            title={t('notifications:mark_as_read')}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => handleDelete(notification.id, e)}
                          sx={{
                            color: theme.palette.text.disabled,
                            '&:hover': {
                              color: theme.palette.error.main,
                              background: theme.palette.error.lighter,
                            },
                          }}
                          title={t('notifications:delete')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Load More Button */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleLoadMore}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                px: 4,
                py: 1.5,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  background: theme.palette.primary.lighter,
                },
              }}
            >
              {isLoading ? t('notifications:loading') : t('notifications:load_more')}
            </Button>
          </Box>
        )}

        {/* Loading indicator for pagination */}
        {isLoading && page > 1 && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {[...Array(3)].map((_, index) => (
              <Card key={index} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="30%" height={16} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('notifications:total_notification', { count: totalItems })}
          {unreadCount > 0 && ` • ${unreadCount} ${t('notifications:unread')}`}
        </Typography>

        {unreadCount > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllAsRead}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {t('notifications:mark_all_read')}
          </Button>
        )}
      </Box>

      {/* Notifications List */}
      <Box>{renderNotificationsContent()}</Box>
    </Box>
  );
};

export default ReadAllNotifications;
