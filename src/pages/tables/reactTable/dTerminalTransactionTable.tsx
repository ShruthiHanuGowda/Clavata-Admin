import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Grid from '@mui/material/Grid';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LIST_DTERMINAL_TRANSACTION_HISTORY } from '../../../graphql/queries';
import useDebounce from 'hooks/useDebounce';

// types
import { DTerminalTransactionItem, ListDTerminalTransactionHistoryResponse } from 'types/table';
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import useAuth from 'hooks/useAuth';
import ReactTableWrapper from 'components/ReactTableWrapper';

interface QueryVariables {
  limit: number;
  nextToken?: string | null;
  filter?: {
    or: {
      transactionHash?: { contains: string };
      method?: { contains: string };
      coin?: { contains: string };
      age?: { contains: string };
      from?: { contains: string };
      to?: { contains: string };
    }[];
  };
}

export default function DTerminalTransactionTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) throw new Error('Context must be used within a Context.Provider');

  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchTerm, 1000);

  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    refetch
  } = useQuery<ListDTerminalTransactionHistoryResponse, QueryVariables>(LIST_DTERMINAL_TRANSACTION_HISTORY, {
    variables: {
      limit: pageSize,
      nextToken: null,
      filter: searchTerm
        ? {
            or: [
              { transactionHash: { contains: searchTerm } },
              { method: { contains: searchTerm } },
              { coin: { contains: searchTerm } },
              { age: { contains: searchTerm } },
              { from: { contains: searchTerm } },
              { to: { contains: searchTerm } }
            ]
          }
        : undefined
    },
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (error) {
      console.error('GraphQL Error:', error);
      if (error.message.includes('code 401')) logout();
    }
  }, [error, logout]);

  const transformedData = useMemo<DTerminalTransactionItem[]>(() => {
    return (
      queryData?.listDterminalTransactionHistories?.items?.map((item) => ({
        transactionHash: item.transactionHash,
        method: item.method,
        age: item.age,
        from: item.from,
        to: item.to,
        amount: item.amount,
        txnFee: item.txnFee
      })) ?? []
    );
  }, [queryData]);

  useEffect(() => {
    setNextToken(queryData?.listDterminalTransactionHistories?.nextToken ?? null);
  }, [queryData]);

  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      let token: string | null = null;

      if (direction === 'next') token = nextToken;
      else if (direction === 'previous') token = previousTokens[previousTokens.length - 1] || null;
      else if (direction === 'first') {
        token = null;
        setPreviousTokens([]);
        setCurrentPageIndex(1);
      }

      try {
        const { data: newData } = await fetchMore({
          variables: {
            limit: pageSize,
            nextToken: token,
            filter: searchTerm
              ? {
                  or: [
                    { transactionHash: { contains: searchTerm } },
                    { method: { contains: searchTerm } },
                    { coin: { contains: searchTerm } },
                    { age: { contains: searchTerm } },
                    { from: { contains: searchTerm } },
                    { to: { contains: searchTerm } }
                  ]
                }
              : undefined
          }
        });

        const newNextToken = newData?.listDterminalTransactionHistories?.nextToken ?? null;
        setNextToken(newNextToken);

        if (direction === 'next') {
          setPreviousTokens((prev) => [...prev, nextToken!]);
          setCurrentPageIndex((prev) => prev + 1);
        } else if (direction === 'previous') {
          setPreviousTokens((prev) => prev.slice(0, -1));
          setCurrentPageIndex((prev) => Math.max(prev - 1, 1));
        } else if (direction === 'first') {
          setCurrentPageIndex(1);
        }
      } catch (err) {
        console.error('Pagination error:', err);
      }
    },
    [nextToken, previousTokens, fetchMore, pageSize, searchTerm]
  );

  useEffect(() => {
    refetch({
      limit: pageSize,
      nextToken: null,
      filter: debouncedSearch
        ? {
            or: [
              { transactionHash: { contains: debouncedSearch } },
              { method: { contains: debouncedSearch } },
              { coin: { contains: debouncedSearch } },
              { age: { contains: debouncedSearch } },
              { from: { contains: debouncedSearch } },
              { to: { contains: debouncedSearch } }
            ]
          }
        : undefined
    });
    setCurrentPageIndex(1);
    setPreviousTokens([]);
  }, [debouncedSearch, pageSize, refetch]);

  const columns = useMemo<ColumnDef<DTerminalTransactionItem>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'transactionHash',
        cell: (cell) => {
          const hash = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(hash, 'transaction')} target="_blank" rel="noopener noreferrer">
              {shortenAddress(hash)}
            </Link>
          );
        }
      },
      {
        header: 'From',
        accessorKey: 'from',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank" rel="noopener noreferrer">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      {
        header: 'To',
        accessorKey: 'to',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank" rel="noopener noreferrer">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      {
        header: 'Method',
        accessorKey: 'method'
      },
      {
        header: 'Age',
        accessorKey: 'age'
      },
      {
        header: 'Amount',
        accessorKey: 'amount'
      },
      {
        header: 'Transaction Fee',
        accessorKey: 'txnFee'
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTableWrapper
          data={transformedData}
          columns={columns}
          currentPageIndex={currentPageIndex}
          handlePagination={handlePagination}
          nextToken={nextToken}
          previousTokens={previousTokens}
          pageSize={pageSize}
          setPageSize={setPageSize}
          isLoading={loading}
        />
      </Grid>
    </Grid>
  );
}
