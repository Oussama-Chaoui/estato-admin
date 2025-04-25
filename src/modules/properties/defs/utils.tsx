import * as MuiIcons from '@mui/icons-material';
import React from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export const getAmenityIcon = (iconName: string, props?: SvgIconProps): JSX.Element | null => {
  const formattedName = iconName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const IconComponent: React.ElementType = (MuiIcons as Record<string, React.ElementType>)[
    formattedName
  ];

  return IconComponent ? <IconComponent {...props} /> : null;
};
