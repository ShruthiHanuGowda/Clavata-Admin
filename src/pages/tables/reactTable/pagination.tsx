import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// third-party
import { ColumnDef } from '@tanstack/react-table';

// project imports
import { Link } from 'react-router-dom';
import ReactTableWrapper from 'components/ReactTableWrapper';

// types
import { CompanyTableRow } from 'types/table';

// App context
import { Context } from 'App';

import { shortenAddress } from 'utils/shortenAddress';
import { getBlockExploreLink } from 'utils/explorer';
import { formatDate } from 'utils/date';

export default function PaginationTable() {
  // ============================================================
  // SEARCH CONTEXT
  // ============================================================

  const context = useContext(Context);

  const searchTerm = context?.searchTerm || '';

  // ============================================================
  // LOCAL TABLE STATE
  // ============================================================

  const [data, setData] = useState<CompanyTableRow[]>([]);

  const [nextToken, setNextToken] = useState<string | null>(null);

  const [previousTokens, setPreviousTokens] = useState<string[]>([]);

  const [currentPageIndex, setCurrentPageIndex] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  // ============================================================
  // GRAPHQL TEMPORARILY DISABLED
  // ============================================================
  //
  // GraphQL has been removed temporarily.
  //
  // When the backend is ready again, we can add:
  //
  // useQuery(LIST_COMPANY_WALLETS, ...)
  //
  // without changing the table UI.
  //
  // ============================================================

  useEffect(() => {
    // Keep the table empty until GraphQL is enabled again.
    setData([]);
    setNextToken(null);
    setPreviousTokens([]);
    setCurrentPageIndex(1);
  }, [pageSize]);

  // ============================================================
  // SEARCH FILTER
  // ============================================================

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }

    const search = searchTerm.toLowerCase();

    return data.filter((item: CompanyTableRow) => {
      return (
        Boolean(item.email?.toLowerCase().includes(search)) ||
        Boolean(item.wallet_address?.toLowerCase().includes(search)) ||
        Boolean(item.denergyWallet?.toLowerCase().includes(search)) ||
        Boolean(item.ethereumWallet?.toLowerCase().includes(search)) ||
        Boolean(item.applicantId?.toLowerCase().includes(search)) ||
        Boolean(
          item.is_verified_kyb
            ?.toString()
            .toLowerCase()
            .includes(search)
        ) ||
        Boolean(item.reviewStatus?.toLowerCase().includes(search))
      );
    });
  }, [searchTerm, data]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePagination = useCallback(
    async (direction: 'next' | 'previous' | 'first') => {
      // GraphQL pagination is temporarily disabled.

      switch (direction) {
        case 'first':
          setCurrentPageIndex(1);
          setPreviousTokens([]);
          setNextToken(null);
          break;

        case 'previous':
          setCurrentPageIndex((prev) => Math.max(1, prev - 1));
          break;

        case 'next':
          // No backend data currently available.
          break;

        default:
          break;
      }
    },
    []
  );

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = useMemo<ColumnDef<CompanyTableRow>[]>(
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

          if (!address) {
            return '-';
          }

          return (
            <Link
              to={getBlockExploreLink(address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortenAddress(address)}
            </Link>
          );
        }
      },

      {
        header: 'KYB Applicant ID',
        accessorKey: 'applicantId'
      },

      {
        header: 'KYB Verified',
        accessorKey: 'is_verified_kyb'
      },

      {
        header: 'Date Registered',
        accessorKey: 'date',

        cell: (cell) => {
          const value = cell.getValue() as string;

          if (!value) {
            return '-';
          }

          return formatDate(value);
        }
      },

      {
        header: 'KYB Company Detail',
        accessorKey: 'company_detail',

        cell: (info) => {
          const applicantId =
            info.row.original.applicantId;

          if (!applicantId) {
            return '-';
          }

          return (
            <Link to={`/companies/${applicantId}`}>
              <button
                type="button"
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

  // ============================================================
  // RENDER
  // ============================================================

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
          isLoading={false}
        />
      </Grid>
    </Grid>
  );
}

