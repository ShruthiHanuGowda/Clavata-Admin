import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { LIST_BENEFICIARIES } from '../../../graphql/queries';

// types
import { TableDataProps } from 'types/table';

import ReactTableWrapper from 'components/ReactTableWrapper';

//query
import { Context } from 'App';
import useAuth from 'hooks/useAuth';

export default function AddressBookTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
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
  } = useQuery(LIST_BENEFICIARIES, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: {
        or: [
          { name: { contains: searchTerm } },
          { walletAddress: { contains: searchTerm } },
          { beneficiaryAddress: { contains: searchTerm } },
          { chain: { contains: searchTerm } }
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

  const transformedResponseData = (resData: any) => {
    return resData.listAddressBooks?.items.map((item: any, index: number) => ({
      id: item.id || index || '',
      name: item.name,
      walletAddress: item.walletAddress,
      beneficiaryAddress: item.beneficiaryAddress,
      chain: item.chain
    }));
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listAddressBooks.nextToken);
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
        setNextToken(fetchedData.listAddressBooks.nextToken);

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

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name'
      },
      {
        header: 'Wallet Address',
        accessorKey: 'walletAddress'
        // cell: (cell) => {
        //   const hash = cell.getValue() as string;
        //   return (
        //     <Link to={getBlockExploreLink(hash)} target="_blank">
        //       {shortenAddress(hash)}
        //     </Link>
        //   );
        // }
      },
      {
        header: 'Beneficiary Address',
        accessorKey: 'beneficiaryAddress'
        // cell: (cell) => {
        //   const hash = cell.getValue() as string;
        //   return (
        //     <Link to={getBlockExploreLink(hash)} target="_blank">
        //       {shortenAddress(hash)}
        //     </Link>
        //   );
        // }
      },
      {
        header: 'Chain',
        accessorKey: 'chain'
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
