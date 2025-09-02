import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Context } from 'App';
import { LIST_TRANSACTION_HISTORY_MOBILE } from 'graphql/queries'; // Define the query for transaction history
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';
import ReactTableWrapper from 'components/ReactTableWrapper';

type TransactionHistory = {
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  coinCode: string;
  method: string;
  transactionStatus: string;
  txnFee: string;
  createdAt: string;
};

type TransactionHistoryResponse = {
  listTransactionHistoryMobiles: {
    items: TransactionHistory[];
    nextToken: string | null;
  };
};

export default function MobileTransactionHistory() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context is missing. Did you forget to wrap your app in <Context.Provider>?');
  }
  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<TransactionHistory[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<TransactionHistoryResponse>(LIST_TRANSACTION_HISTORY_MOBILE, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { from: { contains: searchTerm } },
          { to: { contains: searchTerm } },
          { method: { contains: searchTerm } },
          { coinCode: { contains: searchTerm } },
          { transactionStatus: { contains: searchTerm } },
          { transactionHash: { contains: searchTerm } },
          { createdAt: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('Error fetching mobile transaction history:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  useEffect(() => {
    if (queryData) {
      setData(queryData.listTransactionHistoryMobiles.items);
      setNextToken(queryData.listTransactionHistoryMobiles.nextToken);
    }
  }, [queryData]);

  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      let token = direction === 'next' ? nextToken : previousTokens[previousTokens.length - 1];

      if (!token) token = null;
      if (nextToken === null) {
        token = previousTokens[previousTokens.length - 2];
      }
      switch (direction) {
        case 'first':
          token = null;
          setPreviousTokens([]);
          break;
        case 'previous':
          if (currentPageIndex === 2) {
            token = null;
          }
          break;
        case 'next':
          break;
        default:
          break;
      }

      const variables: { limit: number; nextToken?: string } = {
        limit: pageSize
      };
      if (token) {
        variables.nextToken = token;
      }
      fetchMore({
        variables
      }).then((fetchMoreResult) => {
        const fetchedData = fetchMoreResult.data as TransactionHistoryResponse;

        setData(fetchedData.listTransactionHistoryMobiles.items);
        setNextToken(fetchedData.listTransactionHistoryMobiles.nextToken);

        if (direction === 'next') {
          setPreviousTokens((prev) => [...prev, nextToken!]);
          setCurrentPageIndex((prev) => prev + 1);
        } else if (direction === 'previous') {
          setCurrentPageIndex((prev) => prev - 1);
          if (nextToken === null) {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 2));
          } else {
            setPreviousTokens((prev) => prev.slice(0, prev.length - 1));
          }
        } else {
          setCurrentPageIndex(1);
        }
      });
    },
    [nextToken, previousTokens, pageSize, fetchMore, currentPageIndex]
  );

  useEffect(() => {
    handlePagination('first');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const columns = useMemo<ColumnDef<TransactionHistory>[]>(
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
      { header: 'Amount', accessorKey: 'amount' },
      { header: 'Coin Code', accessorKey: 'coinCode' },
      { header: 'Method', accessorKey: 'method' },
      { header: 'Status', accessorKey: 'transactionStatus' },
      { header: 'Transaction Fee', accessorKey: 'txnFee' },
      { header: 'Created At', accessorKey: 'createdAt', cell: (cell) => formatDate(cell.getValue() as string) }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTableWrapper
          data={data}
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
