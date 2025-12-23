import { useFormContext, Controller } from 'react-hook-form';
import { TextField, TextFieldProps, IconButton, InputAdornment } from '@mui/material';
import { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

type Props = TextFieldProps & {
  name: string;
};

const RHFTextField = ({ name, helperText, type, ...other }: Props) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordField = type === 'password';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={typeof field.value === 'number' && field.value === 0 ? '' : field.value}
          error={!!error}
          helperText={error ? error?.message : helperText}
          type={isPasswordField && showPassword ? 'text' : type}
          InputProps={{
            endAdornment: isPasswordField ? (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  aria-label={showPassword ? 'hide password' : 'show password'}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ) : undefined,
            ...other.InputProps,
          }}
          {...other}
        />
      )}
    />
  );
};

export default RHFTextField;
