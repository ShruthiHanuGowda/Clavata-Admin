import { useEffect, useState, ChangeEvent } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import * as yup from 'yup';
import { Formik, Form } from 'formik';
import { Row, RowData, Table, ColumnDef } from '@tanstack/react-table';

// project-imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';

// ------------------- TABLE META TYPE -------------------
export type TableMeta = {
  selectedRow: Record<string, boolean>;
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
};

// ------------------- PROPS -------------------
// Extend ColumnDef to include dataType property
type ExtendedColumnDef<TData> = ColumnDef<TData> & {
  dataType?: 'text' | 'select' | 'progress'; // Custom dataType property
};

// Update RowEditProps to use the extended ColumnDef type
type RowEditProps = {
  getValue: () => unknown;
  row: Row<RowData>;
  column: ExtendedColumnDef<RowData>;
  table: Table<RowData>;
};

// ==============================|| EDITABLE ROW ||============================== //

export default function RowEditable({ getValue: initialValue, row, column, table }: RowEditProps) {
  const [value, setValue] = useState<unknown>(initialValue);
  const tableMeta = table.options.meta as TableMeta | undefined;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    if (column.id) {
      tableMeta?.updateData(row.index, column.id, value);
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const ShowStatus = (val: string) => {
    switch (val) {
      case 'Complicated':
        return <Chip color="error" label="Complicated" size="small" variant="light" />;
      case 'Relationship':
        return <Chip color="success" label="Relationship" size="small" variant="light" />;
      case 'Single':
      default:
        return <Chip color="info" label="Single" size="small" variant="light" />;
    }
  };

  // Validation schema
  let userInfoSchema = yup.object();
  switch (column.id) {
    case 'email':
      userInfoSchema = yup.object({ userInfo: yup.string().email('Enter valid email').required('Email is required') });
      break;
    case 'age':
      userInfoSchema = yup.object({
        userInfo: yup
          .number()
          .typeError('Age must be number')
          .required('Age is required')
          .min(18, 'You must be at least 18 years')
          .max(65, 'You must be at most 65 years')
      });
      break;
    case 'visits':
      userInfoSchema = yup.object({ userInfo: yup.number().typeError('Visits must be number').required('Visits are required') });
      break;
    default:
      userInfoSchema = yup.object({ userInfo: yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required') });
      break;
  }

  const isEditable = tableMeta?.selectedRow[row.id];

  let element: JSX.Element;

  const dataType = column.dataType ?? ''; // Default to empty string if undefined

  if (dataType === '') {
    element = <span>No Data Type</span>; // Custom fallback
  } else {
    switch (dataType) {
      case 'text':
        element = isEditable ? (
          <Formik initialValues={{ userInfo: value }} enableReinitialize validationSchema={userInfoSchema} onSubmit={() => {}}>
            {({ values, handleChange, handleBlur, errors, touched }) => (
              <Form>
                <TextField
                  value={values.userInfo}
                  id={`${row.index}-${column.id}`}
                  name="userInfo"
                  onChange={(e) => {
                    handleChange(e);
                    onChange(e);
                  }}
                  onBlur={(e) => {
                    handleBlur(e);
                    onBlur();
                  }}
                  error={touched.userInfo && Boolean(errors.userInfo)}
                  helperText={touched.userInfo && errors.userInfo ? (errors.userInfo as string) : ''}
                  sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 } }}
                />
              </Form>
            )}
          </Formik>
        ) : (
          <>{value}</>
        );
        break;

      case 'select':
        element = isEditable ? (
          <Select
            labelId="editable-select-label"
            sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 } }}
            id="editable-select"
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
          >
            <MenuItem value="Complicated">
              <Chip color="error" label="Complicated" size="small" variant="light" />
            </MenuItem>
            <MenuItem value="Relationship">
              <Chip color="success" label="Relationship" size="small" variant="light" />
            </MenuItem>
            <MenuItem value="Single">
              <Chip color="info" label="Single" size="small" variant="light" />
            </MenuItem>
          </Select>
        ) : (
          ShowStatus(value as string)
        );
        break;

      case 'progress':
        element = isEditable ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: 1, minWidth: 120 }}>
            <Slider
              value={value as number}
              min={0}
              max={100}
              step={1}
              onBlur={onBlur}
              onChange={(_, newValue) => setValue(newValue)}
              valueLabelDisplay="auto"
              aria-labelledby="non-linear-slider"
            />
          </Stack>
        ) : (
          <LinearWithLabel value={value as number} sx={{ minWidth: 75 }} />
        );
        break;

      default:
        element = <span>No Data Type</span>; // Custom fallback
        break;
    }
  }

  return element;
}
