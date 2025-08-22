import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
// third-party
import { ColumnDef } from '@tanstack/react-table';

// project-import
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { LIST_COMPANY_WALLETS } from '../../../graphql/queries';
import ReactTableWrapper from 'components/ReactTableWrapper';

// types
import { TableDataProps } from 'types/table';
//query
import { Context } from 'App';
import { shortenAddress } from 'utils/shortenAddress';
import { getBlockExploreLink } from 'utils/explorer';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';

export default function PaginationTable() {
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
  } = useQuery(LIST_COMPANY_WALLETS, {
    variables: { limit: pageSize }
  });

  if (error) {
    console.error('GraphQL Error:', error, error?.message?.includes('code 401'), error?.message);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.wallet_address && item.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.denergyWallet && item.denergyWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ethereumWallet && item.ethereumWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantId && item.applicantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.is_verified_kyb?.toString() && item.is_verified_kyb.toString().includes(searchTerm.toLowerCase())) ||
        (item.reviewStatus && item.reviewStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: any) => {
    return resData.listUserWallets?.items.map((item: any, index: number) => {
      let parsedCompanyDetail = null;

      try {
        parsedCompanyDetail = typeof item.company_detail === 'string' ? JSON.parse(item.company_detail) : item.company_detail;
      } catch (e) {
        console.error('Invalid JSON in company_detail:', e);
      }

      const companyInfo = parsedCompanyDetail?.fullResponse?.fixedInfo?.companyInfo;

      return {
        id: item?.id || index || '',
        email: item.userAddress,
        wallet_address: item.userWallet,
        denergyWallet: item.denergyWallet,
        ethereumWallet: item.ethereumWallet,
        applicantId: item.applicantId,
        is_verified_kyb: item.is_verified_kyb,
        reviewStatus: item.reviewStatus,
        date: item.date,
        company_detail: companyInfo || null
      };
    });
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listUserWallets.nextToken);
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
        setNextToken(fetchMoreResult.data.listUserWallets.nextToken);

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
        header: 'Email',
        accessorKey: 'email'
      },
      {
        header: 'User Wallet Address',
        accessorKey: 'wallet_address',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      // {
      //   header: 'Denergy Wallet Address',
      //   accessorKey: 'denergyWallet',
      //   cell: (cell) => {
      //     const address = cell.getValue() as string;
      //     return (
      //       <Link to={getBlockExploreLink(address)} target="_blank">
      //         {shortenAddress(address)}
      //       </Link>
      //     );
      //   }
      // },
      // {
      //   header: 'Ethereum Wallet Address',
      //   accessorKey: 'ethereumWallet',
      //   cell: (cell) => {
      //     const address = cell.getValue() as string;
      //     return (
      //       <Link to={getBlockExploreLink(address)} target="_blank">
      //         {shortenAddress(address)}
      //       </Link>
      //     );
      //   }
      // },
      {
        header: 'KYB Applicant ID',
        accessorKey: 'applicantId'
      },
      {
        header: 'KYB Verified',
        accessorKey: 'is_verified_kyb'
      },
      // {
      //   header: 'KYB Review Status',
      //   accessorKey: 'reviewStatus'
      // },
      {
        header: 'Date Registered',
        accessorKey: 'date',
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'KYB Company Detail',
        accessorKey: 'company_detail',
        cell: (info) => {
          const applicantId = info.row.original.applicantId;

          return (
            <Link to={`/companies/${applicantId}`}>
              <button
                style={{
                  padding: '6px 12px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            </Link>
          );
        }
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
