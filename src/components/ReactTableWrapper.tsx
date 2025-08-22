import React, { useContext } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, ColumnDef, flexRender, HeaderGroup, Row } from '@tanstack/react-table';

import { Box, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack, CardContent } from '@mui/material';

import { LabelKeyObject } from 'react-csv/lib/core';
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { CSVExport, TablePaginationToken } from 'components/third-party/reactTable';
import { Context } from 'App';

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  currentPageIndex: number;
  handlePagination: (direction: 'next' | 'previous' | 'first') => Promise<void>;
  nextToken: string | null;
  previousTokens: string[];
  pageSize: number;
  setPageSize: (size: number) => void;
  isLoading: boolean;
  topPagination?: boolean;
  showSearch?: boolean;
  csvFilename?: string;
  expandedRowId?: string | null;
  renderExpandedRow?: (row: Row<T>) => React.ReactNode;
};

function ReactTableWrapper<T>({
  data,
  columns,
  currentPageIndex,
  handlePagination,
  nextToken,
  previousTokens,
  pageSize,
  setPageSize,
  isLoading,
  topPagination = false,
  showSearch = true,
  csvFilename = 'table-export.csv',
  expandedRowId,
  renderExpandedRow
}: Props<T>) {
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context must be used within a provider');
  }

  const { setSearchTerm } = context;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const headers: LabelKeyObject[] = table.getAllColumns().map((col) => ({
    label: typeof col.columnDef.header === 'string' ? col.columnDef.header : '#',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    key: col.columnDef.accessorKey ?? ''
  }));

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <MainCard title="" content={false} secondary={<CSVExport {...{ data, headers, filename: csvFilename }} />}>
      <CardContent sx={{ p: 2 }}>
        {showSearch && (
          <Box sx={{ mb: 2 }}>
            <Search onSearch={handleSearch} />
          </Box>
        )}

        <ScrollX>
          <Stack>
            {topPagination && (
              <Box sx={{ p: 2 }}>
                <TablePaginationToken
                  {...{ currentPageIndex, handlePagination, nextToken, previousTokens, pageSize, setPageSize, isLoading }}
                />
              </Box>
            )}

            <TableContainer>
              {/* Wrapper */}
              <Table>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup: HeaderGroup<T>) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell key={header.id} {...header.column.columnDef.meta}>
                          <span onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? ' 🔼' : header.column.getIsSorted() === 'desc' ? ' 🔽' : ''}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableRow>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>

                        {expandedRowId === row.id && renderExpandedRow && (
                          <TableRow>
                            <TableCell colSpan={row.getVisibleCells().length}>{renderExpandedRow(row)}</TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            {!topPagination && (
              <Box sx={{ p: 2 }}>
                <TablePaginationToken
                  {...{ currentPageIndex, handlePagination, nextToken, previousTokens, pageSize, setPageSize, isLoading }}
                />
              </Box>
            )}
          </Stack>
        </ScrollX>
      </CardContent>
    </MainCard>
  );
}

export default ReactTableWrapper;
