import { useEffect, useState } from 'react';
import MainCard from '../../components/MainCard';
import { TablePagination } from '../../components/third-party/react-table';
import ScrollX from '../../components/ScrollX';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Divider from '@mui/material/Divider';
import { LabelKeyObject } from 'react-csv/lib/core';
import { useMemo } from 'react';
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';

import { ApolloClient, InMemoryCache, HttpLink, useQuery } from '@apollo/client';
import { LIST_NFT_COLLECTIONS } from 'graphql/queries'; // Assuming your query is in this file

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_NFT_COLLECTIONS_URL,
    headers: {
      'x-api-key': import.meta.env.VITE_APP_AWS_APP_SYNC_GRAPHQL_NFT_COLLECTIONS_API_KEY
    }
  }),
  cache: new InMemoryCache()
});

export default function NftCollections() {
  const [data, setData] = useState([]);
  const { data: listNftCollections, error } = useQuery(LIST_NFT_COLLECTIONS, {
    client,
    notifyOnNetworkStatusChange: true
  });

  console.log(error);

  useEffect(() => {
    if (listNftCollections?.data?.listNftCollections?.items) {
      setData(listNftCollections?.data.listNftCollections.items);
    }
  }, [data]);

  const columns: any = useMemo(
    () => [
      {
        header: 'Collection Name',
        cell: ({ row }: any) => row.original.collectionName || ''
      },
      {
        header: 'Contract Address',
        cell: ({ row }: any) => row.original.contractAddress || ''
      },
      {
        header: 'Symbol',
        cell: ({ row }: any) => row.original.symbol || ''
      },
      {
        header: 'Year',
        cell: ({ row }: any) => row.original.year || ''
      },
      {
        header: 'Country',
        cell: ({ row }: any) => row.original.country || ''
      },
      {
        header: 'Owner Address',
        cell: ({ row }: any) => row.original.ownerAddress || ''
      },
      {
        header: 'Type',
        cell: ({ row }: any) => row.original.type || ''
      },
      {
        header: 'Created At',
        cell: ({ row }: any) => row.original.createdAt || ''
      },
      {
        header: 'Updated At',
        cell: ({ row }: any) => row.original.updatedAt || ''
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
  table.getAllColumns().map((columns: any) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      key: columns.columnDef.accessorKey
    })
  );

  return (
    <MainCard title="NFT Collections" content={false}>
      <ScrollX>
        <Stack>
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header: any) => (
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
