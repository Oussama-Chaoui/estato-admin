import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Routes from '@common/defs/routes';
import {
  AppBar,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  styled,
  Box,
  Divider,
  useTheme,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import useAuth from '@modules/auth/hooks/api/useAuth';
import Logo from '@common/assets/svgs/Logo';
import { Language, Home as HomeIcon, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { setUserLanguage } from '@common/components/lib/utils/language';
import { alpha } from '@mui/material/styles';
import Image from 'next/image';
import NotificationDropdown from '@common/components/NotificationDropdown';

interface TopbarItem {
  label: string;
  link?: string;
  onClick?: () => void;
  dropdown?: Array<{
    label: string;
    link?: string;
    value?: string;
    onClick?: () => void;
  }>;
}

const languages = [
  { code: 'en', name: 'English', countryCode: 'us' },
  { code: 'fr', name: 'Français', countryCode: 'fr' },
  { code: 'es', name: 'Español', countryCode: 'es' },
];

const Topbar = () => {
  const { t, i18n } = useTranslation(['topbar']);
  const router = useRouter();
  const { asPath } = router;
  const [showDrawer, setShowDrawer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();

  const currentLocale = i18n.language || 'en';
  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSidebar = () => {
    setShowDrawer((oldValue) => !oldValue);
  };

  const navItems: TopbarItem[] = [
    {
      label: t('topbar:home'),
      link: Routes.Common.Home,
      onClick: () => router.push(Routes.Common.Home),
    },
    {
      label: t('topbar:language'),
      dropdown: [
        {
          label: t('topbar:language_french'),
          link: asPath,
          value: 'fr',
        },
        {
          label: t('topbar:language_english'),
          link: `${asPath}`,
          value: 'en',
        },
        {
          label: t('topbar:language_spanish'),
          link: `${asPath}`,
          value: 'es',
        },
      ],
    },
  ];

  const toggleDropdown = () => {
    setShowDropdown((oldValue) => !oldValue);
  };

  const onNavButtonClick = (item: TopbarItem) => {
    if (item.dropdown) {
      return toggleDropdown;
    }
    return () => {
      setShowDrawer(false);
      if (item.onClick) {
        item.onClick();
      }
    };
  };

  const onAuthButtonClick = (mode: string) => {
    if (router.pathname === Routes.Common.Home) {
      if (mode === 'login') {
        return router.push(Routes.Auth.Login);
      }
    }
    if (mode === 'login') {
      router.push({
        pathname: Routes.Auth.Login,
        query: { url: encodeURIComponent(router.pathname) },
      });
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: isScrolled
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease-in-out',
        zIndex: 1200,
      }}
    >
      <Toolbar
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 1,
          minHeight: isScrolled ? '64px' : '72px',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Logo isFullLogo />
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <StyledNavButton
            onClick={() => router.push(Routes.Common.Home)}
            sx={{
              ...(router.pathname === Routes.Common.Home && {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white !important',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`,
                  color: 'white !important',
                },
              }),
            }}
          >
            <HomeIcon sx={{ fontSize: 18, mr: 1 }} />
            {t('topbar:home')}
          </StyledNavButton>

          <StyledDropdownButton
            onClick={toggleDropdown}
            sx={{
              '&:hover': {
                '.dropdown-menu': {
                  visibility: 'visible',
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
            }}
          >
            <Image
              src={`https://flagcdn.com/w20/${currentLanguage.countryCode}.png`}
              alt={`${currentLanguage.name} flag`}
              width={20}
              height={15}
              style={{ borderRadius: '2px', marginRight: '8px' }}
            />
            <span style={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {currentLanguage.code.toUpperCase()}
            </span>
            <KeyboardArrowDown sx={{ ml: 1, transition: 'transform 0.2s' }} />

            <Box
              className="dropdown-menu"
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                mt: 1,
                width: 160,
                background: 'white',
                borderRadius: 2,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.08)',
                visibility: 'hidden',
                opacity: 0,
                transform: 'translateY(-10px)',
                transition: 'all 0.2s ease-in-out',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              {languages.map((language) => (
                <Link key={language.code} href={asPath} locale={language.code}>
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      },
                      ...(currentLocale === language.code && {
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }),
                    }}
                    onClick={() => {
                      setUserLanguage(language.code);
                    }}
                  >
                    <Image
                      src={`https://flagcdn.com/w20/${language.countryCode}.png`}
                      alt={`${language.name} flag`}
                      width={20}
                      height={15}
                      style={{ borderRadius: '2px' }}
                    />
                    <span style={{ flex: 1, fontWeight: 500 }}>{language.name}</span>
                    {currentLocale === language.code && (
                      <Check sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    )}
                  </Box>
                </Link>
              ))}
            </Box>
          </StyledDropdownButton>

          {user && <NotificationDropdown />}
        </Box>

        {!user && (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, ml: 3 }}>
            <StyledNavButton
              onClick={() => onAuthButtonClick('login')}
              sx={{
                ...(router.pathname === Routes.Auth.Login && {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  color: 'white !important',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`,
                    color: 'white !important',
                  },
                }),
              }}
            >
              {t('topbar:login')}
            </StyledNavButton>
          </Box>
        )}

        <IconButton
          onClick={toggleSidebar}
          sx={{
            display: { md: 'none' },
            background: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Logo isFullLogo />
        </Box>

        <List sx={{ p: 2 }}>
          {navItems.map((item, index) => {
            if (item.label === 'Utilisateur') {
              return null;
            }

            return (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={!item.dropdown ? onNavButtonClick(item) : toggleDropdown}
                  sx={{
                    borderRadius: 2,
                    background:
                      router.pathname === item.link
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        : 'transparent',
                    color: router.pathname === item.link ? 'white !important' : 'text.primary',
                    '&:hover': {
                      background:
                        router.pathname === item.link
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`
                          : alpha(theme.palette.primary.main, 0.1),
                      color: router.pathname === item.link ? 'white !important' : 'text.primary',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: 40,
                    }}
                  >
                    {item.label === t('topbar:home') ? <HomeIcon /> : <Language />}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.dropdown && (
                    <KeyboardArrowDown
                      sx={{
                        color: 'inherit',
                        transition: 'transform 0.2s',
                        transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  )}
                </ListItemButton>

                {item.dropdown && (
                  <List
                    sx={{
                      width: '100%',
                      transition: 'all 0.2s',
                      height: showDropdown ? 'auto' : 0,
                      overflow: 'hidden',
                      ml: 2,
                    }}
                  >
                    {item.dropdown && item.label === t('topbar:language')
                      ? languages.map((language, languageIndex) => (
                          <ListItem key={languageIndex} disablePadding sx={{ mb: 0.5 }}>
                            <Link href={asPath} locale={language.code}>
                              <ListItemButton
                                onClick={() => {
                                  setUserLanguage(language.code);
                                  setShowDrawer(false);
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.1),
                                  },
                                  ...(currentLocale === language.code && {
                                    background: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                  }),
                                }}
                              >
                                <Image
                                  src={`https://flagcdn.com/w20/${language.countryCode}.png`}
                                  alt={`${language.name} flag`}
                                  width={20}
                                  height={15}
                                  style={{ borderRadius: '2px' }}
                                />
                                <ListItemText
                                  primary={language.name}
                                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                                />
                                {currentLocale === language.code && (
                                  <Check sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                                )}
                              </ListItemButton>
                            </Link>
                          </ListItem>
                        ))
                      : item.dropdown?.map((dropdownItem, dropdownItemIndex) => (
                          <ListItem key={dropdownItemIndex} disablePadding sx={{ mb: 0.5 }}>
                            <Link href={dropdownItem.link!} locale={dropdownItem.value}>
                              <ListItemButton
                                onClick={() => {
                                  onNavButtonClick(dropdownItem);
                                  setUserLanguage(dropdownItem.value!);
                                }}
                                sx={{
                                  borderRadius: 1.5,
                                  '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={dropdownItem.label}
                                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                                />
                              </ListItemButton>
                            </Link>
                          </ListItem>
                        ))}
                  </List>
                )}
              </ListItem>
            );
          })}

          {!user && (
            <>
              <Divider sx={{ my: 2 }} />
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => {
                    setShowDrawer(false);
                    router.push(Routes.Auth.Login);
                  }}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ListItemText primary={t('topbar:login')} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

const StyledNavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderRadius: '12px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.75rem',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-1px)',
  },
}));

const StyledDropdownButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderRadius: '12px',
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.75rem',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-1px)',
  },
}));

export default Topbar;
