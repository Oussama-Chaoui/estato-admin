import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useForm, FormProvider, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFImageDropzone from '@common/components/lib/react-hook-form/RHFImageDropzone';
import RHFAutocomplete, {
  SelectOption,
} from '@common/components/lib/react-hook-form/RHFAutocomplete';
import RHFTextEditor from '@common/components/lib/react-hook-form/RHFTextEditor';
import usePosts, { CreateOneInput, UpdateOneInput } from '@modules/posts/hooks/api/usePosts';
import useCategories from '@modules/categories/hooks/api/useCategories';
import useTags from '@modules/tags/hooks/api/useTags';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { Upload } from '@modules/uploads/defs/types';
import { Category } from '@modules/categories/defs/types';
import { Tag } from '@modules/tags/defs/types';
import { useRouter } from 'next/router';
import Routes from '@common/defs/routes';
import { POST_STATUS } from '@modules/posts/defs/types';
import { useTranslatedText } from '@common/utils/translations';
import { TFunction } from 'i18next';

interface PostFormValues {
  title: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  slug: string;
  excerpt: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  content: {
    en?: string;
    fr: string;
    es?: string;
    ar: string;
  };
  metaTitle: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  metaDescription: {
    en?: string;
    fr?: string;
    es?: string;
    ar?: string;
  };
  image: Upload | null;
  categories: Category[];
  tags: Tag[];
}

interface UpsertPostFormWithPreviewProps {
  postId?: number;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createSchema = (t: TFunction) =>
  yup.object({
    title: yup.object({
      en: yup.string().nullable().max(255, t('post:validation.title_max_length')),
      fr: yup
        .string()
        .required(t('post:validation.french_title_required'))
        .max(255, t('post:validation.title_max_length')),
      es: yup.string().nullable().max(255, t('post:validation.title_max_length')),
      ar: yup
        .string()
        .required(t('post:validation.arabic_title_required'))
        .max(255, t('post:validation.title_max_length')),
    }),
    slug: yup
      .string()
      .max(255, t('post:validation.slug_max_length'))
      .required(t('post:validation.slug_required')),
    excerpt: yup.object({
      en: yup.string().nullable(),
      fr: yup.string().nullable(),
      es: yup.string().nullable(),
      ar: yup.string().nullable(),
    }),
    content: yup
      .object({
        en: yup.string().nullable(),
        fr: yup.string().required(t('post:validation.french_content_required')),
        es: yup.string().nullable(),
        ar: yup.string().required(t('post:validation.arabic_content_required')),
      })
      .test('content-not-empty', t('post:validation.content_required'), (value) => {
        if (!value) {
          return false;
        }
        const hasContent = Object.values(value || {}).some(
          (content) =>
            content && content.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s+/g, '').length > 0
        );
        return hasContent;
      }),
    metaTitle: yup.object({
      en: yup.string().nullable().max(255, t('post:validation.meta_title_max_length')),
      fr: yup.string().nullable().max(255, t('post:validation.meta_title_max_length')),
      es: yup.string().nullable().max(255, t('post:validation.meta_title_max_length')),
      ar: yup.string().nullable().max(255, t('post:validation.meta_title_max_length')),
    }),
    metaDescription: yup.object({
      en: yup.string().nullable().max(500, t('post:validation.meta_description_max_length')),
      fr: yup.string().nullable().max(500, t('post:validation.meta_description_max_length')),
      es: yup.string().nullable().max(500, t('post:validation.meta_description_max_length')),
      ar: yup.string().nullable().max(500, t('post:validation.meta_description_max_length')),
    }),
    image: yup.mixed<Upload>().nullable().required(t('post:validation.featured_image_required')),
    categories: yup
      .array()
      .of(
        yup.object({
          id: yup.number().required(),
          name: yup
            .object({
              en: yup.string().nullable(),
              fr: yup.string().required(),
              es: yup.string().nullable(),
              ar: yup.string().required(),
            })
            .required(),
          slug: yup.string().required(),
          description: yup
            .object({
              en: yup.string().nullable(),
              fr: yup.string().nullable(),
              es: yup.string().nullable(),
              ar: yup.string().nullable(),
            })
            .nullable(),
        })
      )
      .min(1, t('post:validation.select_category')),
    tags: yup
      .array()
      .of(
        yup.object({
          id: yup.number().required(),
          name: yup
            .object({
              en: yup.string().nullable(),
              fr: yup.string().required(),
              es: yup.string().nullable(),
              ar: yup.string().required(),
            })
            .required(),
          slug: yup.string().required(),
        })
      )
      .min(1, t('post:validation.select_tag')),
  });

const UpsertPostFormWithPreview = ({ postId }: UpsertPostFormWithPreviewProps) => {
  const { t } = useTranslation(['post']);
  const getTranslatedText = useTranslatedText();
  const { user } = useAuth();
  const router = useRouter();
  const methods = useForm<PostFormValues>({
    resolver: yupResolver(createSchema(t)),
    defaultValues: {
      title: { en: '', fr: '', es: '', ar: '' },
      slug: '',
      excerpt: { en: '', fr: '', es: '', ar: '' },
      content: { en: '', fr: '', es: '', ar: '' },
      metaTitle: { en: '', fr: '', es: '', ar: '' },
      metaDescription: { en: '', fr: '', es: '', ar: '' },
      image: null,
      categories: [],
      tags: [],
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
    setValue,
    watch,
  } = methods;

  const { readOne, createOne, updateOne } = usePosts();
  const [loading, setLoading] = useState(Boolean(postId));
  const [userEditedSlug, setUserEditedSlug] = useState(false);
  const [userEditedMetaTitle, setUserEditedMetaTitle] = useState(false);

  const title = watch('title');

  const handleTitleBlur = () => {
    if (title && title.fr && title.fr.trim()) {
      const generatedSlug = generateSlug(title.fr);
      const currentMetaTitle = title.fr.trim();

      if (!userEditedSlug) {
        setValue('slug', generatedSlug);
      }

      if (!userEditedMetaTitle) {
        setValue('metaTitle', {
          en: title.en || currentMetaTitle,
          fr: currentMetaTitle,
          es: title.es || currentMetaTitle,
          ar: title.ar || currentMetaTitle,
        });
      }
    }
  };

  const handleSlugChange = (_value: string) => {
    if (!userEditedSlug) {
      setUserEditedSlug(true);
    }
  };

  const handleMetaTitleBlur = () => {
    if (!userEditedMetaTitle) {
      setUserEditedMetaTitle(true);
    }
  };

  const fetchPost = async (id: number) => {
    setLoading(true);
    try {
      const res = await readOne(id);
      const post = res?.data?.item;

      if (!post) {
        throw new Error('Post not found in response');
      }

      methods.reset({
        title: post.title || { en: '', fr: '', es: '', ar: '' },
        slug: post.slug,
        excerpt: post.excerpt || { en: '', fr: '', es: '', ar: '' },
        content: post.content || { en: '', fr: '', es: '', ar: '' },
        metaTitle: post.metaTitle || { en: '', fr: '', es: '', ar: '' },
        metaDescription: post.metaDescription || { en: '', fr: '', es: '', ar: '' },
        image: post.image,
        categories: post.categories,
        tags: post.tags,
      });

      setUserEditedSlug(false);
      setUserEditedMetaTitle(false);
    } catch (e) {
      console.error('Failed to load post', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }
    fetchPost(postId);
  }, [postId]);

  const { items: categoriesData } = useCategories({ fetchItems: true, pageSize: 'all' });
  const { items: tagsData } = useTags({ fetchItems: true, pageSize: 'all' });

  const categoryOptions: SelectOption[] =
    categoriesData?.map((c) => ({
      value: c.id.toString(),
      label: getTranslatedText(c.name, 'Untitled'),
    })) || [];
  const tagOptions: SelectOption[] =
    tagsData?.map((t) => ({
      value: t.id.toString(),
      label: getTranslatedText(t.name, 'Untitled'),
    })) || [];

  const lookupCategories = (selected: SelectOption[]) =>
    selected
      .map((opt) => categoriesData?.find((c) => c.id.toString() === opt.value))
      .filter((c): c is Category => !!c);
  const lookupTags = (selected: SelectOption[]) =>
    selected
      .map((opt) => tagsData?.find((t) => t.id.toString() === opt.value))
      .filter((t): t is Tag => !!t);

  const submitHandler: SubmitHandler<PostFormValues> = async (data) => {
    if (!user || !user.agent) {
      console.error('No authenticated agent found.');
      return;
    }

    const basePayload = {
      agent_id: user.agent.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || undefined,
      content: data.content || '',
      image_id: data.image!.id,
      meta_title: data.metaTitle || undefined,
      meta_description: data.metaDescription || undefined,
      category_ids: data.categories.map((c) => c.id),
      tag_ids: data.tags.map((t) => t.id),
    };

    try {
      if (postId) {
        const currentPost = await readOne(postId);
        const currentStatus = currentPost?.data?.item?.status || POST_STATUS.DRAFT;

        const updatePayload: UpdateOneInput & { category_ids: number[]; tag_ids: number[] } = {
          ...basePayload,
          status: currentStatus,
        };

        const response = await updateOne(postId, updatePayload, {
          displayProgress: true,
          displaySuccess: true,
        });
        if (response.success) {
          router.push(Routes.Posts.ReadAll);
        }
      } else {
        const createPayload: CreateOneInput & { category_ids: number[]; tag_ids: number[] } = {
          ...basePayload,
          status: POST_STATUS.DRAFT,
        };

        const response = await createOne(createPayload, {
          displayProgress: true,
          displaySuccess: true,
        });
        if (response.success) {
          router.push(Routes.Posts.ReadAll);
        }
      }
    } catch (err) {
      console.error('Upsert failed', err);
    }
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(submitHandler)} sx={{ width: '100%' }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              flexDirection: 'column',
            }}
          >
            <CircularProgress size={40} />
            <Box mt={2} fontSize={16} color="text.secondary">
              {t('post:form.loading_post_data')}
            </Box>
          </Box>
        ) : (
          <>
            <Card variant="outlined" sx={{ overflow: 'initial' }}>
              <CardContent sx={{ overflow: 'visible' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="image"
                      control={methods.control}
                      render={({ field, fieldState: { error: _error } }) => (
                        <RHFImageDropzone
                          name={field.name}
                          upload={field.value || undefined}
                          onChange={(_, file) => field.onChange(file)}
                          deleteImmediately={false}
                          placeholder="common:choose_image"
                          resolution="1200x600"
                          maxSize={5000}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Title Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
                  >
                    {t('post:form.post_title')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="title.fr"
                        label={`${t('post:form.french')} *`}
                        onBlur={handleTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="title.ar"
                        label={`${t('post:form.arabic')} *`}
                        onBlur={handleTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="title.en"
                        label={t('post:form.english')}
                        onBlur={handleTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="title.es"
                        label={t('post:form.spanish')}
                        onBlur={handleTitleBlur}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Slug Section */}
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <RHFTextField
                        name="slug"
                        label={t('post:form.slug_label')}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Content Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
                  >
                    {t('post:form.post_content')}
                  </Typography>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {t('post:form.french_content')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <RHFTextEditor name="content.fr" />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {t('post:form.arabic_content')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <RHFTextEditor name="content.ar" />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {t('post:form.english_content')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <RHFTextEditor name="content.en" />
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {t('post:form.spanish_content')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <RHFTextEditor name="content.es" />
                    </AccordionDetails>
                  </Accordion>
                </Box>

                <Grid container spacing={2} mt={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="categories"
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <RHFAutocomplete<SelectOption, true, false, false>
                          name={field.name}
                          label={t('post:form.categories_label')}
                          multiple
                          options={categoryOptions}
                          value={(field.value || []).map((c) => ({
                            value: c.id.toString(),
                            label: getTranslatedText(c.name, 'Untitled'),
                          }))}
                          onChange={(_, value) =>
                            field.onChange(lookupCategories(value as SelectOption[]))
                          }
                          getOptionLabel={(opt) => opt.label}
                          isOptionEqualToValue={(opt, val) => opt.value === val.value}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="tags"
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <RHFAutocomplete<SelectOption, true, false, false>
                          name={field.name}
                          label={t('post:form.tags_label')}
                          multiple
                          options={tagOptions}
                          value={(field.value || []).map((t) => ({
                            value: t.id.toString(),
                            label: getTranslatedText(t.name, 'Untitled'),
                          }))}
                          onChange={(_, value) =>
                            field.onChange(lookupTags(value as SelectOption[]))
                          }
                          getOptionLabel={(opt) => opt.label}
                          isOptionEqualToValue={(opt, val) => opt.value === val.value}
                          helperText={error?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Excerpt Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
                  >
                    {t('post:form.post_excerpt')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="excerpt.fr"
                        label={t('post:form.french')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="excerpt.ar"
                        label={t('post:form.arabic')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="excerpt.en"
                        label={t('post:form.english')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="excerpt.es"
                        label={t('post:form.spanish')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Meta Title Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
                  >
                    {t('post:form.meta_title')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaTitle.fr"
                        label={t('post:form.french')}
                        onBlur={handleMetaTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaTitle.ar"
                        label={t('post:form.arabic')}
                        onBlur={handleMetaTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaTitle.en"
                        label={t('post:form.english')}
                        onBlur={handleMetaTitleBlur}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaTitle.es"
                        label={t('post:form.spanish')}
                        onBlur={handleMetaTitleBlur}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Meta Description Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}
                  >
                    {t('post:form.meta_description')}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaDescription.fr"
                        label={t('post:form.french')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaDescription.ar"
                        label={t('post:form.arabic')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaDescription.en"
                        label={t('post:form.english')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <RHFTextField
                        name="metaDescription.es"
                        label={t('post:form.spanish')}
                        multiline
                        rows={2}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button type="submit" variant="contained" disabled={loading || !isValid}>
                {postId ? t('post:form.save_changes') : t('post:form.create_post')}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </FormProvider>
  );
};

export default UpsertPostFormWithPreview;
