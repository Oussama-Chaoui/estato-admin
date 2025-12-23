import React, { useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  NodeViewProps,
} from '@tiptap/react';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WidthNormalIcon from '@mui/icons-material/WidthFull';
import PanoramaHorizontalSelectIcon from '@mui/icons-material/PanoramaHorizontalSelect';

interface FigureAttributes {
  src: string;
  alt?: string;
  title?: string;
  variant?: 'normal' | 'wide' | 'full';
  caption?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (attrs: {
        src: string;
        alt?: string;
        title?: string;
        variant?: 'normal' | 'wide' | 'full';
      }) => ReturnType;
      setFigureVariant: (variant: 'normal' | 'wide' | 'full') => ReturnType;
      editFigureCaption: (caption: string) => ReturnType;
    };
  }
}

const FigureNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes } = props;
  const { src, alt, title, variant = 'normal', caption = '' } = node.attrs as FigureAttributes;
  const inputRef = useRef<HTMLInputElement | null>(null);

  let widthSx;
  if (variant === 'full') {
    widthSx = { width: '100vw', ml: 'calc(-50vw + 50%)' };
  } else if (variant === 'wide') {
    widthSx = { maxWidth: 900 };
  } else {
    widthSx = { maxWidth: '100%' };
  }

  return (
    <NodeViewWrapper
      as="figure"
      className="tiptap-figure"
      data-variant={variant}
      style={{ margin: '24px 0', textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ ...widthSx }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || ''}
            title={title || ''}
            style={{ width: '100%', height: 'auto', borderRadius: 4 }}
          />
        </Box>
      </Box>
      <figcaption>
        <TextField
          inputRef={inputRef}
          variant="standard"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Add a caption…"
          fullWidth
          sx={{ maxWidth: 680, mx: 'auto' }}
        />
      </figcaption>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={variant}
          onChange={(_, v) => v && updateAttributes({ variant: v })}
        >
          <ToggleButton value="normal">
            <WidthNormalIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="wide">
            <PanoramaHorizontalSelectIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="full">Full</ToggleButton>
        </ToggleButtonGroup>
        <IconButton size="small" onClick={() => inputRef.current?.focus()}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
      <NodeViewContent style={{ display: 'none' }} />
    </NodeViewWrapper>
  );
};

const Figure = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addOptions() {
    return {};
  },
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      variant: { default: 'normal' },
      caption: { default: '' },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (el: HTMLElement) => {
          const img = el.querySelector('img');
          const cap = el.querySelector('figcaption');
          if (!img) {
            return false;
          }
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            variant: el.getAttribute('data-variant') || 'normal',
            caption: cap?.textContent || '',
          };
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, variant, caption } = HTMLAttributes as FigureAttributes;
    return [
      'figure',
      { 'data-variant': variant },
      ['img', mergeAttributes({ src, alt, title })],
      ['figcaption', {}, caption || ''],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FigureNodeView);
  },
  addCommands() {
    return {
      setFigure:
        (attrs) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs }).run(),
      setFigureVariant:
        (variant) =>
        ({ editor }) => {
          const { from, to } = editor.state.selection;
          let updated = false;
          editor.state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === this.name) {
              editor.view.dispatch(
                editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, variant })
              );
              updated = true;
              return false;
            }
          });
          return updated;
        },
      editFigureCaption:
        (caption) =>
        ({ editor }) => {
          const { from, to } = editor.state.selection;
          let updated = false;
          editor.state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === this.name) {
              editor.view.dispatch(
                editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, caption })
              );
              updated = true;
              return false;
            }
          });
          return updated;
        },
    };
  },
});

export default Figure;
