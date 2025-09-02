import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { LIST_TRANSACTION_HISTORY } from '../../../graphql/queries';
import ReactTableWrapper from 'components/ReactTableWrapper';

// types
import { ListTransactionHistoryResponse, TransactionHistoryItem } from 'types/table';

//query
import { Context } from 'App';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

export default function TransactionTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context must be used within a Context.Provider');
  }
  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<TransactionHistoryItem[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<ListTransactionHistoryResponse>(LIST_TRANSACTION_HISTORY, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { transactionId: { contains: searchTerm } },
          { amount: { contains: searchTerm } },
          { destinationAccount: { contains: searchTerm } },
          { sourceAccount: { contains: searchTerm } },
          { status: { contains: searchTerm } },
          { timestamp: { contains: searchTerm } },
          { transactionType: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }
  const transformedResponseData = (resData: ListTransactionHistoryResponse): TransactionHistoryItem[] => {
    return (
      resData.listTransactionsHistories?.items?.map((item, index) => ({
        id: item.id || index.toString(),
        amount: item.amount,
        destinationAccount: item.destinationAccount,
        sourceAccount: item.sourceAccount,
        status: item.status,
        timestamp: item.timestamp,
        transactionId: item.transactionId,
        transactionType: item.transactionType
      })) ?? []
    );
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData?.listTransactionsHistories?.nextToken ?? null);
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
      }).then((fetchMoreResult: { data: ListTransactionHistoryResponse }) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchedData.listTransactionsHistories?.nextToken ?? null);

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

  const columns = useMemo<ColumnDef<TransactionHistoryItem>[]>(
    () => [
      {
        header: 'Amount',
        accessorKey: 'amount'
      },
      {
        header: 'Destination Account',
        accessorKey: 'destinationAccount'
      },
      {
        header: 'Source Account',
        accessorKey: 'sourceAccount'
      },
      {
        header: 'Status',
        accessorKey: 'status'
      },
      {
        header: 'Timestamp',
        accessorKey: 'timestamp',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'Transaction Id',
        accessorKey: 'transactionId'
      },
      {
        header: 'Transaction Type',
        accessorKey: 'transactionType'
      }
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
