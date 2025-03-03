import MainCard from '../../components/MainCard';
import { CSVExport, TablePagination } from '../../components/third-party/react-table';
import ScrollX from '../../components/ScrollX';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useMemo } from 'react';
import { TableDataProps } from '../../types/table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditTwoTone from '@ant-design/icons/EditTwoTone';

const data = [
  { name: 'Dashboard View', description: 'Dashboard View' },
  { name: 'User View', description: 'User View' },
  { name: 'User List', description: 'User List' },
  { name: 'User Add', description: 'User Add' },
  { name: 'User Edit', description: 'User Edit' },
  { name: 'User Delete', description: 'User Delete' }
];

export default function Permissions() {
  const columns: any = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Description',
        accessorKey: 'description'
      },
      {
        header: 'Actions',
        id: 'edit',
        cell: () => {
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Edit">
                <IconButton color="primary" sx={{ '&::after': { content: 'none' } }}>
                  <EditTwoTone />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton color="error" name="cancel">
                  <CloseOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
        meta: {
          className: 'cell-center'
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  let headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard title="Permissions" content={false} secondary={<Button>Add New Permission</Button>}>
      <ScrollX>
        <Stack>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              {...{
                setPageSize: table.setPageSize,
                setPageIndex: table.setPageIndex,
                getState: table.getState,
                getPageCount: table.getPageCount
              }}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}
