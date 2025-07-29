import { useEffect, useState } from 'react';
import MainCard from '../../components/MainCard';
import { TablePagination } from '../../components/third-party/react-table';
import ScrollX from '../../components/ScrollX';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, HeaderGroup, useReactTable } from '@tanstack/react-table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useMemo } from 'react';

import { useQuery } from '@apollo/client';
import { LIST_EVIDENT_ITEMS } from 'graphql/queries';
import { formatDate } from 'utils/date';
import { FormControl, InputAdornment, OutlinedInput } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';

export default function EvidentItems() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const listEvidentResponse = useQuery(LIST_EVIDENT_ITEMS, {
    notifyOnNetworkStatusChange: true
  });

  useEffect(() => {
    if (listEvidentResponse.data?.listEvidentItems?.items) setData(listEvidentResponse.data.listEvidentItems.items);
  }, [listEvidentResponse]);

  useEffect(() => {
    data.forEach((d: any) => {
      console.log(JSON.parse(d.asset)?.issue?.deviceDetails?.deviceType?.deviceGroup);
    });
  }, [data]);

  const filteredData = useMemo(() => {
    if (!search) return data;

    return data.filter((item: any) => {
      const asset = item.asset ? JSON.parse(item.asset) : {};
      const country = asset?.country?.name || '';
      const deviceName = asset?.issue?.deviceDetails?.name || '';
      const deviceGroup = asset?.issue?.deviceDetails?.deviceType?.deviceGroup || '';

      const searchLower = search.toLowerCase();

      return (
        country.toLowerCase().includes(searchLower) ||
        deviceName.toLowerCase().includes(searchLower) ||
        deviceGroup.toLowerCase().includes(searchLower)
      );
    });
  }, [search, data]);

  const columns: any = useMemo<ColumnDef<any>[]>(() => [
    {
      header: 'Energy Type',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.deviceType?.deviceGroup : '',
      cell: ({ getValue }) => getValue() || ''
    },
    {
      header: 'Country',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.country?.name : '',
      cell: ({ getValue }) => getValue() || ''
    },
    {
      header: 'Facility Name',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.name : '',
      cell: ({ getValue }) => getValue() || ''
    },
    {
      header: 'Volume (MWh)',
      accessorKey: 'volume',
      cell: ({ getValue }: any) => parseFloat(getValue() || '0')
    },
    {
      header: 'Production Start Date',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.startDate : '',
      cell: ({ getValue }) => getValue() || ''
    },
    {
      header: 'Production End Date',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.endDate : '',
      cell: ({ getValue }: any) => formatDate(getValue())
    },
    {
      header: 'Facility Commissioning Date',
      accessorFn: (row: any) =>
        row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.commissioningDate : '',
      cell: ({ getValue }: any) => formatDate(getValue())
    }
  ], []);


  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    <MainCard title="Evident Items" content={false}>
      <ScrollX>
        <Stack>
          <Box sx={{ width: '100%', ml: { xs: 0, md: 1 }, mb: 2 }}>
            <FormControl sx={{ width: { xs: '100%', md: 224 } }}>
              <OutlinedInput
                size="small"
                id="evident-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: -0.5 }}>
                    <SearchOutlined />
                  </InputAdornment>
                }
                aria-describedby="evident-search-text"
                inputProps={{
                  'aria-label': 'search'
                }}
                placeholder="Search..."
              />
            </FormControl>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<never>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {/* {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())} */}
                        <span
                          onClick={header.column.getToggleSortingHandler()} // Handle sorting when clicked
                          style={{ cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽'
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
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
