import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Grid, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, Box, Divider, CardContent, Stack } from '@mui/material';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { Context } from 'App';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';
import MainCard from 'components/MainCard';
import { CSVExport, TablePaginationToken } from 'components/third-party/react-table';
import ScrollX from 'components/ScrollX';
import Search from 'layout/Dashboard/Header/HeaderContent/Search';
import {
  CREATE_MINTED_NFT,
  GET_MINTED_NFT_BY_ASSET_ID,
  LIST_NFT_PENDING_MINT_ITEMS,
  UPDATE_MINTED_NFT_BY_ASSET_ID,
  UPDATE_NFT_PENDING_MINT
} from 'graphql/queries';
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
import axios from 'axios';
import useAuth from 'hooks/useAuth';

function ReactTable({
  data,
  columns,
  top,
  currentPageIndex,
  handlePagination,
  nextToken,
  previousTokens,
  pageSize,
  setPageSize,
  isLoading
}: {
  data: any[];
  columns: ColumnDef<any>[];
  top?: boolean;
  currentPageIndex: number;
  handlePagination: (direction: 'next' | 'previous' | 'first') => Promise<void>;
  nextToken: string | null;
  previousTokens: string[];
  setPageSize: (size: number) => void;
  pageSize: number;
  isLoading: boolean;
}) {
  const context = useContext(Context);
  const { setSearchTerm }: any = context;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
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
          </ScrollX>
        </CardContent>
      </MainCard>
    </>
  );
}

export default function PendingMintedNftsTable() {
  const { logout } = useAuth();
  const context = useContext(Context);
  const { searchTerm } = context as any;

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inputVolume, setInputVolume] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  const [nextToken, setNextToken] = useState<string | null>(null);
  const [previousTokens, setPreviousTokens] = useState<string[]>([]);
  const [data, setData] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Query for Non-Minted NFTs
  const {
    loading,
    error,
    data: queryData,
    fetchMore,
    refetch
  } = useQuery(LIST_NFT_PENDING_MINT_ITEMS, {
    variables: {
      nextToken: null,
      limit: pageSize,
      filter: { status: { eq: 'pending' } }
    }
  });

  const [updateNft] = useMutation(UPDATE_NFT_PENDING_MINT);
  const [createMintedNft] = useMutation(CREATE_MINTED_NFT);
  const [updateMintedNftByAssetId] = useMutation(UPDATE_MINTED_NFT_BY_ASSET_ID);
  const {
    data: mintedNftData,
    loading: mintedNftLoading,
    error: mintedNftError,
    refetch: refetchMintedNft
  } = useQuery(GET_MINTED_NFT_BY_ASSET_ID, {
    variables: { assetId: '', limit: pageSize },
    skip: true
  });

  if (error) {
    console.error('Error fetching pending minted NFTs:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // const transformedData = data?.listNftPendingMintItems?.items || [];

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter(
      (item: any) =>
        item?.contractAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.assetId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.recipientWalletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.txHash?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  const mintNft = async (item: any) => {
    try {
      setIsMinting(true);
      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(item.contractAddress, ERC1155_ABI, signer);
      const currentTokenId = await contract.currentTokenId();

      const { data: existing } = await refetchMintedNft({
        assetId: String(item.assetId)
      });

      const existingMintedNft = existing?.getMintedNfts;
      let tx;
      if (item.type === 'mint') {
        tx = await contract.mint(item.recipientWalletAddress, item.volume);
      } else if (item.type === 'addVolume') {
        tx = await contract.addVolume(BigInt(item.tokenId), item.volume, address);
      }

      const receipt = await tx.wait();

      // const mutationInput = {
      //   id: item.id,
      //   status: 'minted',
      //   txHash: receipt?.hash,
      //   tokenId: BigInt(currentTokenId).toString(),
      //   updatedAt: new Date().toISOString(),
      //   ...(item.type === 'addVolume' && {
      //     volume: (item.volume || 0) + (item.existingVolume || 0)
      //   })
      // };

      if (existingMintedNft) {
        const updatedMintedVolume = parseInt(existingMintedNft.mintedVolume || '0') + (item.volume || 0);

        await updateMintedNftByAssetId({
          variables: {
            input: {
              assetId: item.assetId,
              mintedVolume: updatedMintedVolume.toString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      } else {
        const mintedNftInput = {
          assetId: item.assetId,
          tokenId: BigInt(currentTokenId).toString(),
          contractAddress: item.contractAddress,
          mintedVolume: String(item.volume),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await createMintedNft({ variables: { input: mintedNftInput } });
      }

      // await updateNft({ variables: { input: mutationInput } });
      const payload = {
        id: item.id,
        assetId: item.assetId,
        tokenId: BigInt(currentTokenId).toString(),
        txHash: receipt?.hash
      };
      await axios.post(import.meta.env.VITE_APP_EVIDENT_UPDATE_URL, payload);
      refetch();
    } catch (error: any) {
      console.error('Mint error:', error);

      let errorMessage = 'Failed to mint NFT';
      if (error?.error?.message) errorMessage = error.error.message;
      else if (error?.data?.message) errorMessage = error.data.message;
      else if (error?.message) errorMessage = error.message;

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

  useEffect(() => {
    if (queryData) {
      setData(queryData.listNftPendingMintItems.items);
      setNextToken(queryData.listNftPendingMintItems.nextToken);
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

      let variables: { limit: number; nextToken?: string } = {
        limit: pageSize
      };
      if (token) {
        variables.nextToken = token;
      }
      fetchMore({
        variables
      }).then((fetchMoreResult: any) => {
        const fetchedData = fetchMoreResult.data;

        setData(fetchedData.listNftPendingMintItems.items);
        setNextToken(fetchedData.listNftPendingMintItems.nextToken);

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
            {isConnected ? (cell.row.original.type === 'mint' ? 'Mint' : 'Add Volume') : 'Connect Wallet to Mint'}
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
          <ReactTable
            {...{
              data: filteredData,
              columns,
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
