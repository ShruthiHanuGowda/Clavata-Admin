import React, { useContext, useMemo, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from 'App';
import ReactTableWrapper from 'components/ReactTableWrapper';

interface Validator {
  validatorId: string;
  validatorName: string;
  commissionRate: number;
  totalStakeAmount: number;
  totalStakedNFT: number;
  totalStakedWatt: number;
  validatorAge: number;
  status: string;
}

interface Delegator {
  delegatorAddress: string;
  rewardsEarned: number;
  stakedAmount: number;
  stakedNFT: number;
  stakedWatt: number;
}

interface TransformedValidator {
  name: string;
  validatorId: string;
  commissionRate: number;
  totalStakeAmount: number;
  totalStakedNFT: number;
  totalStakedWatt: number;
  validatorAge: number;
  status: string;
}

export default function Validator() {
  const context = useContext(Context);
  if (!context) throw new Error('Validator must be used within a Context.Provider');
  const { searchTerm } = context;
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [delegators, setDelegators] = useState<Delegator[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  const GET_VALIDATORS_URL = import.meta.env.VITE_APP_STAKING_GET_VALIDATORS_API_URL || '';

  useEffect(() => {
    const fetchValidators = async () => {
      setLoading(true);
      try {
        const res = await fetch(GET_VALIDATORS_URL);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setValidators(json.validators || []);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch validators');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchValidators();
  }, []);

  const fetchValidatorDetails = async (validatorId: string) => {
    if (!validatorId) return;
    try {
      const response = await fetch(`${GET_VALIDATORS_URL}?validatorId=${validatorId}`);
      const json = await response.json();
      setSelectedValidator(json.validator);
      setDelegators(json.delegators);
      setOpenDialog(true);
    } catch (err) {
      console.error('Failed to fetch validator details', err);
    }
  };

  const transformedData: TransformedValidator[] = useMemo(
    () =>
      validators.map((v) => ({
        name: v.validatorName,
        validatorId: v.validatorId,
        commissionRate: v.commissionRate,
        totalStakeAmount: v.totalStakeAmount,
        totalStakedNFT: v.totalStakedNFT,
        totalStakedWatt: v.totalStakedWatt,
        validatorAge: v.validatorAge,
        status: v.status
      })),
    [validators]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: TransformedValidator) =>
        (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.validatorId && item.validatorId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transformedData]);

  const columns = useMemo(
    (): ColumnDef<TransformedValidator>[] => [
      { header: 'Validator Name', accessorKey: 'name' },
      { header: 'Validator ID', accessorKey: 'validatorId' },
      {
        header: 'Commission Rate',
        accessorKey: 'commissionRate',
        cell: ({ getValue }) => ((getValue<number>() || 0) * 100).toFixed(2) + '%'
      },
      {
        header: 'Total Stake Amount',
        accessorKey: 'totalStakeAmount',
        cell: ({ getValue }) => Number(getValue<number>() || 0).toLocaleString()
      },
      {
        header: 'Total Staked NFT',
        accessorKey: 'totalStakedNFT',
        cell: ({ getValue }) => Number(getValue<number>() || 0).toLocaleString()
      },
      {
        header: 'Total Staked WATT',
        accessorKey: 'totalStakedWatt',
        cell: ({ getValue }) => Number(getValue<number>() || 0).toLocaleString()
      },
      { header: 'Validator Age', accessorKey: 'validatorAge' },
      { header: 'Status', accessorKey: 'status' }
    ],
    []
  );

  if (loading) return <div>Loading validators...</div>;
  if (error) return <div>Error loading validators: {error}</div>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ReactTableWrapper<TransformedValidator>
          data={filteredData}
          columns={columns} // Now columns are of type `ColumnDef<object>[]`
          isLoading={loading}
          topPagination={false}
          csvFilename="validators.csv"
          // 👇 Optional: handle row clicks
          onRowClick={async (row: { validatorId: string }) => {
            await fetchValidatorDetails(row.validatorId);
          }}
          currentPageIndex={0}
          handlePagination={function (): Promise<void> {
            throw new Error('Function not implemented.');
          }}
          nextToken={null}
          previousTokens={[]}
          pageSize={0}
          setPageSize={function (): void {
            throw new Error('Function not implemented.');
          }}
        />
      </Grid>

      {/* Dialog for displaying the validator details */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Validator Details
          <IconButton edge="end" color="inherit" onClick={() => setOpenDialog(false)} aria-label="close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedValidator && (
            <div>
              <h3>{selectedValidator.validatorName}</h3>
              <p>
                <strong>Validator ID:</strong> {selectedValidator.validatorId}
              </p>
              <p>
                <strong>Commission Rate:</strong> {(selectedValidator.commissionRate * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Total Stake Amount:</strong> {selectedValidator.totalStakeAmount}
              </p>
              <p>
                <strong>Total Staked NFT:</strong> {selectedValidator.totalStakedNFT}
              </p>
              <p>
                <strong>Total Staked WATT:</strong> {selectedValidator.totalStakedWatt}
              </p>
              <p>
                <strong>Validator Age:</strong> {selectedValidator.validatorAge} days
              </p>
              <p>
                <strong>Status:</strong> {selectedValidator.status}
              </p>

              <Divider />
              <h4>Delegators</h4>
              {delegators.map((delegator, index) => (
                <div key={index}>
                  <p>
                    <strong>Delegator Address:</strong> {delegator.delegatorAddress}
                  </p>
                  <p>
                    <strong>Reward Earned:</strong> {delegator.rewardsEarned}
                  </p>
                  <p>
                    <strong>Staked Amount:</strong> {delegator.stakedAmount}
                  </p>
                  <p>
                    <strong>Staked NFT:</strong> {delegator.stakedNFT}
                  </p>
                  <p>
                    <strong>Staked WATT:</strong> {delegator.stakedWatt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
