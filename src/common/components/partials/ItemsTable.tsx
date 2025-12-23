import MenuPopover from '@common/components/lib/utils/MenuPopover/MenuPopover';
import { Any, CRUD_ACTION, CrudAppRoutes, CrudRow, Id } from '@common/defs/types';
import usePermissions from '@modules/permissions/hooks/usePermissions';
import { FilterParam, SortParam, UseItems, UseItemsOptions } from '@common/hooks/useItems';
import { DeleteOutline, Edit, MoreVert, LockTwoTone, LockOpen, Search } from '@mui/icons-material';
import {
  Box,
  Card,
  IconButton,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import {
  DataGrid,
  frFR,
  esES,
  enUS,
  GridColumns,
  GridToolbar,
  GridEnrichedColDef,
  GridSortModel,
  GridFilterModel,
} from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { GridRowHeightParams, GridRowHeightReturnValue } from '@mui/x-data-grid-premium';
import { useDialogContext } from '@common/contexts/DialogContext';
import { useTranslation } from 'react-i18next';
import { FetchApiOptions } from '@common/hooks/useApi';

interface SearchFieldOption {
  field: string;
  label?: string;
}

interface SearchProps {
  enabled?: boolean;
  defaultField?: string;
  fieldsFromColumns?: boolean;
  fields?: SearchFieldOption[];
  placeholder?: string;
  debounceMs?: number;
  operator?: string;
}

interface ItemsTableProps<Item, CreateOneInput, UpdateOneInput, Row> {
  namespace: string;
  routes: CrudAppRoutes;
  useItems: UseItems<Item, CreateOneInput, UpdateOneInput>;
  useItemsOptions?: UseItemsOptions;
  columns: GridColumns;
  itemToRow: (item: Item) => Row;
  getRowHeight?: (params: GridRowHeightParams) => GridRowHeightReturnValue;
  actions?: RowAction<Item>[];
  showEdit?: (id: Id, item: Item) => boolean;
  showDelete?: (id: Id, item: Item) => boolean;
  showLock?: boolean;
  noHeader?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  customToolbar?: React.FC;
  exportable?: boolean;
  filterModel?: GridFilterModel;
  sortModel?: GridSortModel;
  refreshIndex?: number;
  search?: SearchProps;
}

export interface RowAction<Item> {
  label: string | ((id: Id, item: Item) => string);
  icon?: JSX.Element | ((id: Id, item: Item) => JSX.Element);
  onClick?: (id: Id, item: Item, refreshRows: () => void) => void;
  enabled?: (id: Id, item: Item) => boolean;
}
const ItemsTable = <Item, CreateOneInput, UpdateOneInput, Row extends CrudRow>(
  props: ItemsTableProps<Item, CreateOneInput, UpdateOneInput, Row>
) => {
  const {
    namespace,
    routes,
    useItems,
    useItemsOptions,
    columns: initColumns,
    itemToRow,
    getRowHeight,
    actions,
    noHeader,
    density = 'standard',
    showLock = false,
    customToolbar,
    exportable = false,
    filterModel: propFilterModel,
    sortModel: propSortModel,
    refreshIndex,
    search,
  } = props;
  const { items, paginationMeta, readAll, deleteOne, mutate } = useItems(useItemsOptions);
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<GridColumns>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>(propFilterModel || { items: [] });
  const defaultSortModel = useMemo<GridSortModel>(
    () =>
      propSortModel && propSortModel.length > 0
        ? propSortModel
        : [{ field: 'createdAt', sort: 'desc' }],
    [propSortModel]
  );
  const [sortModel, setSortModel] = useState<GridSortModel>(defaultSortModel);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(50);
  const [searchText, setSearchText] = useState<string>('');
  const [searchField, setSearchField] = useState<string>('');

  const TABLE_MIN_HEIGHT = '400px';

  const { i18n, t } = useTranslation(['common']);
  const currentLanguage = i18n.language || 'fr';

  let localeText;
  switch (currentLanguage) {
    case 'fr':
      localeText = frFR.components.MuiDataGrid.defaultProps.localeText;
      break;
    case 'es':
      localeText = esES.components.MuiDataGrid.defaultProps.localeText;
      break;
    case 'en':
      localeText = enUS.components.MuiDataGrid.defaultProps.localeText;
      break;
    default:
      localeText = frFR.components.MuiDataGrid.defaultProps.localeText;
  }

  useEffect(() => {
    setColumns(initColumns);
  }, [initColumns]);

  useEffect(() => {
    if (!search) {
      return;
    }
    if (!searchField) {
      if (search.defaultField) {
        setSearchField(search.defaultField);
      } else if (search.fields && search.fields.length > 0) {
        setSearchField(search.fields[0].field);
      } else if (search.fieldsFromColumns && initColumns && initColumns.length > 0) {
        const firstColumn = initColumns.find(
          (c) => typeof c.field === 'string' && c.field !== 'actions'
        );
        if (firstColumn && typeof firstColumn.field === 'string') {
          setSearchField(firstColumn.field);
        }
      }
    }
  }, [search, initColumns, searchField]);

  useEffect(() => {
    if (items && items.length > 0) {
      const itemsRows = items.map(itemToRow);
      setRows([...itemsRows]);

      const actionsColumn: GridEnrichedColDef<Row> = {
        field: 'actions',
        headerName: t('common:actions'),
        filterable: false,
        sortable: false,
        width: 85,
        cellClassName: 'actions-cell',
        renderCell: (params) => {
          const id = params.row.id;
          const item = items?.find((item) => (item as Any).id === id) as unknown as Item;
          return (
            <RowActionCell
              id={id}
              item={item}
              namespace={namespace}
              routes={routes}
              deleteOne={deleteOne}
              actions={actions}
              showEdit={props.showEdit}
              showDelete={props.showDelete}
              showLock={showLock}
              refreshRows={refreshRows}
            />
          );
        },
      };

      if (actions || showLock || props.showEdit || props.showDelete) {
        setColumns([...initColumns, actionsColumn]);
      } else {
        setColumns([...initColumns]);
      }
    } else {
      setRows([]);
      setColumns([...initColumns]);
    }
  }, [items, currentLanguage]);

  useEffect(() => {
    let filterParam: FilterParam | undefined;
    let sortParam: SortParam | undefined;
    if (filterModel && filterModel.items[0]) {
      filterParam = {
        filterColumn: filterModel.items[0].columnField,
        filterOperator: filterModel.items[0].operatorValue || 'equals',
        filterValue: filterModel.items[0].value,
      };
    }

    if (sortModel && sortModel[0] && sortModel[0].sort) {
      sortParam = {
        column: sortModel[0].field,
        dir: sortModel[0].sort,
      };
    }

    readAll(page + 1, pageSize, sortParam, filterParam ? [filterParam] : []);
  }, [page, pageSize, sortModel, filterModel]);

  useEffect(() => {
    if (!search) {
      return;
    }
    const debounceMs = search.debounceMs ?? 300;
    const baseOperator = search.operator ?? 'contains';
    const op = searchField === 'id' && baseOperator === 'contains' ? 'equals' : baseOperator;
    const timer = setTimeout(() => {
      // Always update filter model, even on empty results, to avoid fallback to unfiltered state
      if (searchText && searchField) {
        setFilterModel({
          items: [
            {
              columnField: searchField,
              operatorValue: op,
              value: searchText,
            },
          ],
        });
      } else {
        setFilterModel({ items: [] });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchText, searchField, search]);

  useEffect(() => {
    mutate();
  }, [refreshIndex]);

  const refreshRows = () => {
    setRows((previous) => [...previous]);
  };

  return (
    <>
      <Card>
        <Box sx={{ minHeight: TABLE_MIN_HEIGHT, height: 'fit-content', overflowY: 'auto' }}>
          {!items || !columns || columns.length <= 0 ? (
            <>
              <Grid
                container
                spacing={1}
                columns={{ sm: 2, md: 4, lg: 6 }}
                paddingX={4}
                marginTop={6}
              >
                {Array.from(Array(24)).map((_, index) => (
                  <Grid xs={1} key={index}>
                    <Skeleton variant="rectangular" height={45} />
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              {search && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    px: 2,
                    pt: 1,
                    pb: 1,
                  }}
                >
                  {((search.fields && search.fields.length > 1) || search.fieldsFromColumns) && (
                    <FormControl size="small" sx={{ minWidth: 180, mr: 1 }}>
                      <Select
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value as string)}
                        displayEmpty
                      >
                        {(search.fields && search.fields.length > 0
                          ? search.fields
                          : initColumns
                              .filter((c) => typeof c.field === 'string' && c.field !== 'actions')
                              .map((c) => ({
                                field: c.field as string,
                                label: (c.headerName as string) || (c.field as string),
                              }))
                        ).map((opt, idx) => (
                          <MenuItem key={idx} value={opt.field}>
                            {opt.label || opt.field}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <TextField
                    size="small"
                    placeholder={search.placeholder || t('common:search')}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}
              <DataGrid
                sortingMode="server"
                filterMode="server"
                paginationMode="server"
                filterModel={filterModel}
                sortModel={sortModel}
                pagination
                onPageChange={(page) => {
                  setPage(page);
                }}
                onPageSizeChange={(pageSize) => {
                  setPageSize(pageSize);
                }}
                onSortModelChange={(model) => {
                  if (!model || model.length === 0) {
                    setSortModel(defaultSortModel);
                  } else {
                    setSortModel(model);
                  }
                }}
                onFilterModelChange={(model) => setFilterModel(model)}
                rowCount={paginationMeta?.totalItems}
                pageSize={pageSize}
                getRowHeight={getRowHeight}
                disableSelectionOnClick
                rows={rows}
                columns={columns}
                localeText={localeText}
                components={noHeader ? {} : { Toolbar: customToolbar || GridToolbar }}
                density={density}
                componentsProps={{
                  toolbar: {
                    printOptions: { disableToolbarButton: true },
                    csvOptions: { disableToolbarButton: !exportable },
                  },
                }}
                sx={{
                  '& .MuiDataGrid-main': { minHeight: TABLE_MIN_HEIGHT },
                  '& .MuiDataGrid-virtualScroller': {
                    minHeight: `calc(${TABLE_MIN_HEIGHT} - 39px)`,
                  },
                }}
                autoHeight
              />
            </>
          )}
        </Box>
      </Card>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RowActionCellProps<Item, CreateOneInput, UpdateOneInput> {
  id: Id;
  item: Item;
  namespace: string;
  routes: CrudAppRoutes;
  deleteOne: (id: number, options?: FetchApiOptions | undefined) => Promise<Any>;
  actions?: RowAction<Item>[];
  showEdit?: (id: Id, item: Item) => boolean;
  showDelete?: (id: Id, item: Item) => boolean;
  refreshRows: () => void;
  showLock?: boolean;
}

const RowActionCell = <Item, CreateOneInput, UpdateOneInput>(
  props: RowActionCellProps<Item, CreateOneInput, UpdateOneInput>
) => {
  const { id, item, namespace, routes, deleteOne, actions, refreshRows, showLock = true } = props;
  const { openConfirmDialog } = useDialogContext();
  const showEdit = props.showEdit ? props.showEdit(id, item) : true;
  const showDelete = props.showDelete ? props.showDelete(id, item) : true;
  const { can } = usePermissions();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { t } = useTranslation(['common']);

  const enabledActions =
    actions?.filter((action) => !action.enabled || action.enabled(id, item)) || [];

  if (enabledActions.length === 0 && !showEdit && !showDelete) {
    if (showLock) {
      return <LockTwoTone sx={{ color: 'text.secondary' }} />;
    }
    return null;
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const canUpdate = (id: Id) => {
    return can(namespace, CRUD_ACTION.UPDATE) || can(namespace, CRUD_ACTION.UPDATE, id);
  };

  const canDelete = (id: Id) => {
    return can(namespace, CRUD_ACTION.DELETE) || can(namespace, CRUD_ACTION.DELETE, id);
  };

  if (!canUpdate(id) && !canDelete(id)) {
    if (showLock) {
      return <LockTwoTone sx={{ color: 'text.secondary' }} />;
    }
    return null;
  }
  return (
    <Box sx={{ width: '100%', textAlign: 'right', display: 'flex', alignItems: 'center' }}>
      {showLock &&
        (showEdit && canUpdate(id) ? (
          <LockOpen sx={{ color: 'text.secondary' }} />
        ) : (
          <LockTwoTone sx={{ color: 'text.secondary' }} />
        ))}
      <IconButton color={anchorEl ? 'inherit' : 'default'} onClick={handleMenuOpen}>
        <MoreVert />
      </IconButton>
      <MenuPopover open={anchorEl} onClose={handleMenuClose} arrow="right-top">
        {showEdit && canUpdate(id) && (
          <MenuItem
            key="edit"
            onClick={() => {
              handleMenuClose();
              router.push(routes.UpdateOne.replace('{id}', id.toString()));
            }}
          >
            <Edit /> {t('common:table_actions.edit')}
          </MenuItem>
        )}
        {enabledActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleMenuClose();
              action.onClick?.(id, item, refreshRows);
            }}
          >
            {action.icon && typeof action.icon === 'function' ? action.icon(id, item) : action.icon}{' '}
            {action.label && typeof action.label === 'function'
              ? action.label(id, item)
              : action.label}
          </MenuItem>
        ))}
        {showDelete && canDelete(id) && (
          <MenuItem
            key="delete"
            onClick={() => {
              handleMenuClose();
              openConfirmDialog(
                t('common:table_actions.delete_confirm_title'),
                t('common:table_actions.delete_confirm_message'),
                () => {
                  deleteOne(id, { displayProgress: true, displaySuccess: true });
                },
                t('common:table_actions.delete_confirm_yes'),
                'error'
              );
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutline /> {t('common:table_actions.delete')}
          </MenuItem>
        )}
      </MenuPopover>
    </Box>
  );
};

export default ItemsTable;
