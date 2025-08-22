import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LIST_DTERMINAL_TRANSACTION_HISTORY } from '../../../graphql/queries';

// types
import { DTerminalTransactionItem, ListDTerminalTransactionHistoryResponse } from 'types/table';

//query
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import useAuth from 'hooks/useAuth';

import ReactTableWrapper from 'components/ReactTableWrapper';

export default function DTerminalTransactionTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context must be used within a Context.Provider');
  }
  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<DTerminalTransactionItem[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_DTERMINAL_TRANSACTION_HISTORY, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { transactionHash: { contains: searchTerm } },
          { method: { contains: searchTerm } },
          { coin: { contains: searchTerm } },
          { age: { contains: searchTerm } },
          { from: { contains: searchTerm } },
          { to: { contains: searchTerm } }
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
  const transformedResponseData = (resData: ListDTerminalTransactionHistoryResponse): DTerminalTransactionItem[] => {
    return (
      resData.listDterminalTransactionHistories?.items?.map((item) => ({
        transactionHash: item.transactionHash,
        method: item.method,
        age: item.age,
        from: item.from,
        to: item.to,
        amount: item.amount,
        txnFee: item.txnFee
      })) ?? []
    );
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listDterminalTransactionHistories.nextToken);
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
      }).then((fetchMoreResult: { data: ListDTerminalTransactionHistoryResponse }) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchedData?.listDterminalTransactionHistories?.nextToken ?? null);

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

  const columns = useMemo<ColumnDef<DTerminalTransactionItem>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'transactionHash',
        cell: (cell) => {
          const hash = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(hash, 'transaction')} target="_blank">
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
            <Link to={getBlockExploreLink(address)} target="_blank">
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
            <Link to={getBlockExploreLink(address)} target="_blank">
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
