import { useCallback, useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import MainCard from '../../components/MainCard';
import useAuth from 'hooks/useAuth';
import { ON_CREATE_EVIDENT_ITEM, ON_UPDATE_EVIDENT_ITEM, ON_DELETE_EVIDENT_ITEM } from 'graphql/subscriptions';
import { formatDate } from 'utils/date';
import { LIST_EVIDENT_ITEMS } from 'graphql/queries';
import ReactTableWrapper from 'components/ReactTableWrapper';

interface EvidentItem {
  uid: string;
  assetId: string;
  asset: string;
  volume?: number;
}

export default function EvidentItems() {
  const { logout } = useAuth();
  const [data, setData] = useState<EvidentItem[]>([]);
  const [search] = useState('');
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<{ listEvidentItems: { items: EvidentItem[]; nextToken: string | null } }>(LIST_EVIDENT_ITEMS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      limit: pageSize,
      filter: {
        or: [{ assetId: { contains: search } }, { uid: { contains: search } }, { asset: { contains: search } }]
      }
    }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  const apolloClient = useMemo(() => {
    const wsLink = new WebSocketLink({
      uri: import.meta.env.VITE_APP_EVIDENT_GRAPHQL_WS_URL,
      options: {
        reconnect: true,
        connectionParams: {
          'x-api-key': import.meta.env.VITE_APP_EVIDENT_GRAPHQL_API_KEY
        }
      }
    });

    return new ApolloClient({
      link: wsLink,
      cache: new InMemoryCache()
    });
  }, []);

  useEffect(() => {
    const createSub = apolloClient.subscribe<{ onCreateEvidentItems: EvidentItem }>({ query: ON_CREATE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const newItem = data?.onCreateEvidentItems;
        if (newItem) {
          setData((prevData) => {
            if (prevData.some((item) => item.uid === newItem.uid)) return prevData;
            return [...prevData, newItem];
          });
        }
      },
      error(err) {
        console.error('Create subscription error', err);
        // Optionally, trigger logout or re-subscribe logic if unauthorized
      }
    });

    const updateSub = apolloClient.subscribe<{ onUpdateEvidentItems: EvidentItem }>({ query: ON_UPDATE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const updatedItem = data?.onUpdateEvidentItems;
        if (updatedItem) {
          setData((prevData) => prevData.map((item) => (item.uid === updatedItem.uid ? updatedItem : item)));
        }
      },
      error(err) {
        console.error('Update subscription error', err);
      }
    });

    const deleteSub = apolloClient.subscribe<{ onDeleteEvidentItems: EvidentItem }>({ query: ON_DELETE_EVIDENT_ITEM }).subscribe({
      next({ data }) {
        const deletedItem = data?.onDeleteEvidentItems;
        if (deletedItem) {
          setData((prevData) => prevData.filter((item) => item.uid !== deletedItem.uid));
        }
      },
      error(err) {
        console.error('Delete subscription error', err);
      }
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, [apolloClient]);

  useEffect(() => {
    if (queryData?.listEvidentItems?.items) {
      setData(queryData.listEvidentItems.items);
      setNextToken(queryData.listEvidentItems.nextToken);
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
      }

      const variables: { limit: number; nextToken?: string } = { limit: pageSize };
      if (token) variables.nextToken = token;

      fetchMore({ variables }).then((res: { data: { listEvidentItems: { items: EvidentItem[]; nextToken: string | null } } }) => {
        const fetchedData = res.data?.listEvidentItems;
        setData(fetchedData?.items);
        setNextToken(fetchedData?.nextToken);

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
    const fetchFirstPage = async () => {
      const variables = { limit: pageSize };
      const res = await fetchMore({ variables });
      const fetchedData = res.data?.listEvidentItems;
      setData(fetchedData?.items);
      setNextToken(fetchedData?.nextToken);
      setPreviousTokens([]);
      setCurrentPageIndex(1);
    };

    fetchFirstPage();
  }, [pageSize, fetchMore]);

  const columns: ColumnDef<EvidentItem>[] = useMemo(
    () => [
      {
        header: 'Energy Type',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.deviceType?.deviceGroup : '')
      },
      {
        header: 'Country',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.country?.name : '')
      },
      {
        header: 'Facility Name',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.name : '')
      },
      {
        header: 'Volume (MWh)',
        accessorKey: 'volume',
        cell: ({ getValue }) => String(getValue() || '0')
      },
      {
        header: 'Production Start Date',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.startDate : '')
      },
      {
        header: 'Production End Date',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.endDate : ''),
        cell: ({ getValue }) => formatDate(getValue<string>() || '')
      },
      {
        header: 'Facility Commissioning Date',
        accessorFn: (row) => (row.asset ? JSON.parse(row.asset)?.issue?.deviceDetails?.commissioningDate : ''),
        cell: ({ getValue }) => formatDate(getValue<string>() || '')
      }
    ],
    []
  );

  return (
    <MainCard title="Evident Items" content={false}>
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
        topPagination={false}
        showSearch={true}
        csvFilename="evident-items.csv"
      />
    </MainCard>
  );
}
