import {
  List,
  ListItemText,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Box,
  Avatar,
  Divider,
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { useRouter } from 'next/router';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { useState, useEffect } from 'react';
import Routes from '@common/defs/routes';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import { AddRounded, ChevronRight, LogoutRounded, AccountCircle } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { CRUD_ACTION, NavGroup, NavItem } from '@common/defs/types';
import { getMenuItems } from '@common/defs/menu-items';
import NestedDrawer from '@common/components/lib/navigation/Drawers/NestedDrawer';
import {
  StyledLinkNavItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledSubheader,
} from '@common/components/lib/navigation/Drawers/styled-drawer-items';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';

interface LeftbarProps {
  open: boolean;
  onToggle: (open: boolean) => void;
}
export const LEFTBAR_WIDTH = 260;
const Leftbar = (props: LeftbarProps) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const { can } = usePermissions();
  const [navEntries, setNavEntries] = useState<NavGroup[]>([]);
  const [subNavItems, setSubNavItems] = useState<NavItem[]>();
  const { t } = useTranslation(['leftbar']);
  const open = props.open;
  const [hoveredItem, setHoveredItem] = useState<{ groupIndex: number; itemIndex: number } | null>(
    null
  );

  const handleOpenSubDrawer = (items: NavItem[]) => {
    setSubNavItems(items);
  };

  const handleCloseSubDrawer = () => {
    setSubNavItems([]);
  };

  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));
  const toggleLeftbar = () => {
    const newOpen = !open;
    props.onToggle(newOpen);
  };

  const filteredGroups = () => {
    const menuGroups = getMenuItems(t);
    const groups = menuGroups
      .map((menuGroup) => ({
        ...menuGroup,
        items: filteredMenuItems(menuGroup.items),
      }))
      .filter((group) => group.items.length > 0);
    return groups;
  };

  const filteredMenuItems = (menuItems: NavItem[]) => {
    const items = menuItems
      .map((menuItem) => {
        let item = { ...menuItem };
        if (menuItem.children && menuItem.children.length > 0) {
          item = { ...item, children: filteredMenuItems(menuItem.children) };
        }
        if (
          !menuItem.suffix &&
          menuItem.routes &&
          (!item.namespace || (item.namespace && can(item.namespace, CRUD_ACTION.CREATE)))
        ) {
          item = {
            ...item,
            suffix: {
              tooltip: t('leftbar:create'),
              icon: <AddRounded />,
              link: menuItem.routes.CreateOne,
            },
          };
        }

        return !item.namespace ||
          !item.permission ||
          (item.namespace && item.permission && can(item.namespace, item.permission))
          ? item
          : null;
      })
      .filter((menuItem) => menuItem !== null) as NavItem[];
    return items;
  };

  useEffect(() => {
    setNavEntries(filteredGroups());
  }, [user, t]);

  return (
    <>
      <Drawer
        onMouseLeave={() => handleCloseSubDrawer()}
        anchor="left"
        open={open}
        variant={isMobile ? 'temporary' : 'persistent'}
        PaperProps={{
          sx: {
            width: LEFTBAR_WIDTH,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRight: 'none',
            marginTop: 0.4,
            px: 0,
            overflow: 'hidden',
            boxShadow: '0 3px 16px rgba(0,0,0,0.15)',
          },
        }}
        sx={{
          display: open ? 'block' : 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.lighter,
              0.3
            )} 0%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.light,
              0.2
            )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <NestedDrawer
            open={subNavItems !== undefined && subNavItems.length > 0}
            leftBarWidth={LEFTBAR_WIDTH}
            navItems={subNavItems !== undefined && subNavItems.length > 0 ? subNavItems : []}
            isMobile={isMobile}
            router={router}
            level={1}
          />

          <Box sx={{ flex: 1, overflow: 'auto', mt: 12 }}>
            <List sx={{ px: 1.6 }}>
              {navEntries.map((entry, groupIndex) => (
                <Box key={groupIndex}>
                  {entry.text && (
                    <StyledSubheader
                      disableSticky
                      sx={{
                        color: alpha('#ffffff', 0.9),
                        fontWeight: 600,
                        fontSize: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        mb: 0.8,
                        mt: 1.6,
                        px: 0.8,
                      }}
                    >
                      {entry.text}
                    </StyledSubheader>
                  )}
                  {entry.items.map((item, itemIndex) => {
                    let link = item.link;
                    if (link.length > 1) {
                      link = item.link.endsWith('/') ? item.link.slice(0, -1) : item.link;
                    }
                    const isActive = router.pathname === link;
                    let iconToShow = item.icon;
                    if (isActive) {
                      iconToShow = item.icon;
                    } else if (
                      hoveredItem?.groupIndex === groupIndex &&
                      hoveredItem?.itemIndex === itemIndex &&
                      item.icon
                    ) {
                      iconToShow = item.icon;
                    }
                    return (
                      <StyledLinkNavItem
                        key={itemIndex}
                        passHref
                        href={link}
                        className={isActive ? 'active' : ''}
                        sx={{ display: 'flex', alignItems: 'center', mb: 0.4 }}
                      >
                        <StyledListItemButton
                          onMouseEnter={() => {
                            handleOpenSubDrawer(item.children || []);
                            setHoveredItem({ groupIndex, itemIndex });
                          }}
                          onMouseLeave={() => setHoveredItem(null)}
                          disableGutters
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1.6,
                            py: 1.2,
                            gap: 1.6,
                            borderRadius: 1.6,
                            transition: 'all 0.2s ease-in-out',
                            background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                            color: isActive ? '#ffffff' : alpha('#ffffff', 0.9),
                            border: isActive
                              ? `1px solid ${alpha('#ffffff', 0.3)}`
                              : '1px solid transparent',
                            '&:hover': {
                              background: isActive
                                ? 'rgba(255,255,255,0.2)'
                                : alpha('#ffffff', 0.1),
                              color: '#ffffff',
                              transform: 'translateX(3px)',
                              border: `1px solid ${alpha('#ffffff', 0.3)}`,
                            },
                            '.active &': {
                              background: 'rgba(255,255,255,0.15)',
                              color: '#ffffff',
                            },
                          }}
                        >
                          <StyledListItemIcon
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 0,
                              color: 'inherit',
                            }}
                          >
                            {iconToShow}
                          </StyledListItemIcon>
                          <ListItemText
                            primary={item.text}
                            sx={{
                              color: 'inherit',
                              '& .MuiTypography-root': {
                                fontWeight: isActive ? 600 : 500,
                                fontSize: '0.75rem',
                              },
                            }}
                          />
                          {item.suffix && (
                            <Tooltip title={item.suffix.tooltip}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (item.suffix) {
                                    router.push(item.suffix.link);
                                  }
                                }}
                                sx={{
                                  color: 'inherit',
                                  background: alpha('#ffffff', 0.1),
                                  '&:hover': {
                                    background: alpha('#ffffff', 0.2),
                                  },
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '0.875rem',
                                  },
                                }}
                              >
                                {item.suffix.icon}
                              </IconButton>
                            </Tooltip>
                          )}
                          {item.children && item.children.length > 0 && (
                            <ChevronRight
                              sx={{
                                color: 'inherit',
                                transition: 'transform 0.2s',
                                transform:
                                  hoveredItem?.groupIndex === groupIndex &&
                                  hoveredItem?.itemIndex === itemIndex
                                    ? 'translateX(2px)'
                                    : 'translateX(0)',
                              }}
                            />
                          )}
                        </StyledListItemButton>
                      </StyledLinkNavItem>
                    );
                  })}
                </Box>
              ))}
            </List>
          </Box>

          {user && (
            <Box sx={{ mt: 'auto', mb: 1.6, px: 1.6 }}>
              <Divider sx={{ mb: 2.4, borderColor: alpha('#ffffff', 0.2) }} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.6,
                    p: 1.6,
                    borderRadius: 1.6,
                    background: alpha('#ffffff', 0.1),
                    border: `1px solid ${alpha('#ffffff', 0.2)}`,
                    backdropFilter: 'blur(10px)',
                    mb: 1.6,
                  }}
                >
                  <Avatar
                    src={user.photo?.url}
                    sx={{
                      width: 32,
                      height: 32,
                      background: '#ffffff',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    }}
                  >
                    {!user.photo?.url && (user.name?.charAt(0) || 'U')}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.name || t('leftbar:user_default')}
                    </Box>
                    <Box
                      sx={{
                        fontSize: '0.5rem',
                        color: alpha('#ffffff', 0.8),
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </Box>
                  </Box>
                </Box>

                <Button
                  onClick={() => router.push(Routes.Users.Me)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    color: alpha('#ffffff', 0.9),
                    px: 1.6,
                    py: 1.2,
                    borderRadius: 1.6,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: alpha('#ffffff', 0.15),
                      color: '#ffffff',
                      transform: 'translateX(3px)',
                    },
                    letterSpacing: '0.4px',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    '.MuiButton-startIcon': {
                      justifyContent: 'center',
                    },
                  }}
                  startIcon={<AccountCircle />}
                  variant="text"
                >
                  {t('leftbar:my_profile')}
                </Button>

                <Button
                  onClick={() => {
                    router.push(Routes.Common.Home);
                    logout();
                  }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    color: alpha('#ffffff', 0.8),
                    px: 1.6,
                    py: 1.2,
                    borderRadius: 1.6,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      background: alpha('#ffffff', 0.15),
                      color: '#ffffff',
                      transform: 'translateX(3px)',
                    },
                    letterSpacing: '0.4px',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    '.MuiButton-startIcon': {
                      justifyContent: 'center',
                    },
                  }}
                  startIcon={<LogoutRounded />}
                  variant="text"
                >
                  {t('leftbar:logout')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
      {!open && (
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            top: 4.8,
            left: { xs: 4.8, sm: 11.2 },
          }}
        >
          <IconButton
            onClick={toggleLeftbar}
            sx={{
              display: open ? 'none' : 'block',
              height: 32,
              background: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <MenuIcon fontSize="medium" />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default Leftbar;
