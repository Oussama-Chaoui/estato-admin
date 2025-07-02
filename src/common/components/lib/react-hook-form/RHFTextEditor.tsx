import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Controller, useFormContext } from 'react-hook-form';
import { Box, FormControl, FormHelperText, useTheme } from '@mui/material';
import 'react-quill/dist/quill.snow.css';
import { Any } from '@common/defs/types';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface RHFTextEditorProps {
  name: string;
  placeholder?: string;
  theme?: 'snow' | 'bubble';
  minHeight?: number;
  modules?: Any;
  formats?: string[];
}

const defaultModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ script: 'sub' }, { script: 'super' }],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['link', 'formula'],
    ['clean'],
  ],
};

const defaultFormats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'script',
  'color',
  'background',
  'list',
  'bullet',
  'check',
  'indent',
  'direction',
  'align',
  'link',
  'formula',
];

const RHFTextEditor = ({
  name,
  placeholder = 'Write your content here…',
  theme = 'snow',
  minHeight = 300,
  modules,
  formats,
}: RHFTextEditorProps) => {
  const { control } = useFormContext();
  const muiTheme = useTheme();

  useEffect(() => {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const { Quill } = require('react-quill');
    const Link = Quill.import('formats/link') as Any;

    if (!Link.__patched) {
      const sanitize = Link.sanitize;

      Link.sanitize = (url: string) => {
        let value = sanitize.call(Link, url) || '';

        if (value && !/^(https?:|mailto:|tel:|\/\/)/i.test(value)) {
          value = 'https://' + value;
        }

        return value;
      };

      Link.__patched = true;
    }
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth error={!!error}>
          <Box
            sx={{
              '& .ql-toolbar.ql-snow, & .ql-container.ql-snow': {
                borderColor: error
                  ? `${muiTheme.palette.error.main} !important`
                  : (theme) => theme.palette.grey[400],
              },

              '&:focus-within .ql-toolbar.ql-snow, &:focus-within .ql-container.ql-snow': {
                borderColor: (theme) => theme.palette.primary.main,
                borderWidth: 2,
              },

              '& .ql-container': {
                minHeight,
              },
            }}
          >
            <ReactQuill
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              theme={theme}
              modules={modules || defaultModules}
              formats={formats || defaultFormats}
            />
          </Box>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
};

export default RHFTextEditor;
