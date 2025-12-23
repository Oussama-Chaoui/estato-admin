'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  Popover,
  TextField,
  Typography,
  Divider,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import TitleIcon from '@mui/icons-material/Title';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TypographyExt from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';
import YouTube from '@tiptap/extension-youtube';
import Figure from '../tiptap/Figure';

type UploadResult = { url: string; id?: number; alt?: string };
type UploadFn = (file: File) => Promise<UploadResult>;

type RHFTextEditorProps = {
  name: string;
  placeholder?: string;
  minHeight?: number;
  onUploadInlineImage?: UploadFn;
};

const ToolbarButton = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) => (
  <IconButton
    size="small"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    sx={{ mx: 0.5, bgcolor: active ? 'action.selected' : 'transparent' }}
  >
    {children}
  </IconButton>
);

const LinkEditor = ({
  anchorEl,
  open,
  onClose,
  initialUrl,
  onSubmit,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  initialUrl: string;
  onSubmit: (url: string) => void;
}) => {
  const [url, setUrl] = useState(initialUrl);
  useEffect(() => setUrl(initialUrl), [initialUrl]);
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box p={1.5} sx={{ width: 320 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography variant="body2" sx={{ flex: 1 }}>
            Link
          </Typography>
          <Button onClick={() => onSubmit('')} size="small">
            Unlink
          </Button>
        </Stack>
        <TextField
          fullWidth
          size="small"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
          <Button onClick={onClose} size="small" variant="text">
            Cancel
          </Button>
          <Button onClick={() => onSubmit(url)} size="small" variant="contained">
            Apply
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

const RHFTextEditor = ({
  name,
  placeholder = 'Write your story…',
  minHeight = 300,
  onUploadInlineImage,
}: RHFTextEditorProps) => {
  const { control } = useFormContext();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null);
        const [savedAt, setSavedAt] = useState<string | null>(null);
        const savingRef = useRef<NodeJS.Timeout | null>(null);
        const characterCountExtension = useMemo(
          () => CharacterCount.configure({ limit: null }),
          []
        );

        const editor = useEditor(
          {
            editable: true,
            extensions: [
              StarterKit.configure({ codeBlock: false }),
              CodeBlockLowlight.configure({ lowlight }),
              Placeholder.configure({ placeholder }),
              TypographyExt,
              Underline,
              Highlight,
              characterCountExtension,
              Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                protocols: ['https', 'http', 'mailto', 'tel'],
              }),
              TextAlign.configure({ types: ['heading', 'paragraph'] }),
              YouTube.configure({ controls: true, nocookie: true }),
              Figure.configure({}),
            ],
            content: field.value || '<p></p>',
            onUpdate: ({ editor }) => {
              const html = editor.getHTML();
              field.onChange(html);
              if (savingRef.current) {
                clearTimeout(savingRef.current);
              }
              savingRef.current = setTimeout(() => setSavedAt('Saved just now'), 800);
              setSavedAt('Saving…');
            },
          },
          [mounted, name, characterCountExtension]
        );

        const insertImage = async (file: File) => {
          if (!onUploadInlineImage) {
            return;
          }
          const { url, alt } = await onUploadInlineImage(file);
          editor
            ?.chain()
            .focus()
            .setFigure({ src: url, alt: alt || '' })
            .run();
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const f = e.target.files?.[0];
          if (f) {
            insertImage(f);
          }
          e.currentTarget.value = '';
        };

        if (!mounted) {
          return (
            <FormControl fullWidth error={!!error}>
              <Box
                sx={{
                  height: minHeight,
                  border: (t) => `1px solid ${error ? t.palette.error.main : t.palette.grey[400]}`,
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.disabled',
                }}
              >
                Loading editor…
              </Box>
              {error && <FormHelperText>{error.message}</FormHelperText>}
            </FormControl>
          );
        }

        return (
          <FormControl fullWidth error={!!error}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  '& .ProseMirror': {
                    minHeight,
                    outline: 'none',
                    fontSize: 20,
                    lineHeight: 1.65,
                    letterSpacing: 0,
                  },
                  '& h1': { fontSize: 48, fontWeight: 700, lineHeight: 1.2, mb: 2 },
                  '& h2': { fontSize: 32, fontWeight: 700, lineHeight: 1.3, mt: 4, mb: 1.5 },
                  '& h3': { fontSize: 26, fontWeight: 700, lineHeight: 1.35, mt: 3, mb: 1 },
                  '& p': { mb: 3 },
                  '& pre': {
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (t) => t.palette.action.hover,
                    fontSize: 15,
                    overflowX: 'auto',
                  },
                  '& blockquote': {
                    borderLeft: (t) => `4px solid ${t.palette.divider}`,
                    pl: 2,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    my: 3,
                  },
                  '& figure': { my: 3, textAlign: 'center' },
                  '& figcaption': { fontSize: 14, color: 'text.secondary', mt: 1 },
                  '& hr': { border: 0, borderTop: (t) => `1px solid ${t.palette.divider}`, my: 4 },
                  border: (t) => `1px solid ${error ? t.palette.error.main : t.palette.grey[400]}`,
                  borderRadius: 1,
                  '&:focus-within': { borderColor: (t) => t.palette.primary.main, borderWidth: 2 },
                  p: { xs: 1.5, sm: 3 },
                  backgroundColor: 'background.paper',
                }}
              >
                {editor && (
                  <BubbleMenu
                    editor={editor}
                    tippyOptions={{ duration: 100 }}
                    shouldShow={({ editor }) => {
                      const { from, to } = editor.state.selection;
                      return from !== to; // show only if text is selected
                    }}
                  >
                    <Paper
                      elevation={2}
                      sx={{ px: 0.5, py: 0.25, display: 'flex', alignItems: 'center' }}
                    >
                      <ToolbarButton
                        active={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                      >
                        <FormatBoldIcon fontSize="small" />
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                      >
                        <FormatItalicIcon fontSize="small" />
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor.isActive('heading', { level: 2 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      >
                        <TitleIcon fontSize="small" />
                      </ToolbarButton>
                      <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
                      <ToolbarButton onClick={(e) => setLinkAnchor(e.currentTarget as HTMLElement)}>
                        <InsertLinkIcon fontSize="small" />
                      </ToolbarButton>
                      <ToolbarButton
                        active={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      >
                        <FormatQuoteIcon fontSize="small" />
                      </ToolbarButton>
                    </Paper>
                  </BubbleMenu>
                )}

                <EditorContent editor={editor} />

                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    {savedAt || ' '}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {editor?.storage.characterCount?.characters() || 0} chars
                  </Typography>
                </Stack>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
                <LinkEditor
                  anchorEl={linkAnchor}
                  open={Boolean(linkAnchor)}
                  onClose={() => setLinkAnchor(null)}
                  initialUrl={editor?.getAttributes('link')?.href || ''}
                  onSubmit={(url) => {
                    if (!url) {
                      editor?.chain().focus().unsetLink().run();
                    } else {
                      editor?.chain().focus().setLink({ href: url, target: '_blank' }).run();
                    }
                    setLinkAnchor(null);
                  }}
                />
              </Box>
            </Box>
            {error && <FormHelperText>{error.message}</FormHelperText>}
          </FormControl>
        );
      }}
    />
  );
};

export default RHFTextEditor;
