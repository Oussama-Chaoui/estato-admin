import Routes from '@common/defs/routes';
import ItemsTable from '@common/components/partials/ItemsTable';
import { CRUD_ACTION, CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Chip, Stack, Typography, Box, Tooltip } from '@mui/material';
import {
  Article as ArticleIcon,
  CircleNotifications,
  CalendarToday,
  Label as TagIcon,
  Category as CategoryIcon,
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

const PostsTable = () => {
  const { t, i18n } = useTranslation(['post']);
  const { can } = usePermissions();

  const columns: GridColumns<Row> = [
    {
      field: 'title',
      headerName: t('post:list.title'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <ArticleIcon fontSize="small" color="primary" />
          <strong>{params.value}</strong>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: t('post:list.status'),
      flex: 1,
      minWidth: 140,
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
            <CircleNotifications fontSize="small" color="primary" />
            <Chip
              label={t(`post:status.${params.value}`)}
              size="small"
              color={color}
              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
            />
          </Stack>
        );
      },
    },
    {
      field: 'publishedAt',
      headerName: t('post:list.publishedAt'),
      flex: 1.2,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<string>) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              {t('post:list.unpublished')}
            </Typography>
          );
        }
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarToday fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {new Date(params.value).toLocaleDateString()}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'categories',
      headerName: t('post:list.categories'),
      flex: 1.8,
      minWidth: 200,
      renderCell: (params) => {
        const categories = params.row.categories || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((cat) => (
              <Tooltip key={cat.id} title={cat.name} arrow>
                <Chip
                  icon={<CategoryIcon fontSize="small" />}
                  label={cat.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        );
      },
    },
    {
      field: 'tags',
      headerName: t('post:list.tags'),
      flex: 1.8,
      minWidth: 200,
      renderCell: (params) => {
        const tags = params.row.tags || [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag) => (
              <Tooltip key={tag.id} title={tag.name} arrow>
                <Chip
                  icon={<TagIcon fontSize="small" />}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        );
      },
    },
  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);
  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: PostType): Row => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: item.status,
    publishedAt: item.publishedAt ?? '',
    categories: item.categories || [],
    tags: item.tags || [],
  });

  return (
    <ItemsTable<PostType, CreateOneInput, UpdateOneInput, Row>
      namespace={Namespaces.Posts}
      routes={Routes.Posts}
      useItems={usePosts}
      columns={translatedColumns}
      itemToRow={itemToRow}
      showEdit={(id) => can(namespace, CRUD_ACTION.UPDATE, id)}
      showDelete={(id) => can(namespace, CRUD_ACTION.DELETE, id)}
      getRowHeight={() => 'auto'}
      exportable
    />
  );
};

export default PostsTable;
