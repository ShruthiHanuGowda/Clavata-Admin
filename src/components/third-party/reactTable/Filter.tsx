// material-ui
import Stack from '@mui/material/Stack';

// third-party
import { Column, RowData, Table, Updater } from '@tanstack/react-table';

// project-import
import MinusOutlined from '@ant-design/icons/MinusOutlined';
import DebouncedInput from './DebouncedInput';

// ==============================|| NUMBER INPUT ||============================== //

type NumberInputProps = {
  columnFilterValue: [number, number];
  getFacetedMinMaxValues: () => [number, number] | undefined;
  setFilterValue: (updater: Updater<[number, number] | undefined>) => void;
};

function NumberInput({ columnFilterValue, getFacetedMinMaxValues, setFilterValue }: NumberInputProps) {
  const minOpt = getFacetedMinMaxValues()?.[0];
  const min = Number(minOpt ?? '');

  const maxOpt = getFacetedMinMaxValues()?.[1];
  const max = Number(maxOpt);

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[0] ?? ''}
        onFilterChange={(value) => setFilterValue((old) => [value, old?.[1]] as [number, number])}
        placeholder={`Min ${minOpt ? `(${min})` : ''}`}
        fullWidth
        inputProps={{ min, max }}
        size="small"
        startAdornment={false}
      />
      <MinusOutlined />
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[1] ?? ''}
        onFilterChange={(value) => setFilterValue((old) => [old?.[0], value] as [number, number])}
        placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
        fullWidth
        inputProps={{ min, max }}
        size="small"
        startAdornment={false}
      />
    </Stack>
  );
}

// ==============================|| TEXT INPUT ||============================== //

type TextInputProps = {
  columnId: string;
  columnFilterValue: string;
  setFilterValue: (updater: Updater<string | undefined>) => void;
  header?: string;
};

function TextInput({ columnId, columnFilterValue, header, setFilterValue }: TextInputProps) {
  const dataListId = columnId + 'list';

  return (
    <DebouncedInput
      type="text"
      fullWidth
      value={columnFilterValue ?? ''}
      onFilterChange={(value) => setFilterValue(value)}
      placeholder={`Search ${header}`}
      inputProps={{ list: dataListId }}
      size="small"
      startAdornment={false}
    />
  );
}

// ==============================|| FILTER COMPONENT ||============================== //

type Props<T extends RowData> = {
  column: Column<T, unknown>;
  table: Table<T>;
};

export default function Filter<T extends RowData>({ column, table }: Props<T>) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === 'number' ? (
    <NumberInput
      columnFilterValue={columnFilterValue as [number, number]}
      getFacetedMinMaxValues={column.getFacetedMinMaxValues}
      setFilterValue={column.setFilterValue}
    />
  ) : (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string}
      setFilterValue={column.setFilterValue}
      header={column.columnDef.header as string}
    />
  );
}
