import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { LIST_NFT_WALLETS } from '../../../graphql/queries';

// types
import { TableDataProps } from 'types/table';

//query
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';
import ReactTableWrapper from 'components/ReactTableWrapper';

export default function NftTable() {
  const { logout } = useAuth();
  const [contractAddress, setContractAddress] = useState('');

  const context = useContext(Context);
  const location = useLocation();
  const { searchTerm }: any = context;

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
  } = useQuery(LIST_NFT_WALLETS, {
    variables: { limit: pageSize, contractAddress }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search); // Parse the URL query
    const searchParam = params.get('search');
    if (searchParam) {
      setContractAddress(searchParam); // Set the search term from URL
    }
    return () => {
      setContractAddress('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        (item.assetId && item.assetId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.contractAddress && item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.createdAt && item.createdAt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.mintedVolume && item.mintedVolume.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tokenId && item.tokenId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: any) => {
    return (resData?.listMintedNfts?.items || []).map((item: any, index: number) => ({
      id: item?.id || index || '',
      assetId: item.assetId,
      contractAddress: item.contractAddress,
      createdAt: item.createdAt,
      mintedVolume: item.mintedVolume,
      tokenId: item.tokenId
    }));
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listMintedNfts.nextToken);
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
      }).then((fetchMoreResult: any) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchedData.listMintedNfts.nextToken);

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
    [nextToken, previousTokens, pageSize, fetchMore]
  );

  useEffect(() => {
    handlePagination('first');
  }, [pageSize]);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Asset Id',
        accessorKey: 'assetId'
      },
      {
        header: 'Contract Address',
        accessorKey: 'contractAddress',
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
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'Minted Volume',
        accessorKey: 'mintedVolume'
      },
      // {
      //   header: 'Denergy Wallet',
      //   accessorKey: 'age',
      //   meta: {
      //     className: 'cell-right'
      //   }
      // },
      {
        header: 'Token Id',
        accessorKey: 'tokenId'
        // cell: (cell) => {
        //   switch (cell.getValue()) {
        //     case 'Complicated':
        //       return <Chip color="error" label="Complicated" size="small" variant="light" />;
        //     case 'Relationship':
        //       return <Chip color="success" label="Relationship" size="small" variant="light" />;
        //     case 'Single':
        //     default:
        //       return <Chip color="info" label="Single" size="small" variant="light" />;
        //   }
        // }
      }
      // {
      //   header: 'KYC status',
      //   accessorKey: 'progress'
      //   // cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      // },
      //   {
      //     header: 'Date Registered',
      //     accessorKey: 'date'
      //   }
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
