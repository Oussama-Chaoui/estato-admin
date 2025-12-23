import Routes from '@common/defs/routes';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import { Any, CRUD_ACTION, CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { Label as SlugIcon, Tag as TagIcon, InfoOutlined } from '@mui/icons-material';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import namespace from '@modules/tags/defs/namespace';
import useTags, { CreateOneInput, UpdateOneInput } from '@modules/tags/hooks/api/useTags';
import { Tag as TagType } from '@modules/tags/defs/types';
import { getTranslatedText } from '@common/utils/translations';

interface Row extends CrudRow {
  name: string;
  slug: string;
}

const TagsTable = () => {
  const { t, i18n } = useTranslation(['tag']);
  const router = useRouter();
  const { can } = usePermissions();

  const columns: GridColumns<Row> = [
    {
      field: 'name',
      headerName: t('tag:list.name'),
      flex: 2,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <TagIcon fontSize="small" color="primary" />
          <strong>{params.value}</strong>
        </Stack>
      ),
    },
    {
      field: 'slug',
      headerName: t('tag:list.slug'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <SlugIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);
  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: TagType): Row => ({
    id: item.id,
    name: getTranslatedText(item.name as Any, '', i18n.language),
    slug: item.slug,
  });

  const detailsAction: RowAction<TagType> = {
    label: t('tag:list.details'),
    icon: <InfoOutlined />,
    onClick: (id) => {
      router.push(Routes.Tags.ReadOne.replace('{id}', id.toString()));
    },
    enabled: (id) => {
      return can(namespace, CRUD_ACTION.READ) || can(namespace, CRUD_ACTION.READ, id);
    },
  };

  const actions: RowAction<TagType>[] = [detailsAction];

  return (
    <ItemsTable<TagType, CreateOneInput, UpdateOneInput, Row>
      namespace={Namespaces.Tags}
      routes={Routes.Tags}
      useItems={useTags}
      columns={translatedColumns}
      itemToRow={itemToRow}
      showEdit={(id) => can(namespace, CRUD_ACTION.UPDATE, id)}
      showDelete={(id) => can(namespace, CRUD_ACTION.DELETE, id)}
      getRowHeight={() => 'auto'}
      exportable
      actions={actions}
    />
  );
};

export default TagsTable;
