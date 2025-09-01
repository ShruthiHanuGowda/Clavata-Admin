import { useCallback, useContext, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { Grid, Box, Divider, Card, CardContent, CardMedia, Typography, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from 'App';
import MainCard from 'components/MainCard';
import { CSVExport, TablePaginationToken } from 'components/third-party/reactTable';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_NFT_COLLECTIONS } from 'graphql/queries';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

interface AppContextType {
  searchTerm?: string;
  setSearchTerm: (term: string) => void;
}

interface NftCollection {
  contractAddress: string;
  collectionName: string;
  symbol: string;
  year: string;
  country: string;
  ownerAddress: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  collection_image?: string;
}
interface ListNftCollectionsData {
  listNftCollections: {
    items: NftCollection[];
    nextToken: string | null;
  };
}

interface ListNftCollectionsVars {
  limit: number;
  nextToken?: string | null;
  filter?: {
    or: Array<{
      contractAddress?: { contains: string };
      collectionName?: { contains: string };
      symbol?: { contains: string };
      year?: { contains: string };
      country?: { contains: string };
      ownerAddress?: { contains: string };
      type?: { contains: string };
      createdAt?: { contains: string };
      updatedAt?: { contains: string };
    }>;
  };
}

function NftCardView({
  data,
  top,
  currentPageIndex,
  handlePagination,
  nextToken,
  previousTokens,
  pageSize,
  setPageSize,
  isLoading
}: {
  data: NftCollection[];
  top?: boolean;
  currentPageIndex: number;
  handlePagination: (direction: 'next' | 'previous' | 'first') => Promise<void>;
  nextToken: string | null;
  previousTokens: string[];
  setPageSize: (size: number) => void;
  pageSize: number;
  isLoading: boolean;
}) {
  const context = useContext(Context) as AppContextType;
  const { setSearchTerm } = context;
  const navigate = useNavigate();

  const headers: { label: string; key: keyof NftCollection }[] = [
    { label: 'Contract Address', key: 'contractAddress' },
    { label: 'Collection Name', key: 'collectionName' },
    { label: 'Symbol', key: 'symbol' },
    { label: 'Year', key: 'year' },
    { label: 'Country', key: 'country' },
    { label: 'Owner Address', key: 'ownerAddress' },
    { label: 'Type', key: 'type' },
    { label: 'Created At', key: 'createdAt' },
    { label: 'Updated At', key: 'updatedAt' }
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleContractAddressClick = (contractAddress: string) => {
    navigate(`/nft?search=${contractAddress}`);
  };

  return (
    <MainCard title="NFT Collections" content={false} secondary={<CSVExport {...{ data, headers, filename: 'nft-collections.csv' }} />}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Search onSearch={handleSearch} />
        </Box>

        <Stack>
          {top && (
            <Box sx={{ p: 2 }}>
              <TablePaginationToken
                {...{
                  currentPageIndex,
                  handlePagination,
                  nextToken,
                  previousTokens,
                  pageSize,
                  setPageSize,
                  isLoading
                }}
              />
            </Box>
          )}

          <Grid container spacing={3}>
            {data?.length > 0 ? (
              data.map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                  <Card sx={{ height: '100%', cursor: 'pointer' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={item.collection_image || '/placeholder.png'}
                      alt={item.collectionName}
                      onClick={() => handleContractAddressClick(item.contractAddress)}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.collectionName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Contract:</b> {shortenAddress(item.contractAddress)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Symbol:</b> {item.symbol}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Year:</b> {item.year}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Country:</b> {item.country}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Owner:</b>{' '}
                        <Link to={getBlockExploreLink(item.ownerAddress)} target="_blank" rel="noopener noreferrer">
                          {shortenAddress(item.ownerAddress)}
                        </Link>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Type:</b> {item.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Created:</b> {formatDate(item.createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <b>Updated:</b> {formatDate(item.updatedAt)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="body1" sx={{ p: 2 }}>
                No data found!
              </Typography>
            )}
          </Grid>

          {!top && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 2 }}>
                <TablePaginationToken
                  {...{
                    currentPageIndex,
                    handlePagination,
                    nextToken,
                    previousTokens,
                    pageSize,
                    setPageSize,
                    isLoading
                  }}
                />
              </Box>
            </>
          )}
        </Stack>
      </CardContent>
    </MainCard>
  );
}

export default function NftCollectionTable() {
  const { logout } = useAuth();
  const context = useContext(Context) as AppContextType;
  const { searchTerm } = context;
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<NftCollection[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(1000);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<ListNftCollectionsData, ListNftCollectionsVars>(LIST_NFT_COLLECTIONS, {
    variables: {
      limit: pageSize,
      ...(searchTerm
        ? {
            filter: {
              or: [
                { contractAddress: { contains: searchTerm } },
                { collectionName: { contains: searchTerm } },
                { symbol: { contains: searchTerm } },
                { year: { contains: searchTerm } },
                { country: { contains: searchTerm } },
                { ownerAddress: { contains: searchTerm } },
                { type: { contains: searchTerm } },
                { createdAt: { contains: searchTerm } },
                { updatedAt: { contains: searchTerm } }
              ]
            }
          }
        : {})
    }
  });

  if (error) {
    console.error('Error fetching NFT collections:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  useEffect(() => {
    if (queryData) {
      setData(queryData.listNftCollections.items);
      setNextToken(queryData.listNftCollections.nextToken);
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
      }).then((fetchMoreResult: { data: { listNftCollections: { items: NftCollection[]; nextToken: string | null } } }) => {
        const fetchedData = fetchMoreResult.data;
        setData(fetchedData.listNftCollections.items);
        setNextToken(fetchedData.listNftCollections.nextToken);

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

  // useEffect(() => {
  //   handlePagination('first');
  // }, [pageSize, handlePagination]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <NftCardView
          {...{
            data,
            nextToken,
            previousTokens,
            currentPageIndex,
            pageSize,
            setPageSize,
            handlePagination,
            isLoading: loading
          }}
        />
      </Grid>
    </Grid>
  );
}
