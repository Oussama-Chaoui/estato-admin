import React from 'react';
import {
  Box,
  CardMedia,
  IconButton,
  Typography,
  useTheme,
  Paper,
  styled,
  keyframes,
  Modal,
  useMediaQuery,
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ImageNotSupported,
  Circle,
  Close,
} from '@mui/icons-material';
import { PropertyImage } from '@modules/properties/defs/types';

const fadeIn = keyframes`
  from { opacity: 0.6; }
  to { opacity: 1; }
`;

const GradientOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.3))',
  zIndex: 1,
  pointerEvents: 'none',
});

interface PropertyDisplayProps {
  images: PropertyImage[];
}

const PropertyDisplay: React.FC<PropertyDisplayProps> = ({ images }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalActiveStep, setModalActiveStep] = React.useState(0);

  const sorted = React.useMemo(() => [...images].sort((a, b) => a.ordering - b.ordering), [images]);
  const maxSteps = sorted.length;
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const handleModalOpen = () => {
    setModalActiveStep(activeStep);
    setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false);

  const handleModalNext = () => setModalActiveStep((prev) => Math.min(prev + 1, maxSteps - 1));
  const handleModalBack = () => setModalActiveStep((prev) => Math.max(prev - 1, 0));

  if (maxSteps === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: { xs: 300, md: 500 },
          borderRadius: 4,
          backgroundColor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${theme.palette.background.paper} 30%, ${theme.palette.grey[100]} 90%)`,
            opacity: 0.8,
          },
        }}
      >
        <ImageNotSupported
          fontSize="large"
          sx={{
            fontSize: 64,
            zIndex: 1,
            mb: 2,
            opacity: 0.8,
          }}
        />
        <Typography variant="h6" sx={{ mt: 1, zIndex: 1, fontWeight: 500 }}>
          No Images Available
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, zIndex: 1 }}>
          Property photos will appear here
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 3,
          transition: 'transform 0.3s ease',
          bgcolor: 'grey.100',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 300, md: 500 },
            maxHeight: { md: 600 },
            overflow: 'hidden',
            cursor: 'zoom-in',
            '&:hover .main-image': {
              // Add hover effect class
              transform: 'scale(1.02)',
              transition: 'transform 0.3s ease',
            },
          }}
          onClick={handleModalOpen} // Move click handler to the container
        >
          <GradientOverlay />

          {/* Navigation Arrows */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleBack();
            }}
            disabled={activeStep === 0}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              },
              transition: 'all 0.3s ease',
              width: 48,
              height: 48,
            }}
          >
            <KeyboardArrowLeft fontSize="large" />
          </IconButton>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={activeStep === maxSteps - 1}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              },
              transition: 'all 0.3s ease',
              width: 48,
              height: 48,
            }}
          >
            <KeyboardArrowRight fontSize="large" />
          </IconButton>

          {/* Main Image */}
          <CardMedia
            component="img"
            image={sorted[activeStep].upload.url}
            alt={sorted[activeStep].caption ?? `Property image ${activeStep + 1}`}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '100%',
              objectFit: 'contain',
              animation: `${fadeIn} 0.6s ease`,
              py: 2,
              position: 'relative',
              zIndex: 0,
              transition: 'transform 0.3s ease',
              className: 'main-image', // Add class for hover effect
            }}
          />

          {/* Image Counter */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'common.white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              backdropFilter: 'blur(4px)',
            }}
          >
            <Typography variant="subtitle2" fontWeight={500}>
              {activeStep + 1} / {maxSteps}
            </Typography>
          </Box>

          {/* Caption */}
          {sorted[activeStep].caption && (
            <Typography
              variant="body2"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 2,
                color: 'common.white',
                maxWidth: '60%',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
                bgcolor: 'rgba(0,0,0,0.3)',
                px: 2,
                py: 1,
                borderRadius: 2,
              }}
            >
              {sorted[activeStep].caption}
            </Typography>
          )}
        </Box>

        {/* Custom Dots Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            gap: 1,
          }}
        >
          {sorted.map((_, index) => (
            <Circle
              key={index}
              sx={{
                fontSize: 10,
                color: activeStep === index ? 'primary.main' : 'common.white',
                opacity: activeStep === index ? 1 : 0.8,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.3)',
                },
              }}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </Box>
      </Box>
      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            bgcolor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={handleModalClose}
            sx={{
              position: 'absolute',
              top: 24,
              right: 24,
              color: 'common.white',
              zIndex: 3,
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <Close />
          </IconButton>

          {/* Modal Carousel Content */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Navigation Arrows */}
            <IconButton
              onClick={handleModalBack}
              disabled={modalActiveStep === 0}
              sx={{
                position: 'absolute',
                left: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: 'common.white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
                width: isMobile ? 40 : 64,
                height: isMobile ? 40 : 64,
              }}
            >
              <KeyboardArrowLeft fontSize={isMobile ? 'large' : 'large'} />
            </IconButton>

            <IconButton
              onClick={handleModalNext}
              disabled={modalActiveStep === maxSteps - 1}
              sx={{
                position: 'absolute',
                right: 24,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                color: 'common.white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                },
                width: isMobile ? 40 : 64,
                height: isMobile ? 40 : 64,
              }}
            >
              <KeyboardArrowRight fontSize={isMobile ? 'large' : 'large'} />
            </IconButton>

            {/* Modal Image */}
            <CardMedia
              component="img"
              image={sorted[modalActiveStep].upload.url}
              alt={sorted[modalActiveStep].caption ?? `Property image ${modalActiveStep + 1}`}
              sx={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 2,
                cursor: 'zoom-out',
              }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Modal Image Counter */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                zIndex: 2,
                color: 'common.white',
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.5)',
              }}
            >
              <Typography variant="h6" fontWeight={500}>
                {modalActiveStep + 1} / {maxSteps}
              </Typography>
            </Box>

            {/* Modal Caption */}
            {sorted[modalActiveStep].caption && (
              <Typography
                variant="body1"
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  left: 24,
                  zIndex: 2,
                  color: 'common.white',
                  maxWidth: '60%',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                {sorted[modalActiveStep].caption}
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default PropertyDisplay;
