// PropertyStatus.tsx
import React from 'react';
import { Chip } from '@mui/material';
import { PROPERTY_STATUS } from '@modules/properties/defs/types';

interface PropertyStatusProps {
  status: PROPERTY_STATUS;
}

const statusStyles: Record<
  PROPERTY_STATUS,
  { bgColor: string; textColor: string; icon?: JSX.Element }
> = {
  [PROPERTY_STATUS.FOR_SALE]: {
    bgColor: 'success.light',
    textColor: 'grey.900',
  },
  [PROPERTY_STATUS.FOR_RENT]: {
    bgColor: 'warning.light',
    textColor: 'grey.900',
  },
  [PROPERTY_STATUS.SOLD]: {
    bgColor: 'info.light',
    textColor: 'grey.900',
  },
  [PROPERTY_STATUS.RENTED]: {
    bgColor: 'error.light',
    textColor: 'grey.900',
  },
};

const PropertyStatus: React.FC<PropertyStatusProps> = ({ status }) => {
  const { bgColor, textColor } = statusStyles[status];
  const label = status.replace('_', ' ');

  return (
    <Chip
      label={label}
      variant="filled"
      sx={{
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 700,
        fontSize: '0.8rem',
        px: 1.5,
        py: 1,
        minWidth: 90,
        borderRadius: '6px',
        textTransform: 'capitalize',
        letterSpacing: 0.2,
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
        },
        '& .MuiChip-label': {
          px: 0.5,
        },
      }}
    />
  );
};

export default PropertyStatus;
