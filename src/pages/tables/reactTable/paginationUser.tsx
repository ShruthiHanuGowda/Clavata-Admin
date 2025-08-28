import { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import React from 'react';
import { Box } from '@mui/system';
import { ListUserWalletsResponse, UserTableRow } from 'types/table';
import { LIST_USER_WALLETS } from 'graphql/queries';
import { Context } from 'App';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import useAuth from 'hooks/useAuth';
import ReactTableWrapper from 'components/ReactTableWrapper';

export default function PaginationUserTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  if (!context) {
    throw new Error('Context must be used within a Context.Provider');
  }
  const { searchTerm } = context;

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState<UserTableRow[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: queryData,
    loading,
    error,
    fetchMore
  } = useQuery<ListUserWalletsResponse>(LIST_USER_WALLETS, {
    variables: { limit: pageSize }
  });

  if (error) {
    console.error('GraphQL Error:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // const handleOpenDetail = (id: string) => {
  //   setExpandedRowId((prevId) => (prevId === id ? null : id));
  // };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item) =>
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.wallet_address && item.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.denergyWallet && item.denergyWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.ethereumWallet && item.ethereumWallet.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.applicantId && item.applicantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.reviewStatus && item.reviewStatus.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, data]);

  const transformedResponseData = (resData: ListUserWalletsResponse) => {
    return resData.listUserWalletAddresses.items.map((item, index) => {
      let parsedUserDetail = null;
      try {
        if (item.kycDetails) {
          if (typeof item.kycDetails === 'string') {
            parsedUserDetail = JSON.parse(item.kycDetails);
          } else if (typeof item.kycDetails === 'object') {
            parsedUserDetail = item.kycDetails;
          }
        }
      } catch (e) {
        console.error('Failed to parse kycDetails for:', item.emailAddress || item.userWallet, 'Error:', e);
      }

      return {
        id: item.id || index.toString() || '',
        firstName: parsedUserDetail?.info?.firstName || 'Unknown',
        lastName: parsedUserDetail?.info?.lastName || 'Unknown',
        fullName: `${parsedUserDetail?.info?.firstName || 'Unknown'} ${parsedUserDetail?.info?.lastName || 'Unknown'}`,
        fatherName: parsedUserDetail?.info?.fatherName || 'Unknown',
        email: item.emailAddress,
        wallet_address: item.userWallet,
        denergyWallet: item.denergyWallet,
        ethereumWallet: item.ethereumWallet,
        applicantId: item.applicantId,
        is_verified: item.is_verified,
        reviewStatus: item.reviewStatus,
        date: item.date,
        kycDetails: parsedUserDetail
      };
    });
  };

  useEffect(() => {
    if (queryData) {
      const transformedData = transformedResponseData(queryData);
      setData(transformedData);
      setNextToken(queryData.listUserWalletAddresses.nextToken);
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
      }).then((fetchMoreResult: { data: ListUserWalletsResponse }) => {
        const fetchedData = fetchMoreResult.data;

        const transformedData = transformedResponseData(fetchedData);

        setData(transformedData);
        setNextToken(fetchedData.listUserWalletAddresses.nextToken);

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

  const columns = useMemo<ColumnDef<UserTableRow>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email',
        enableSorting: true
      },
      {
        header: 'User Wallet Address',
        accessorKey: 'wallet_address',
        enableSorting: true,
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
        header: 'KYC Applicant ID',
        accessorKey: 'applicantId',
        enableSorting: true
      },
      {
        header: 'KYC Verified',
        accessorKey: 'is_verified',
        enableSorting: true
      },
      {
        header: 'Date Registered',
        accessorKey: 'date',
        enableSorting: true,
        cell: (cell) => formatDate(cell.getValue() as string)
      },
      {
        header: 'KYC User Detail',
        accessorKey: 'kycDetails',
        cell: (info) => {
          const applicantId = info.row.original.applicantId;
          return (
            <Link to={`/user/${applicantId}`}>
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
          // expandedRowId={expandedRowId}
          renderExpandedRow={(row) => (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px', position: 'relative' }}>
              <Box
                sx={{
                  width: '250px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  boxShadow: 2
                }}
              >
                <div>
                  <strong>First Name:</strong> {row.original.kycDetails?.fullResponse?.info?.firstName || 'N/A'}
                </div>
                <div>
                  <strong>Last Name:</strong> {row.original.kycDetails?.fullResponse?.info?.lastName || 'N/A'}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {row.original.kycDetails?.fullResponse?.info?.dob || 'N/A'}
                </div>
                <div>
                  <strong>Country:</strong> {row.original.kycDetails?.fullResponse?.info?.country || 'N/A'}
                </div>
                <div>
                  <strong>Nationality:</strong> {row.original.kycDetails?.fullResponse?.fixedInfo?.nationality || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {row.original.kycDetails?.email || 'N/A'}
                </div>
                <div>
                  <strong>Review Status:</strong> {row.original.kycDetails?.fullResponse?.review?.reviewResult?.reviewAnswer || 'N/A'}
                </div>
                <div>
                  <strong>IP Country:</strong> {row.original.kycDetails?.ipCountry || 'N/A'}
                </div>
              </Box>
            </Box>
          )}
        />
      </Grid>
    </Grid>
  );
}
