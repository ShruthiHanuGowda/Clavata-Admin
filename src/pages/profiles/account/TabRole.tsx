import { useMemo } from 'react';

import { LabelKeyObject } from 'react-csv/lib/core';

import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';

// material-ui
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import EditTwoTone from '@ant-design/icons/EditTwoTone';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import ScrollX from 'components/ScrollX';
import { TablePagination } from 'components/thirdParty/reactTable';

import { TableDataProps } from 'types/table';

const data: TableDataProps[] = [];

export default function TabRole() {
  const columns: ColumnDef<TableDataProps>[] = useMemo(
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

  const headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-expect-error accessorKey may not exist on all column types
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title="Roles" content={false} secondary={<Button>Add New Role</Button>}>
          <ScrollX>
            <Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup: HeaderGroup<TableDataProps>) => (
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
                    {table.getRowModel().rows.length === 0 && <TableCell colSpan={3}>No data</TableCell>}
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
      </Grid>
    </Grid>
  );
}
