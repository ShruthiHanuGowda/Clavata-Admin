import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import { Context } from 'App';
import { LIST_NON_MINTED_NFTS } from 'graphql/queries';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';
import ReactTableWrapper from 'components/ReactTableWrapper';

interface AppContext {
  searchTerm: string;
  // add any other context values if present
}

interface NonMintedNft {
  itemId: string;
  assetId: string;
  commissioningDate: string;
  country: string;
  startDate: string;
  endDate: string;
  facilityName: string;
  volume: number;
  year: number;
}
interface ListNonMintedNftsData {
  listNonMintedNfts: {
    items: NonMintedNft[];
    nextToken: string | null;
  };
}

interface ListNonMintedNftsVars {
  limit: number;
  nextToken?: string | null;
  filter?: {
    or: Array<
      | { assetId?: { contains: string } }
      | { country?: { contains: string } }
      | { facilityName?: { contains: string } }
      | { type?: { contains: string } }
      | { commissioningDate?: { contains: string } }
      | { startDate?: { contains: string } }
      | { endDate?: { contains: string } }
      | { createdAt?: { contains: string } }
      | { itemId?: { contains: string } }
    >;
  };
}

export default function NonMintedNftsTable() {
  const { logout } = useAuth();
  const context = useContext(Context) as AppContext;
  const { searchTerm } = context;
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<NonMintedNft[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<ListNonMintedNftsData, ListNonMintedNftsVars>(LIST_NON_MINTED_NFTS, {
    variables: {
      limit: pageSize,
      filter: {
        or: [
          { assetId: { contains: searchTerm } },
          { country: { contains: searchTerm } },
          { facilityName: { contains: searchTerm } },
          { type: { contains: searchTerm } },
          { commissioningDate: { contains: searchTerm } },
          { startDate: { contains: searchTerm } },
          { endDate: { contains: searchTerm } },
          { createdAt: { contains: searchTerm } },
          { itemId: { contains: searchTerm } }
        ]
      }
    }
  });

  if (error) {
    console.error('Error fetching Non-Minted NFTs:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  useEffect(() => {
    if (queryData) {
      setData(queryData.listNonMintedNfts.items);
      setNextToken(queryData.listNonMintedNfts.nextToken);
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

      const variables: { limit: number; nextToken?: string } = { limit: pageSize };
      if (token) variables.nextToken = token;

      fetchMore({ variables }).then(
        (fetchMoreResult: { data: { listNonMintedNfts: { items: NonMintedNft[]; nextToken: string | null } } }) => {
          const fetchedData = fetchMoreResult.data;
          setData(fetchedData.listNonMintedNfts.items);
          setNextToken(fetchedData.listNonMintedNfts.nextToken);

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
        }
      );
    },
    [nextToken, previousTokens, pageSize, fetchMore, currentPageIndex]
  );

  useEffect(() => {
    handlePagination('first');
  }, [pageSize, handlePagination]);

  const columns = useMemo<ColumnDef<NonMintedNft>[]>(
    () => [
      { header: 'Item ID', accessorKey: 'itemId' },
      { header: 'Asset ID', accessorKey: 'assetId' },
      { header: 'Commissioning Date', accessorKey: 'commissioningDate' },
      { header: 'Country', accessorKey: 'country' },
      { header: 'Start Date', accessorKey: 'startDate', cell: (cell) => formatDate(cell.getValue<string>()) },
      { header: 'End Date', accessorKey: 'endDate', cell: (cell) => formatDate(cell.getValue<string>()) },
      { header: 'Facility Name', accessorKey: 'facilityName' },
      { header: 'Volume', accessorKey: 'volume' },
      { header: 'Year', accessorKey: 'year' }
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTableWrapper
          {...{
            data,
            columns,
            nextToken,
            previousTokens,
            currentPageIndex,
            pageSize,
            setPageSize,
            handlePagination,
            isLoading: loading,
            topPagination: true,
            csvFilename: 'non-minted-nfts.csv'
          }}
        />
      </Grid>
    </Grid>
  );
}
