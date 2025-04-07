import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const APP_TITLE = process.env.NEXT_PUBLIC_TITLE || "ESTATO";

interface LogoProps {
  isFullLogo?: boolean;
  onClick?: () => void;
}

const Logo = ({ isFullLogo = false, onClick }: LogoProps) => {
  if (!isFullLogo) {
    return (
      <Box sx={{ cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
        <Image src="/logo.png" width={50} height={33} alt="logo" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "flex-end", // Align items to the bottom
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: { xs: 35, md: 50 },
          height: { xs: 28, md: 33 },
          position: "relative",
        }}
      >
        <Image
          src="/logo.png"
          alt="logo"
          fill
          style={{ objectFit: "contain" }}
        />
      </Box>
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "1.25rem", md: "28px" },
          fontWeight: "bold",
          fontFamily: montserrat.style.fontFamily,
          lineHeight: 1, // Add this to match font size
          mb: 0, // Remove default margin-bottom
          display: 'flex', // Ensure proper alignment
          alignItems: 'flex-end', // Align text to bottom
        }}
      >
        {APP_TITLE}
      </Typography>
    </Box>
  );
};

export default Logo;
