import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useForm, FormProvider, SubmitHandler, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import RHFTextField from '@common/components/lib/react-hook-form/RHFTextField';
import RHFImageDropzone from '@common/components/lib/react-hook-form/RHFImageDropzone';
import RHFAutocomplete, {
  SelectOption,
} from '@common/components/lib/react-hook-form/RHFAutocomplete';
import RHFTextEditor from '@common/components/lib/react-hook-form/RHFTextEditor';
import usePosts, { CreateOneInput } from '@modules/posts/hooks/api/usePosts';
import useCategories from '@modules/categories/hooks/api/useCategories';
import useTags from '@modules/tags/hooks/api/useTags';
import useAuth from '@modules/auth/hooks/api/useAuth';
import { Upload } from '@modules/uploads/defs/types';
import { Category } from '@modules/categories/defs/types';
import { Tag } from '@modules/tags/defs/types';
import { useRouter } from 'next/router';
import Routes from '@common/defs/routes';

interface PostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  image: Upload | null;
  categories: Category[];
  tags: Tag[];
}

interface UpsertPostFormWithPreviewProps {
  postId?: number;
}

const schema = yup.object({
  title: yup.string().required('Title is required'),
  slug: yup.string().max(255, 'Maximum length is 255').required('Slug is required'),
  excerpt: yup.string().optional(),
  content: yup
    .string()
    .test(
      'content-not-empty',
      'Content is required',
      (value = '') => value.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s+/g, '').length > 0
    ),
  metaTitle: yup.string().max(255, 'Maximum length is 255').optional(),
  metaDescription: yup.string().max(500, 'Maximum length is 500').optional(),
  image: yup.mixed<Upload>().nullable().required('Featured image is required'),
  categories: yup
    .array()
    .of(
      yup.object({
        id: yup.number().required(),
        name: yup.string().required(),
        slug: yup.string().required(),
        description: yup.string().nullable(),
      })
    )
    .min(1, 'Select at least one category'),
  tags: yup
    .array()
    .of(
      yup.object({
        id: yup.number().required(),
        name: yup.string().required(),
        slug: yup.string().required(),
      })
    )
    .min(1, 'Select at least one tag'),
});

const UpsertPostFormWithPreview = ({ postId }: UpsertPostFormWithPreviewProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const methods = useForm<PostFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      image: null,
      categories: [],
      tags: [],
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = methods;

  const { readOne, createOne, updateOne } = usePosts();
  const [loading, setLoading] = useState(Boolean(postId));

  const fetchPost = async (id: number) => {
    setLoading(true);
    try {
      const res = await readOne(id);
      const post = res?.data?.item;

      if (!post) {
        throw new Error('Post not found in response');
      }

      methods.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        content: post.content,
        metaTitle: post.metaTitle ?? '',
        metaDescription: post.metaDescription ?? '',
        image: post.image,
        categories: post.categories,
        tags: post.tags,
      });
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
    categoriesData?.map((c) => ({ value: c.id.toString(), label: c.name })) || [];
  const tagOptions: SelectOption[] =
    tagsData?.map((t) => ({ value: t.id.toString(), label: t.name })) || [];

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

    const payload: CreateOneInput & { category_ids: number[]; tag_ids: number[] } = {
      agent_id: user.agent.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || undefined,
      content: data.content || '',
      status: 'draft',
      image_id: data.image!.id,
      meta_title: data.metaTitle || undefined,
      meta_description: data.metaDescription || undefined,
      category_ids: data.categories.map((c) => c.id),
      tag_ids: data.tags.map((t) => t.id),
    };

    try {
      if (postId) {
        await updateOne(postId, payload, { displayProgress: true, displaySuccess: true });
      } else {
        await createOne(payload, { displayProgress: true, displaySuccess: true });
      }
      router.push(Routes.Posts.ReadAll);
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
              Loading post data...
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
                      render={({ field, fieldState: { error } }) => (
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

                  <Grid item xs={12} md={6}>
                    <RHFTextField name="title" label="Title" />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RHFTextField name="slug" label="Slug" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField name="excerpt" label="Excerpt" multiline rows={2} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="categories"
                      control={methods.control}
                      render={({ field, fieldState: { error } }) => (
                        <RHFAutocomplete<SelectOption, true, false, false>
                          name={field.name}
                          label="Categories"
                          multiple
                          options={categoryOptions}
                          value={(field.value || []).map((c) => ({
                            value: c.id.toString(),
                            label: c.name,
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
                          label="Tags"
                          multiple
                          options={tagOptions}
                          value={(field.value || []).map((t) => ({
                            value: t.id.toString(),
                            label: t.name,
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

                <Grid container spacing={2}>
                  <Grid item xs={12} my={2}>
                    <RHFTextEditor name="content" />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <RHFTextField name="metaTitle" label="Meta Title" />
                  </Grid>
                  <Grid item xs={12}>
                    <RHFTextField
                      name="metaDescription"
                      label="Meta Description"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button type="submit" variant="contained" disabled={loading || !isValid}>
                {postId ? 'Save changes' : 'Create post'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </FormProvider>
  );
};

export default UpsertPostFormWithPreview;
