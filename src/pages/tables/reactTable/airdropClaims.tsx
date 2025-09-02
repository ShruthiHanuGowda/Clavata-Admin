import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';

// table
import { ColumnDef } from '@tanstack/react-table';

// apollo
import { useQuery } from '@apollo/client';
import { LIST_AIRDROP_COLLECTIONS } from '../../../graphql/queries';

// types
import { ListAirdropClaimsResponse, AirdropClaim } from 'types/table'; // Make sure types match schema

// context and hooks
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import useAuth from 'hooks/useAuth';

// components
import ReactTableWrapper from 'components/ReactTableWrapper';

// =============================
// GraphQL Query Variable Types
// =============================
interface QueryVariables {
  limit: number;
  nextToken?: string | null;
  filter?: {
    or: {
      walletAddress?: { contains: string };
      amount?: { contains: string };
      claimedAt?: { contains: string };
      txHash?: { contains: string };
    }[];
  };
}

// =============================
// Table Data Type
// =============================
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
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // GraphQL Query
  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    refetch
  } = useQuery<ListAirdropClaimsResponse, QueryVariables>(LIST_AIRDROP_COLLECTIONS, {
    variables: {
      limit: pageSize,
      nextToken: null,
      filter: searchTerm
        ? {
            or: [
              { walletAddress: { contains: searchTerm } },
              { amount: { contains: searchTerm } },
              { claimedAt: { contains: searchTerm } },
              { txHash: { contains: searchTerm } }
            ]
          }
        : undefined
    },
    fetchPolicy: 'network-only'
  });

  // Error handling
  useEffect(() => {
    if (error) {
      console.error('GraphQL Error:', error);
      if (error.message.includes('code 401')) {
        logout();
      }
    }
  }, [error, logout]);

  // Transform GraphQL data to table format
  const transformedData: TableDataProps[] = useMemo(() => {
    return (
      queryData?.listAirdropClaims?.items?.map((item: AirdropClaim, index) => ({
        id: item.id || index,
        txHash: item.txHash,
        walletAddress: item.walletAddress,
        claimedAt: item.claimedAt,
        amount: item.amount
      })) ?? []
    );
  }, [queryData]);

  useEffect(() => {
    setNextToken(queryData?.listAirdropClaims?.nextToken || null);
  }, [queryData]);

  // Pagination Handler
  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      let token: string | null = null;

      switch (direction) {
        case 'next':
          token = nextToken;
          break;
        case 'previous':
          token = previousTokens[previousTokens.length - 1] || null;
          break;
        case 'first':
          token = null;
          setPreviousTokens([]);
          setCurrentPageIndex(1);
          break;
        default:
          break;
      }

      try {
        const result = await fetchMore({
          variables: {
            limit: pageSize,
            nextToken: token,
            filter: searchTerm
              ? {
                  or: [
                    { walletAddress: { contains: searchTerm } },
                    { amount: { contains: searchTerm } },
                    { claimedAt: { contains: searchTerm } },
                    { txHash: { contains: searchTerm } }
                  ]
                }
              : undefined
          }
        });

        const fetchedData = result.data;

        if (direction === 'next') {
          setPreviousTokens((prev) => [...prev, nextToken!]);
          setCurrentPageIndex((prev) => prev + 1);
        } else if (direction === 'previous') {
          setPreviousTokens((prev) => prev.slice(0, prev.length - 1));
          setCurrentPageIndex((prev) => Math.max(prev - 1, 1));
        } else if (direction === 'first') {
          setPreviousTokens([]);
          setCurrentPageIndex(1);
        }

        setNextToken(fetchedData?.listAirdropClaims?.nextToken || null);
      } catch (err) {
        console.error('Pagination error:', err);
      }
    },
    [fetchMore, nextToken, previousTokens, pageSize, searchTerm]
  );

  // Refetch on search term or page size change
  useEffect(() => {
    refetch({
      limit: pageSize,
      nextToken: null,
      filter: searchTerm
        ? {
            or: [
              { walletAddress: { contains: searchTerm } },
              { amount: { contains: searchTerm } },
              { claimedAt: { contains: searchTerm } },
              { txHash: { contains: searchTerm } }
            ]
          }
        : undefined
    });
    setCurrentPageIndex(1);
    setPreviousTokens([]);
  }, [searchTerm, pageSize, refetch]);

  // Table columns
  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Transaction Hash',
        accessorKey: 'txHash',
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
        header: 'Wallet Address',
        accessorKey: 'walletAddress',
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
