import Routes from '@common/defs/routes';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import { CRUD_ACTION, CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useTranslatedText } from '@common/utils/translations';
import { Chip, Stack, Typography, Box, Tooltip } from '@mui/material';
import {
  Article as ArticleIcon,
  CalendarToday,
  Label as TagIcon,
  Category as CategoryIcon,
  Publish,
  Archive,
} from '@mui/icons-material';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import namespace from '@modules/posts/defs/namespace';
import usePosts, { CreateOneInput, UpdateOneInput } from '@modules/posts/hooks/api/usePosts';
import { Post as PostType, POST_STATUS } from '@modules/posts/defs/types';

interface Row extends CrudRow {
  title: string;
  slug: string;
  status: POST_STATUS;
  publishedAt?: string;
  categories: { id: number; name: string }[];
  tags: { id: number; name: string }[];
}

interface PostWithRelations extends PostType {
  categories?: Array<{
    id: number;
    name: {
      en?: string;
      fr: string;
      es?: string;
      ar: string;
    };
    slug: string;
    description?: {
      en?: string;
      fr?: string;
      es?: string;
      ar?: string;
    };
  }>;
  tags?: Array<{
    id: number;
    name: {
      en?: string;
      fr: string;
      es?: string;
      ar: string;
    };
    slug: string;
  }>;
}

const PostsTable = () => {
  const { t, i18n } = useTranslation(['post']);
  const getTranslatedText = useTranslatedText();
  const { can } = usePermissions();

  const columns: GridColumns<Row> = [
    {
      field: 'title',
      headerName: t('post:list.title'),
      flex: 2,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <ArticleIcon fontSize="small" color="primary" />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: t('post:list.status'),
      flex: 1,
      renderCell: (params: GridRenderCellParams<POST_STATUS>) => {
        let color: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';
        switch (params.value) {
          case POST_STATUS.PUBLISHED:
            color = 'success';
            break;
          case POST_STATUS.ARCHIVED:
            color = 'warning';
            break;
          default:
            color = 'primary';
        }
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={t(`post:status.${params.value?.toLowerCase()}`)}
              size="small"
              color={color}
              sx={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.75rem' }}
            />
          </Stack>
        );
      },
    },
    {
      field: 'publishedAt',
      headerName: t('post:list.publishedAt'),
      flex: 1.2,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.value) {
          return (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}
            >
              {t('post:list.unpublished')}
            </Typography>
          );
        }
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarToday fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
              {new Date(params.value).toLocaleDateString()}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'categories',
      headerName: t('post:list.categories'),
      flex: 3,
      renderCell: (params) => {
        const categories = params.row.categories || [];
        return (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {categories.slice(0, 2).map((cat) => (
              <Tooltip key={cat.id} title={cat.name} arrow>
                <Chip
                  icon={<CategoryIcon fontSize="small" />}
                  label={cat.name.length > 12 ? `${cat.name.substring(0, 12)}...` : cat.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    fontSize: '0.75rem',
                    maxWidth: '100%',
                  }}
                />
              </Tooltip>
            ))}
            {categories.length > 2 && (
              <Tooltip title={`+${categories.length - 2} more categories`} arrow>
                <Chip
                  label={`+${categories.length - 2}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: 'tags',
      headerName: t('post:list.tags'),
      flex: 1.5,
      renderCell: (params) => {
        const tags = params.row.tags || [];
        return (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            {tags.slice(0, 2).map((tag) => (
              <Tooltip key={tag.id} title={tag.name} arrow>
                <Chip
                  icon={<TagIcon fontSize="small" />}
                  label={tag.name.length > 12 ? `${tag.name.substring(0, 12)}...` : tag.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    fontSize: '0.75rem',
                    maxWidth: '100%',
                  }}
                />
              </Tooltip>
            ))}
            {tags.length > 2 && (
              <Tooltip title={`+${tags.length - 2} more tags`} arrow>
                <Chip
                  label={`+${tags.length - 2}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);
  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: PostWithRelations): Row => ({
    id: item.id,
    title: getTranslatedText(item.title, 'Untitled'),
    slug: item.slug,
    status: item.status,
    publishedAt: item.publishedAt ?? '',
    categories: (item.categories || []).map((cat) => ({
      id: cat.id,
      name: getTranslatedText(cat.name, 'Untitled'),
    })),
    tags: (item.tags || []).map((tag) => ({
      id: tag.id,
      name: getTranslatedText(tag.name, 'Untitled'),
    })),
  });

  const { patchOne } = usePosts();

  const publishAction: RowAction<PostWithRelations> = {
    label: 'Publish',
    icon: <Publish />,
    onClick: async (id) => {
      try {
        const response = await patchOne(
          id,
          {
            status: POST_STATUS.PUBLISHED,
            published_at: new Date().toISOString(),
          },
          { displayProgress: true, displaySuccess: true }
        );

        if (response.success) {
          console.log('Post published successfully:', id);
        }
      } catch (error) {
        console.error('Failed to publish post:', error);
      }
    },
    enabled: (id, item) => {
      return (
        (can(namespace, CRUD_ACTION.UPDATE) || can(namespace, CRUD_ACTION.UPDATE, id)) &&
        item.status !== POST_STATUS.PUBLISHED
      );
    },
  };

  const archiveAction: RowAction<PostWithRelations> = {
    label: 'Archive',
    icon: <Archive />,
    onClick: async (id) => {
      try {
        const response = await patchOne(
          id,
          {
            status: POST_STATUS.ARCHIVED,
          },
          { displayProgress: true, displaySuccess: true }
        );

        if (response.success) {
          console.log('Post archived successfully:', id);
        }
      } catch (error) {
        console.error('Failed to archive post:', error);
      }
    },
    enabled: (id, item) => {
      return (
        (can(namespace, CRUD_ACTION.UPDATE) || can(namespace, CRUD_ACTION.UPDATE, id)) &&
        item.status !== POST_STATUS.ARCHIVED
      );
    },
  };

  const actions: RowAction<PostWithRelations>[] = [publishAction, archiveAction];

  return (
    <ItemsTable<PostWithRelations, CreateOneInput, UpdateOneInput, Row>
      namespace={Namespaces.Posts}
      routes={Routes.Posts}
      useItems={usePosts}
      columns={translatedColumns}
      itemToRow={itemToRow}
      showEdit={(id) => can(namespace, CRUD_ACTION.UPDATE, id)}
      showDelete={(id) => can(namespace, CRUD_ACTION.DELETE, id)}
      getRowHeight={() => 'auto'}
      noHeader
      exportable
      search={{
        enabled: true,
        defaultField: 'title',
        fields: [
          { field: 'title', label: t('post:list.title') || 'Title' },
          { field: 'status', label: t('post:list.status') || 'Status' },
        ],
        fieldsFromColumns: false,
        placeholder: t('common:search') || 'Search',
        operator: 'contains',
        debounceMs: 300,
      }}
      sortModel={[{ field: 'publishedAt', sort: 'desc' }]}
      actions={actions}
      density="comfortable"
    />
  );
};

export default PostsTable;
