import { useEffect, useState } from 'react';
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

import ScrollX from '../../components/ScrollX';
import { TablePagination } from '../../components/third-party/reactTable';
import MainCard from '../../components/MainCard';
import { formatDate } from 'utils/date';

export default function Registries() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('https://hd1l22xs32.execute-api.me-central-1.amazonaws.com/default/adminRegistriesList')
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
      })
      .catch(() => setData([]));
  }, []);

  const columns: any = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'ID',
        accessorKey: 'ID'
      },
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Description',
        accessorKey: 'description'
      },
      {
        header: 'Created At',
        cell: ({ row }: any) => {
          return formatDate(row.original.created_at);
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
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard content={false}>
      <ScrollX>
        <Stack>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<never>) => (
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
