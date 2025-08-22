import { useCallback, useEffect, useState } from 'react';
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
import ReactTableWrapper from 'components/ReactTableWrapper';

export default function Registries() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // pagination states (same as PaginationUserTable)
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetch('https://hd1l22xs32.execute-api.me-central-1.amazonaws.com/default/adminRegistriesList')
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        setData([]);
        setIsLoading(false);
      });
  }, []);

  const columns = useMemo<ColumnDef<any>[]>(
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
        accessorKey: 'created_at',
        cell: (cell) => formatDate(cell.getValue() as string)
      }
    ],
    []
  );

  // dummy pagination handler (since API doesn’t provide tokens)
  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      // for now just reset page index since API gives full data
      if (direction === 'first') setCurrentPageIndex(1);
      if (direction === 'next') setCurrentPageIndex((p) => p + 1);
      if (direction === 'previous') setCurrentPageIndex((p) => Math.max(1, p - 1));
    },
    []
  );

  return (
    <ReactTableWrapper
      data={data}
      columns={columns}
      currentPageIndex={currentPageIndex}
      handlePagination={handlePagination}
      nextToken={nextToken}
      previousTokens={previousTokens}
      pageSize={pageSize}
      setPageSize={setPageSize}
      isLoading={isLoading}
      csvFilename="registries.csv"
      showSearch={true} // disable search if not needed
    />
  );
}
