import { useContext, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Context } from 'App';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';
import MainCard from 'components/MainCard';
import TablePagination from 'components/third-party/react-table/TablePagination';
import ScrollX from 'components/ScrollX';
import CSVExport from 'components/third-party/react-table/CSVExport';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import { LIST_NFT_PENDING_MINT_ITEMS, UPDATE_NFT_PENDING_MINT } from 'graphql/queries';
import { formatDate } from 'utils/date';
import { Button } from '@mui/material';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { BrowserProvider, Contract } from 'ethers';
import { ERC1155_ABI } from 'abi';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { Link } from 'react-router-dom';

function ReactTable({ data, columns, top }: { data: any[]; columns: ColumnDef<any>[]; top?: boolean }) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  let headers: any[] = [];
  table.getAllColumns().map((col: any) =>
    headers.push({
      label: col.columnDef.header,
      key: col.columnDef.accessorKey
    })
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <>
      <MainCard title="Non-Minted NFTs" content={false} secondary={<CSVExport {...{ data, headers, filename: 'non-minted-nfts.csv' }} />}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Search onSearch={handleSearch} />
          </Box>
          <ScrollX>
            <Stack>
              {top && (
                <Box sx={{ p: 2 }}>
                  <TablePagination
                    setPageSize={table.setPageSize}
                    setPageIndex={table.setPageIndex}
                    getState={table.getState}
                    getPageCount={table.getPageCount}
                  />
                </Box>
              )}

              <TableContainer>
                <Table>
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} {...header.column.columnDef.meta}>
                            <span onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽'
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows?.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell: any) => (
                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow key={0}>No data found!</TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {!top && (
                <>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <TablePagination
                      setPageSize={table.setPageSize}
                      setPageIndex={table.setPageIndex}
                      getState={table.getState}
                      getPageCount={table.getPageCount}
                    />
                  </Box>
                </>
              )}
            </Stack>
          </ScrollX>
        </CardContent>
      </MainCard>
    </>
  );
}

export default function PendingMintedNftsTable() {
  const context = useContext(Context);
  const { searchTerm } = context as any;

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inputVolume, setInputVolume] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  // Query for Non-Minted NFTs
  const { loading, error, data, fetchMore, refetch } = useQuery(LIST_NFT_PENDING_MINT_ITEMS, {
    variables: {
      nextToken: null,
      filter: { status: { eq: 'pending' } }
    }
  });

  const [updateNft] = useMutation(UPDATE_NFT_PENDING_MINT);

  if (error) {
    console.error('Error fetching pending minted NFTs:', error);
  }

  const transformedData = data?.listNftPendingMintItems?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return transformedData;
    return transformedData.filter(
      (item: any) =>
        item.contractAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.recipientWalletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.txHash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transformedData]);

  const mintNft = async (item: any) => {
    try {
      setIsMinting(true);
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(item.contractAddress, ERC1155_ABI, signer);

      let tx;
      if (item.type === 'mint') {
        tx = await contract.mint(address, item.volume);
        console.log('tx - ', tx);
      } else if (item.type === 'addVolume') {
        tx = await contract.addVolume(BigInt(item.tokenId), item.volume, address);
      }

      const receipt = await tx.wait();

      const mutationInput: any = {
        id: item.id,
        status: 'minted',
        txHash: receipt?.hash,
        updatedAt: new Date().toISOString()
      };

      if (item.type === 'addVolume') {
        mutationInput.volume = (item.volume || 0) + (item.existingVolume || 0);
      }

      await updateNft({
        variables: {
          input: mutationInput
        }
      });
      refetch();
    } catch (error: any) {
      console.log('error - ', error);
      let errorMessage = 'Failed to mint NFT';

      if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      openSnackbar({
        open: true,
        message: errorMessage,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setIsMinting(false);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      { header: 'Asset ID', accessorKey: 'assetId' },
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
        header: 'Recipient Wallet',
        accessorKey: 'recipientWalletAddress',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address)} target="_blank">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      { header: 'Token ID', accessorKey: 'tokenId' },
      { header: 'Volume', accessorKey: 'volume' },
      { header: 'status', accessorKey: 'status' },
      { header: 'type', accessorKey: 'type' },
      {
        header: 'txHash',
        accessorKey: 'txHash',
        cell: (cell) => {
          const address = cell.getValue() as string;
          return (
            <Link to={getBlockExploreLink(address, 'transaction')} target="_blank">
              {shortenAddress(address)}
            </Link>
          );
        }
      },
      { header: 'Created Date', accessorKey: 'createdAt', cell: (cell) => formatDate(cell.getValue() as string) },
      { header: 'Updated Date', accessorKey: 'updatedAt', cell: (cell) => formatDate(cell.getValue() as string) },
      {
        header: 'Action',
        accessorKey: 'action',
        cell: (cell) => (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (!isConnected) {
                open();
                return;
              }
              setSelectedItem(cell.row.original);
              setInputVolume(String(cell.row.original.volume || ''));
              setOpenDialog(true);
            }}
          >
            {isConnected ? 'Mint' : 'Connect Wallet to Mint'}
          </Button>
        )
      }
    ],
    [isConnected]
  );

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReactTable {...{ data: filteredData, columns }} />
        </Grid>
      </Grid>
      <Dialog open={openDialog} fullWidth onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm NFT Minting</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Volume"
              type="number"
              disabled
              fullWidth
              value={inputVolume}
              onChange={(e) => setInputVolume(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!selectedItem || !inputVolume || parseInt(inputVolume) <= 0) {
                openSnackbar({
                  open: true,
                  message: 'Please enter a valid volume',
                  anchorOrigin: { vertical: 'top', horizontal: 'center' },
                  variant: 'alert',
                  alert: { color: 'error' }
                } as SnackbarProps);
                return;
              }

              await mintNft({ ...selectedItem, volume: parseInt(inputVolume) });
              setOpenDialog(false);
            }}
            variant="contained"
            color="primary"
            disabled={isMinting}
          >
            {isMinting ? 'Minting...' : 'Confirm & Mint'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
