import Image from 'next/image';
import { Box, Typography } from '@mui/material';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

interface LogoProps {
  isFullLogo?: boolean;
  onClick?: () => void;
  id?: string;
}

const Logo = ({ isFullLogo = false, onClick, id }: LogoProps) => {
  if (!isFullLogo) {
    return (
      <Box id={id} sx={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
        <Image src="/logo.png" width={50} height={33} alt="logo" />
      </Box>
    );
  }

  return (
    <Box
      id={id}
      sx={{
        display: 'flex',
        gap: 1.5,
        alignItems: 'center', // Changed from flex-end to center
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: { xs: 35, md: 45 },
          height: { xs: 28, md: 45 },
          position: 'relative',
          flexShrink: 0, // Prevent logo from shrinking
        }}
      >
        <Image src="/logo.png" alt="logo" fill style={{ objectFit: 'contain' }} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center', // Changed from flex-end to center
          gap: 0.25, // Add small gap between text elements
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.25rem', md: '27px' },
            fontWeight: 'bold',
            fontFamily: montserrat.style.fontFamily,
            lineHeight: 1,
            mb: 0,
            color: 'text.primary',
          }}
        >
          YAKOUT
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.625rem', md: '0.75rem' },
            fontWeight: 500,
            fontFamily: montserrat.style.fontFamily,
            lineHeight: 1,
            color: 'text.secondary',
            letterSpacing: '0.26rem',
            textTransform: 'uppercase',
          }}
        >
          IMMOBILIER
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo;
