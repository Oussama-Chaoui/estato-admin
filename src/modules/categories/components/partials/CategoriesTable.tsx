import Routes from '@common/defs/routes';
import ItemsTable, { RowAction } from '@common/components/partials/ItemsTable';
import { CRUD_ACTION, CrudRow } from '@common/defs/types';
import { GridColumns, GridRenderCellParams } from '@mui/x-data-grid';
import Namespaces from '@common/defs/namespaces';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { Category as CategoryIcon, Label as SlugIcon, InfoOutlined } from '@mui/icons-material';
import { useRouter } from 'next/router';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import namespace from '@modules/categories/defs/namespace';
import useCategories, {
  CreateOneInput,
  UpdateOneInput,
} from '@modules/categories/hooks/api/useCategories';
import { Category as CategoryType } from '@modules/categories/defs/types';

interface Row extends CrudRow {
  name: string;
  slug: string;
  description?: string;
}

const CategoriesTable = () => {
  const { t, i18n } = useTranslation(['category']);
  const router = useRouter();
  const { can } = usePermissions();

  const columns: GridColumns<Row> = [
    {
      field: 'name',
      headerName: t('category:list.name'),
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CategoryIcon fontSize="small" color="primary" />
          <strong>{params.value}</strong>
        </Stack>
      ),
    },
    {
      field: 'slug',
      headerName: t('category:list.slug'),
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <SlugIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'description',
      headerName: t('category:list.description'),
      flex: 2.5,
      minWidth: 240,
      renderCell: (params: GridRenderCellParams<string | undefined>) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {params.value || t('category:list.noDescription')}
        </Typography>
      ),
    },
  ];

  const [translatedColumns, setTranslatedColumns] = useState<GridColumns<Row>>(columns);
  useEffect(() => {
    setTranslatedColumns(columns);
  }, [t, i18n.language]);

  const itemToRow = (item: CategoryType): Row => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
  });

  const detailsAction: RowAction<CategoryType> = {
    label: t('category:list.details'),
    icon: <InfoOutlined />,
    onClick: (id) => {
      router.push(Routes.Categories.ReadOne.replace('{id}', id.toString()));
    },
    enabled: (id) => {
      return can(namespace, CRUD_ACTION.READ) || can(namespace, CRUD_ACTION.READ, id);
    },
  };

  const actions: RowAction<CategoryType>[] = [detailsAction];

  return (
    <ItemsTable<CategoryType, CreateOneInput, UpdateOneInput, Row>
      namespace={Namespaces.Categories}
      routes={Routes.Categories}
      useItems={useCategories}
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

export default CategoriesTable;
