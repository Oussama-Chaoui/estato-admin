import {
  List,
  ListItemText,
  Stack,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { useState, useEffect } from 'react';
import Routes from '@common/defs/routes';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import {
  AddRounded,
  ArrowForwardIos,
  ChevronRight,
  LogoutRounded,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { CRUD_ACTION, NavGroup, NavItem } from '@common/defs/types';
import { menuItems as menuGroups } from '@common/defs/menu-items';
import NestedDrawer from '@common/components/lib/navigation/Drawers/NestedDrawer';
import {
  StyledLinkNavItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledSubheader,
} from '@common/components/lib/navigation/Drawers/styled-drawer-items';
import { useTranslation } from 'react-i18next';
import { alpha } from '@mui/material/styles';
import Image from 'next/image';
import Logo from '@common/assets/svgs/Logo';

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
              tooltip: 'Créer',
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
  }, [user]);
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
            bgcolor: 'background.paper',
            borderRightStyle: 'dashed',
            marginTop: 0.5,
            px: 3,
            overflow: 'hidden',
          },
        }}
        sx={{
          display: open ? 'block' : 'none',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: -268,
            left: '-2%',
            transform: 'translateX(-50%)',
            width: 611,
            height: 500,
            borderRadius: '50%',
            border: `78px solid #F0F2F8`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <NestedDrawer
            open={subNavItems !== undefined && subNavItems.length > 0}
            leftBarWidth={LEFTBAR_WIDTH}
            navItems={subNavItems !== undefined && subNavItems.length > 0 ? subNavItems : []}
            isMobile={isMobile}
            router={router}
            level={1}
          />
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="flex-end"
            sx={{
              py: 3,
              marginBottom: 2,
              borderBottomWidth: 1,
              borderBottomColor: 'grey.300',
            }}
          >
            <Logo isFullLogo onClick={() => router.push(Routes.Common.Home)} />
          </Stack>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {navEntries.map((entry, groupIndex) => (
                <Box key={groupIndex}>
                  {entry.text && <StyledSubheader disableSticky>{entry.text}</StyledSubheader>}
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
                        sx={{ display: 'flex', alignItems: 'center' }}
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
                            px: 2,
                            gap: 2,
                            '&:hover': {
                              background: `linear-gradient(0deg, ${alpha(
                                theme.palette.primary.main,
                                0.8
                              )}, ${alpha(theme.palette.primary.dark, 0.7)})`,
                              color: '#fff',
                            },
                            '&:hover .MuiListItemText-root': {
                              color: '#fff',
                            },
                            '.active &': {
                              background: `linear-gradient(0deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              color: '#fff',
                            },
                          }}
                        >
                          <StyledListItemIcon
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 0,
                            }}
                          >
                            {iconToShow}
                          </StyledListItemIcon>
                          <ListItemText
                            primary={item.text}
                            sx={{ color: isActive ? '#fff' : 'grey.500' }}
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
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.25rem',
                                  },
                                }}
                              >
                                {item.suffix.icon}
                              </IconButton>
                            </Tooltip>
                          )}
                          {item.children && item.children.length > 0 && <ChevronRight />}
                        </StyledListItemButton>
                      </StyledLinkNavItem>
                    );
                  })}
                </Box>
              ))}
            </List>
          </Box>

          {user && (
            <Box sx={{ mt: 'auto', mb: 2 }}>
              <Box
                sx={{
                  mx: 'auto',
                  mb: 4,
                  mt: 5,
                  pb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  position: 'relative',
                  maxWidth: '150px',
                }}
              >
                <Button
                  onClick={() => router.push(Routes.Users.Me)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    color: 'grey.500',
                    px: 2,
                    '&:hover': {
                      color: 'black',
                    },
                    letterSpacing: '0.5px',
                    fontWeight: 500,
                    '.MuiButton-startIcon': {
                      justifyContent: 'center',
                    },
                  }}
                  startIcon={<SettingsIcon />}
                  variant="text"
                >
                  {t('leftbar:settings')}
                </Button>
                <Button
                  onClick={() => {
                    router.push(Routes.Common.Home);
                    logout();
                  }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    color: 'grey.500',
                    px: 2,
                    '&:hover': {
                      color: 'black',
                    },
                    letterSpacing: '0.5px',
                    fontWeight: 500,
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
            top: 6,
            left: { xs: 6, sm: 14 },
          }}
        >
          <IconButton
            onClick={toggleLeftbar}
            sx={{
              display: open ? 'none' : 'block',
              height: 40,
            }}
          >
            <MenuIcon fontSize="medium" sx={{ color: 'grey.700' }} />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default Leftbar;
