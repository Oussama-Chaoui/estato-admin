import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  Typography,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Visibility as ViewAllIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTranslatedText } from '@common/utils/translations';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import useNotifications from '@modules/notifications/hooks/api/useNotifications';
import usePusher from '@common/hooks/usePusher';
import useAuth from '@modules/auth/hooks/api/useAuth';
import useTabBadge from '@common/hooks/useTabBadge';
import { Any } from '@common/defs/types';
import { NotificationType, Notification } from '@modules/notifications/defs/types';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';
import Routes from '@common/defs/routes';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

const NotificationDropdown: React.FC = () => {
  const { t, i18n } = useTranslation(['topbar']);
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const getTranslatedText = useTranslatedText();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Update dayjs locale when language changes
  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  // Only initialize notifications if user is authenticated
  const notificationsHook = useNotifications();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    mutate,
    mutateNotifications,
    mutateUnreadCount,
  } = user
    ? notificationsHook
    : {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        markAsRead: async () => {},
        markAllAsRead: async () => {},
        mutate: () => {},
        mutateNotifications: () => {},
        mutateUnreadCount: () => {},
      };

  // Browser tab badge effect
  useTabBadge(unreadCount);

  const open = Boolean(anchorEl);

  const pusherOptions = useMemo(() => {
    if (!user) {
      return undefined;
    }

    return {
      onNotification: (notification: Any) => {
        console.log('🔔 Pusher notification received:', notification);

        mutateNotifications();
        mutateUnreadCount();
      },
      onConnectionStateChange: (state: Any) => {
        console.log('🔔 Pusher connection state changed:', state);
      },
    };
  }, [user, mutate]);

  usePusher(pusherOptions);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }

    if (notification.data.actionUrl) {
      window.location.href = notification.data.actionUrl;
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleViewAll = () => {
    handleClose();
    router.push(Routes.Notifications.ReadAll);
  };

  return (
    <>
      <Tooltip title={t('topbar:notifications')}>
        <IconButton
          onClick={handleClick}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
            color: 'primary.main',
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 2,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main}20 100%)`,
              border: `1px solid ${theme.palette.primary.main}40`,
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                fontWeight: 600,
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 550,
            mt: 1,
            borderRadius: 3,
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            p: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  fontSize: '1rem',
                }}
              >
                {t('topbar:notifications')}
              </Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {t('topbar:unread_notification', { count: unreadCount })}
                </Typography>
              )}
            </Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllAsRead}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  background: theme.palette.primary.lighter,
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  '&:hover': {
                    background: theme.palette.primary.light,
                  },
                }}
              >
                {t('topbar:mark_all_read')}
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {isLoading && (
            <Box sx={{ p: 2 }}>
              {[...Array(2)].map((_, index) => (
                <Card key={index} sx={{ m: 1, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Skeleton variant="circular" width={36} height={36} />
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Skeleton variant="text" width="60%" height={20} />
                          <Skeleton
                            variant="rectangular"
                            width={30}
                            height={18}
                            sx={{ borderRadius: 1 }}
                          />
                        </Stack>
                        <Skeleton variant="text" width="90%" height={16} sx={{ mb: 1 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Skeleton variant="text" width="30%" height={14} />
                          <Skeleton variant="circular" width={24} height={24} />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {!isLoading && notifications.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.lighter} 0%, ${theme.palette.primary.light} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <NotificationsIcon sx={{ fontSize: 40, color: theme.palette.text.secondary }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}
              >
                {t('topbar:no_notifications_title')}
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                {t('topbar:no_notifications_message')}
              </Typography>
            </Box>
          )}

          {!isLoading && notifications.length > 0 && (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      p: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      },
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <Card
                      sx={{
                        width: '100%',
                        m: 1,
                        borderRadius: 2,
                        border: notification.readAt
                          ? `1px solid ${theme.palette.divider}`
                          : `1px solid ${getNotificationColor(notification.type)}30`,
                        background: notification.readAt
                          ? theme.palette.background.paper
                          : getNotificationBgColor(notification.type),
                        boxShadow: notification.readAt ? theme.shadows[2] : theme.shadows[4],
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: theme.shadows[6],
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              background: `linear-gradient(135deg, ${getNotificationColor(
                                notification.type
                              )}20 0%, ${getNotificationColor(notification.type)}10 100%)`,
                              color: getNotificationColor(notification.type),
                              border: `2px solid ${getNotificationColor(notification.type)}30`,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.text.primary,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {getTranslatedText(notification.data.title, 'Notification')}
                              </Typography>
                              {!notification.readAt && (
                                <Chip
                                  label={t('topbar:new_badge')}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
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
                                mb: 1,
                                lineHeight: 1.4,
                                fontSize: '0.8rem',
                              }}
                            >
                              {getTranslatedText(notification.data.message, 'No message')}
                            </Typography>

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  fontWeight: 500,
                                  fontSize: '0.7rem',
                                }}
                              >
                                {dayjs(notification.createdAt).fromNow()}
                              </Typography>
                              {!notification.readAt && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMarkAsRead(notification.id, e)}
                                  sx={{
                                    color: theme.palette.text.disabled,
                                    width: 24,
                                    height: 24,
                                    '&:hover': {
                                      color: theme.palette.primary.main,
                                      background: theme.palette.success.lighter,
                                    },
                                  }}
                                  title={t('topbar:mark_as_read')}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer with View All button */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ViewAllIcon />}
            onClick={handleViewAll}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              py: 1.25,
              px: 2,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                background: theme.palette.primary.lighter,
              },
            }}
          >
            {t('topbar:view_all_notifications')}
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationDropdown;
