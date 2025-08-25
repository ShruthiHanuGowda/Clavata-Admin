import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LIST_AIRDROP_COLLECTIONS } from '../../../graphql/queries';

// types
import { ListAirdropClaimsResponse } from 'types/table';

//query
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import useAuth from 'hooks/useAuth';

import ReactTableWrapper from 'components/ReactTableWrapper';

type TableDataProps = {
  id: string | number;
  txHash: string;
  walletAddress: string;
  claimedAt: string;
  amount: string;
};

export default function TransactionTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context must be used within a Context.Provider');
  }
  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<TableDataProps[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery(LIST_AIRDROP_COLLECTIONS, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { walletAddress: { contains: searchTerm } },
          { amount: { contains: searchTerm } },
          { claimedAt: { contains: searchTerm } },
          { txHash: { contains: searchTerm } }
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

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: TableDataProps) =>
        (item.txHash && item.txHash.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.walletAddress && item.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.claimedAt && item.claimedAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.amount && item.amount.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: ListAirdropClaimsResponse) => {
    return resData.listAirdropClaims?.items.map((item, index) => ({
      id: item.id || index || '',
      txHash: item.txHash,
      walletAddress: item.walletAddress,
      claimedAt: item.claimedAt,
      amount: item.amount
    }));
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listAirdropClaims.nextToken);
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
      }).then((fetchMoreResult: { data: ListAirdropClaimsResponse }) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchedData.listAirdropClaims.nextToken);

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

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'txHash',
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
        header: 'Wallet Address',
        accessorKey: 'walletAddress',
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
        header: 'Claimed At',
        accessorKey: 'claimedAt'
      },
      {
        header: 'Amount',
        accessorKey: 'amount'
      }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTableWrapper
          data={filteredData}
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
