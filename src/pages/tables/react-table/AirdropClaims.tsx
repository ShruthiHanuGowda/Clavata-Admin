import { useContext, useMemo } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
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
import { useReactTable, getCoreRowModel, getPaginationRowModel, ColumnDef, HeaderGroup, flexRender, getSortedRowModel } from '@tanstack/react-table';

// project-import
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, TablePagination } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';
import { LabelKeyObject } from 'react-csv/lib/core';

//query
import { LIST_AIRDROP_COLLECTIONS } from '../../../graphql/queries';
import { ApolloClient, HttpLink, InMemoryCache, useQuery } from '@apollo/client';
import { CardContent } from '@mui/material';
import { Context } from 'App';

const API_Key5 = 'da2-i3cu5ertjbghzlwldf4mu2rsjq'; // API key for second URI
const uri5 = 'https://h4t7dkxxabb7hdciflifuq7y5y.appsync-api.me-central-1.amazonaws.com/graphql';

const client4 = new ApolloClient({
    link: new HttpLink({
        uri: uri5,
        headers: {
            'x-api-key': API_Key5
        }
    }),
    cache: new InMemoryCache()
});


// ==============================|| REACT TABLE ||============================== //

function ReactTable({ data, columns, top }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[]; top?: boolean }) {
    const context = useContext(Context);
    const { searchTerm, setSearchTerm }: any = context;
    console.log('company data', data);
    console.log('column', columns);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: true,
        getSortedRowModel: getSortedRowModel(),
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
        <>
            <MainCard
                title={' '}
                content={false}
                secondary={<CSVExport {...{ data, headers, filename: top ? 'pagination-top.csv' : 'pagination-bottom.csv' }} />}
            >
                <CardContent sx={{ p: 2 }}>
                    {/* Add Search component below the title */}
                    <Box sx={{ mb: 2 }}>
                        <Search onSearch={handleSearch} />
                    </Box>
                    <ScrollX>
                        <Stack>
                            {top && (
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
                            )}

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <TableCell key={header.id} {...header.column.columnDef.meta}>
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

                            {!top && (
                                <>
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
                                </>
                            )}
                        </Stack>
                    </ScrollX>
                </CardContent>
            </MainCard>
        </>
    );
}

// ==============================|| REACT TABLE - PAGINATION ||============================== //

export default function transactionTable() {
    // const data: TableDataProps[] = makeData(100);
    const context = useContext(Context);
    const { searchTerm, setSearchTerm }: any = context;
    const { loading, error, data, fetchMore } = useQuery(LIST_AIRDROP_COLLECTIONS, {
        client: client4,
        variables: { nextToken: null }
    });

    console.log('Query airdrop transaction Response:', { loading, error, data });

    if (error) {
        console.error('GraphQL Error:', error);
    }

    // Transform company data to fit column structure
    const transformedData =
        data?.listAirdropClaims?.items.map((item: any) => ({
            txHash: item.txHash,
            walletAddress: item.walletAddress,
            claimedAt: item.claimedAt,
            amount: item.amount,
        })) || [];

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm) return transformedData;
        return transformedData.filter((item: any) =>
            (item.txHash && item.txHash.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.walletAddress && item.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.claimedAt && item.claimedAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.amount && item.amount.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, transformedData]);

    console.log('new airdrop company data', data);

    const columns = useMemo<ColumnDef<TableDataProps>[]>(
        () => [
            {
                header: 'Transaction Hash',
                accessorKey: 'txHash'
            },
            {
                header: 'Wallet Address',
                accessorKey: 'walletAddress'
            },
            {
                header: 'Claimed At',
                accessorKey: 'claimedAt'
            },
            {
                header: 'Amount',
                accessorKey: 'amount'
            },
        ],
        []
    );

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <ReactTable {...{ data: filteredData, columns }} />
            </Grid>
        </Grid>
    );
}
