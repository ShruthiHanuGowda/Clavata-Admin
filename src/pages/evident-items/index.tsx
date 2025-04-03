import { useEffect, useState } from 'react';
import MainCard from '../../components/MainCard';
import { TablePagination } from '../../components/third-party/react-table';
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

import { ApolloClient, InMemoryCache, HttpLink, useQuery } from '@apollo/client';
import { LIST_EVIDENT_ITEMS } from 'graphql/queries';

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_EVIDENT_ITEMS_URL,
    headers: {
      'x-api-key': import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_EVIDENT_ITEMS_API_KEY
    }
  }),
  cache: new InMemoryCache()
});

export default function EvidentItems() {
  const [data, setData] = useState([]);
  const listEvidentResponse = useQuery(LIST_EVIDENT_ITEMS, {
    client,
    notifyOnNetworkStatusChange: true
  });

  useEffect(() => {
    if (listEvidentResponse.data?.listEvidentItems?.items) setData(listEvidentResponse.data.listEvidentItems.items);
  }, [listEvidentResponse]);

  const columns: any = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: 'Id',
        accessorKey: 'uid'
      },
      {
        header: 'AssetId',
        accessorKey: 'assetId'
      },
      {
        header: 'Available Volume',
        accessorKey: 'availableVolume'
      },
      {
        header: 'Volume',
        accessorKey: 'volume'
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
    <MainCard title="Evident Items" content={false}>
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
