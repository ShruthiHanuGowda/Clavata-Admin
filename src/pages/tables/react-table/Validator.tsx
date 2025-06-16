import { useContext, useMemo } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Stack from '@mui/material/Stack';
import Search from '../../../../../admin-panel-fe/src/layout/Dashboard/Header/HeaderContent/Search';
// third-party
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  HeaderGroup,
  flexRender,
  getSortedRowModel
} from '@tanstack/react-table';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePagination } from 'components/third-party/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

//query
import { LIST_BENEFICIARIES } from '../../../graphql/queries';
import { ApolloClient, InMemoryCache, HttpLink, useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Context } from 'App';
import { Link } from 'react-router-dom';
import { getBlockExploreLink } from '../../../utils/explorer';
import { shortenAddress } from '../../../utils/shortenAddress';

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_APP_BENEFICIARY_GRAPHQL_URL,
    headers: {
      'x-api-key': import.meta.env.VITE_APP_BENEFICIARY_GRAPHQL_API_KEY
    }
  }),
  cache: new InMemoryCache()
});

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    getSortedRowModel: getSortedRowModel()
  });

  let headers: LabelKeyObject[] = [];
  table.getAllColumns().map((columns) =>
    headers.push({
      label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
      // @ts-ignore
      key: columns.columnDef.accessorKey
    })
  );

  const handleSearch = (term: any) => {
    setSearchTerm(term);
  };

  return (
    <></>
    // <>

    //   <MainCard
    //     title={' '}
    //     content={false}
    //     secondary={<CSVExport {...{ data, headers, filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}
    //   >
    //     <CardContent sx={{ p: 2 }}>
    //       {/* Add Search component below the title */}
    //       <Box sx={{ mb: 2 }}>
    //         <Search onSearch={handleSearch} />
    //       </Box>
    //       <ScrollX>
    //         <Stack>
    //           {top && (
    //             <Box sx={{ p: 2 }}>
    //               <TablePagination
    //                 {...{
    //                   setPageSize: table.setPageSize,
    //                   setPageIndex: table.setPageIndex,
    //                   getState: table.getState,
    //                   getPageCount: table.getPageCount
    //                 }}
    //               />
    //             </Box>
    //           )}

    //           <TableContainer>
    //             <Table>
    //               <TableHead>
    //                 {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
    //                   <TableRow key={headerGroup.id}>
    //                     {headerGroup.headers.map((header) => (
    //                       <TableCell key={header.id} {...header.column.columnDef.meta}>
    //                         <span
    //                           onClick={header.column.getToggleSortingHandler()} // Handle sorting when clicked
    //                           style={{ cursor: 'pointer', fontWeight: 'bold' }}
    //                         >
    //                           {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
    //                           {{
    //                             asc: ' 🔼',
    //                             desc: ' 🔽'
    //                           }[header.column.getIsSorted() as string] ?? null}
    //                         </span>
    //                       </TableCell>
    //                     ))}
    //                   </TableRow>
    //                 ))}
    //               </TableHead>
    //               <TableBody>
    //                 {table.getRowModel().rows?.length > 0 ? (
    //                   table.getRowModel().rows.map((row) => (
    //                     <TableRow key={row.id}>
    //                       {row.getVisibleCells().map((cell) => (
    //                         <TableCell key={cell.id} {...cell.column.columnDef.meta}>
    //                           {flexRender(cell.column.columnDef.cell, cell.getContext())}
    //                         </TableCell>
    //                       ))}
    //                     </TableRow>
    //                   ))
    //                 ) : (
    //                   <TableRow key={0}>No data found!</TableRow>
    //                 )}
    //               </TableBody>
    //             </Table>
    //           </TableContainer>

    //           {!top && (
    //             <>
    //               <Divider />
    //               <Box sx={{ p: 2 }}>
    //                 <TablePagination
    //                   {...{
    //                     setPageSize: table.setPageSize,
    //                     setPageIndex: table.setPageIndex,
    //                     getState: table.getState,
    //                     getPageCount: table.getPageCount
    //                   }}
    //                 />
    //               </Box>
    //             </>
    //           )}
    //         </Stack>
    //       </ScrollX>
    //     </CardContent>
    //   </MainCard>

    // </>
  );
}

// ==============================|| REACT TABLE - PAGINATION ||============================== //

export default function transactionTable() {
  // const data: TableDataProps[] = makeData(100);
  const context = useContext(Context);
  const { searchTerm, setSearchTerm }: any = context;
  const { loading, error, data } = useQuery(LIST_BENEFICIARIES, {
    client,
    variables: { nextToken: null }
  });

  console.log('Query airdrop transaction Response:', { loading, error, data });

  if (error) {
    console.error('GraphQL Error:', error);
  }

  // Transform company data to fit column structure
  const transformedData =
    data?.listAddressBooks?.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      walletAddress: item.walletAddress,
      beneficiaryAddress: item.beneficiaryAddress,
      chain: item.chain
    })) || [];

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.walletAddress && item.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.beneficiaryAddress && item.beneficiaryAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.chain && item.chain.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transformedData]);

  console.log('new airdrop company data', data);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Wallet Address',
        accessorKey: 'walletAddress'
        // cell: (cell) => {
        //   const hash = cell.getValue() as string;
        //   return (
        //     <Link to={getBlockExploreLink(hash)} target="_blank">
        //       {shortenAddress(hash)}
        //     </Link>
        //   );
        // }
      },
      {
        header: 'Beneficiary Address',
        accessorKey: 'beneficiaryAddress'
        // cell: (cell) => {
        //   const hash = cell.getValue() as string;
        //   return (
        //     <Link to={getBlockExploreLink(hash)} target="_blank">
        //       {shortenAddress(hash)}
        //     </Link>
        //   );
        // }
      },
      {
        header: 'Chain',
        accessorKey: 'chain'
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* <ReactTable {...{ data: filteredData, columns }} /> */}
      </Grid>
    </Grid>
  );
}
