import React, { forwardRef, useImperativeHandle, useEffect, useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  styled,
  Avatar,
  Alert,
  AlertTitle,
  useTheme,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Delete,
  Reorder,
  CloudUpload,
  WarningAmber,
  Check,
  ErrorOutline,
} from '@mui/icons-material';
import { FormStepProps, FormStepRef } from '@common/components/lib/navigation/FormStepper';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RHFTextField } from '@common/components/lib/react-hook-form';
import useUploads from '@modules/uploads/hooks/api/useUploads';
import { UPLOAD_STATUS } from '@modules/properties/defs/types';

const Dropzone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const ThumbnailContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    '& .actions': { opacity: 1 },
  },
}));

const DragOverlayContent = styled(Paper)(({ theme }) => ({
  transform: 'scale(1.02)',
  boxShadow: theme.shadows[6],
  border: `2px solid ${theme.palette.primary.main}`,
}));

const GridContainer = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginLeft: '-4px',
    marginRight: '-4px',
  },
}));

const GridItem = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const CaptionField = styled(RHFTextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));

const ActionsOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
});

const StatusIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  zIndex: 2,
  width: 24,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const DeletionOverlay = styled(Box)(() => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(211, 47, 47, 0.85)',
  backdropFilter: 'blur(2px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  borderRadius: 'inherit',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: 'fadeIn 0.3s ease-in-out',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'scale(0.95)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
}));

const DeletionContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
}));

interface ImageItem {
  uiId: string;
  uploadId?: number;
  file?: File;
  preview?: string;
  caption: string;
  ordering: number;
  status: UPLOAD_STATUS;
}

interface StepImagesData {
  images: ImageItem[];
}

const buildSchema = (t: (key: string) => string) =>
  yup.object({
    images: yup.array().of(
      yup.object({
        caption: yup.string().max(100, t('property:step_images.validation.caption_max')),
        ordering: yup.number().required(),
      })
    ),
  });

const SortableThumb = ({
  item,
  index,
  handleDelete,
  setFiles,
  t,
}: {
  item: ImageItem;
  index: number;
  handleDelete: (idx: number) => void;
  setFiles: React.Dispatch<React.SetStateAction<ImageItem[]>>;
  t: (key: string) => string;
}) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: item.uiId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 'auto',
  };

  const isDeleting = item.status === UPLOAD_STATUS.DELETING;

  let opacity = 1;
  if (isDragging) {
    opacity = 0.25;
  } else if (isDeleting) {
    opacity = 0.8;
  }

  let filter = 'none';
  if (isDragging) {
    filter = 'blur(2px)';
  } else if (isDeleting) {
    filter = 'grayscale(0.3)';
  }

  let pointerEvents: 'none' | 'auto' = 'auto';
  if (isDragging || isDeleting) {
    pointerEvents = 'none';
  }

  return (
    <Grid
      item
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        '&:hover': {
          zIndex: 2,
        },
      }}
    >
      <ThumbnailContainer
        elevation={isDragging ? 6 : 3}
        sx={{
          opacity,
          filter,
          pointerEvents,
          transform: isDeleting ? 'scale(0.98)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          {...listeners}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <Reorder sx={{ color: 'common.white' }} />
        </Box>

        <StatusIndicator>
          {item.status === UPLOAD_STATUS.UPLOADING && <CircularProgress size={16} />}
          {item.status === UPLOAD_STATUS.UPLOADED && <Check fontSize="small" color="success" />}
          {item.status === UPLOAD_STATUS.ERROR && (
            <Tooltip title={t('property:step_images.upload_failed')}>
              <ErrorOutline fontSize="small" color="error" />
            </Tooltip>
          )}
        </StatusIndicator>

        <Avatar variant="rounded" src={item.preview} sx={{ width: '100%', height: 200 }} />

        {item.status === UPLOAD_STATUS.DELETING && (
          <DeletionOverlay>
            <DeletionContent>
              <CircularProgress
                size={28}
                sx={{
                  color: 'common.white',
                }}
              />
              <Typography
                sx={{
                  color: 'common.white',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '0.75rem',
                }}
              >
                {t('property:step_images.deleting')}
              </Typography>
            </DeletionContent>
          </DeletionOverlay>
        )}

        <ActionsOverlay className="actions">
          <IconButton
            color="error"
            disabled={
              item.status === UPLOAD_STATUS.UPLOADING || item.status === UPLOAD_STATUS.DELETING
            }
            onClick={() => handleDelete(index)}
          >
            <Delete />
          </IconButton>
        </ActionsOverlay>
      </ThumbnailContainer>

      <CaptionField
        name={`images.${index}.caption`}
        label={t('property:step_images.caption')}
        fullWidth
        sx={{
          mt: 1,
          '& .MuiInputBase-input': {
            px: 1.5,
            fontSize: '0.875rem',
          },
        }}
        value={item.caption}
        disabled={item.status === UPLOAD_STATUS.UPLOADING || item.status === UPLOAD_STATUS.DELETING}
        onChange={(e) =>
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, caption: e.target.value } : f))
          )
        }
      />
    </Grid>
  );
};

const StepImages = forwardRef<FormStepRef, FormStepProps>(({ data, next }, ref) => {
  const { t } = useTranslation(['property']);
  const theme = useTheme();
  const { createOne: uploadImage, deleteOne } = useUploads();
  const [files, setFiles] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const methods = useForm<StepImagesData>({
    resolver: yupResolver(buildSchema(t)),
    defaultValues: { images: data?.images ?? [] },
  });

  useEffect(() => {
    if (data?.images && files.length === 0) {
      const sorted = [...data.images].sort((a, b) => a.ordering - b.ordering);
      setFiles(
        sorted.map((img) => ({
          uiId: `u-${img.imageId}`,
          uploadId: img.imageId,
          preview: img.preview,
          caption: img.caption,
          ordering: img.ordering,
          status: UPLOAD_STATUS.UPLOADED,
        }))
      );
    }
  }, [data?.images, files.length]);

  useEffect(() => {
    methods.setValue('images', files);
  }, [files, methods]);

  useEffect(
    () => () =>
      files.forEach((f) => f.preview?.startsWith('blob:') && URL.revokeObjectURL(f.preview)),
    [files]
  );

  const handleUpload = useCallback(
    async (file: File, index: number) => {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: UPLOAD_STATUS.UPLOADING } : f))
      );
      try {
        const res = await uploadImage({ file });
        if (!res.success) {
          throw new Error();
        }
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? {
                  ...f,
                  status: UPLOAD_STATUS.UPLOADED,
                  uploadId: res.data!.item.id,
                  preview: res.data!.item.url,
                  file: undefined,
                }
              : f
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((f, i) => (i === index ? { ...f, status: UPLOAD_STATUS.ERROR } : f))
        );
      }
    },
    [uploadImage]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (accepted) => {
      const newItems: ImageItem[] = accepted.map((file, idx) => {
        const blobUrl = URL.createObjectURL(file);
        const ordering = files.length + idx;
        handleUpload(file, ordering);
        return {
          uiId: blobUrl,
          file,
          preview: blobUrl,
          caption: '',
          ordering,
          status: UPLOAD_STATUS.UPLOADING,
        };
      });
      setFiles((prev) => [...prev, ...newItems]);
    },
  });

  const handleDelete = useCallback(
    async (idx: number) => {
      const toDelete = files[idx];

      setFiles((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, status: UPLOAD_STATUS.DELETING } : f))
      );

      try {
        if (toDelete.uploadId) {
          await deleteOne(toDelete.uploadId);
        }
        if (toDelete.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(toDelete.preview);
        }

        setFiles((prev) => prev.filter((_, i) => i !== idx).map((f, i) => ({ ...f, ordering: i })));
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, i) => (i === idx ? { ...f, status: UPLOAD_STATUS.UPLOADED } : f))
        );
        console.error('Failed to delete image:', error);
      }
    },
    [files, deleteOne]
  );

  useImperativeHandle(ref, () => ({
    submit: async () => {
      await methods.handleSubmit(() => {
        next({
          images: files
            .filter((f) => f.uploadId)
            .map((f) => ({
              imageId: f.uploadId!,
              caption: f.caption,
              ordering: f.ordering,
              preview: f.preview,
            })),
        });
      })();
    },
  }));

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <FormProvider {...methods}>
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.dark }}>
                {t('property:step_images.property_images')}
              </Typography>

              <Alert
                severity="warning"
                icon={<WarningAmber />}
                sx={{
                  mb: 4,
                  bgcolor: theme.palette.warning.lighter,
                  color: theme.palette.warning.dark,
                }}
              >
                <AlertTitle>{t('property:step_images.important_note')}</AlertTitle>
                {t('property:step_images.upload_warning')}
              </Alert>

              <Dropzone {...getRootProps()} elevation={0} sx={{ mb: 4 }}>
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 40, mb: 2, color: 'text.secondary' }} />
                <Typography>{t('property:step_images.drag_drop_text')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('property:step_images.recommended_size')}
                </Typography>
              </Dropzone>

              <DndContext
                sensors={sensors}
                onDragStart={(e) => setActiveId(e.active.id as string)}
                onDragEnd={({ active, over }) => {
                  setActiveId(null);
                  if (!over || active.id === over.id) {
                    return;
                  }
                  const oldIdx = files.findIndex((f) => f.uiId === active.id);
                  const newIdx = files.findIndex((f) => f.uiId === over.id);
                  setFiles((prev) => {
                    const moved = arrayMove(prev, oldIdx, newIdx);
                    return moved.map((file, idx) => ({
                      ...file,
                      ordering: idx,
                    }));
                  });
                }}
              >
                <SortableContext items={files.map((f) => f.uiId)} strategy={rectSortingStrategy}>
                  <GridContainer container>
                    {files.map((file, idx) => (
                      <GridItem item xs={12} sm={6} md={4} lg={3} key={file.uiId}>
                        <SortableThumb
                          item={file}
                          index={idx}
                          handleDelete={handleDelete}
                          setFiles={setFiles}
                          t={t}
                        />
                      </GridItem>
                    ))}
                  </GridContainer>
                </SortableContext>

                <DragOverlay dropAnimation={null}>
                  {activeId && (
                    <DragOverlayContent
                      elevation={6}
                      sx={{
                        width: 300,
                        height: 200,
                        backgroundColor: 'transparent',
                        backgroundImage: `url(${files.find((f) => f.uiId === activeId)?.preview})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}
                </DragOverlay>
              </DndContext>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
});

export default StepImages;
