import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  InputAdornment,
  IconButton,
  Stack,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalanceWallet as WalletIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useMutation, useQuery } from '@apollo/client';
import { BrowserProvider, Contract } from 'ethers';
import { ERC1155_ABI } from 'abi';
import { Link } from 'react-router-dom';
import axios from 'axios';

import {
  CREATE_MINTED_NFT,
  GET_MINTED_NFT_BY_ASSET_ID,
  LIST_NFT_PENDING_MINT_ITEMS,
  UPDATE_MINTED_NFT_BY_ASSET_ID,
  UPDATE_NFT_PENDING_MINT
} from 'graphql/queries';

import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';
import { SnackbarProps } from 'types/snackbar';
import { Context } from 'App';
import useAuth from 'hooks/useAuth';

export default function PendingMintedNftsTable() {
  const context = useContext(Context);
  const { open } = useAppKit();
  const { logout } = useAuth();
  const { address, isConnected } = useAppKitAccount();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [inputVolume, setInputVolume] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');

  const [updateNft] = useMutation(UPDATE_NFT_PENDING_MINT);
  const [createMintedNft] = useMutation(CREATE_MINTED_NFT);
  const [updateMintedNftByAssetId] = useMutation(UPDATE_MINTED_NFT_BY_ASSET_ID);

  const { data, loading, error, refetch, fetchMore } = useQuery(LIST_NFT_PENDING_MINT_ITEMS, {
    variables: {
      limit: 10,
      searchTerm: currentSearchTerm || null
    },
    onCompleted: (data) => {
      if (data?.listGroupedNftPendingMintItems) {
        setAllGroups(data.listGroupedNftPendingMintItems.items || []);
        setNextToken(data.listGroupedNftPendingMintItems.nextToken);
      }
    }
  });

  const { data: mintedNftData, refetch: refetchMintedNft } = useQuery(GET_MINTED_NFT_BY_ASSET_ID, {
    variables: { assetId: '' },
    skip: true
  });

  if (error) {
    console.error('Error fetching Non-Minted NFTs:', error);
    if (error?.message?.includes('code 401')) {
      logout();
    }
  }

  // Filter for pending items only (server-side filtering handles search now)
  const pendingGroupedItems = useMemo(() => {
    return allGroups
      .map((group: any) => ({
        ...group,
        items: group.items.filter((item: any) => item.status?.toLowerCase() === 'pending')
      }))
      .filter((group: any) => group.items.length > 0);
  }, [allGroups]);

  // Server-side filtering - no need for client-side filtering
  const filteredGroups = pendingGroupedItems;

  // Debounced search to avoid too many API calls
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setCurrentSearchTerm(value.trim());
        setAllGroups([]);
        setNextToken(null);
      }, 500);
    };
  }, []);

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentSearchTerm('');
    setAllGroups([]);
    setNextToken(null);
  };

  const handleLoadMore = async () => {
    if (!nextToken || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const { data: moreData } = await fetchMore({
        variables: {
          limit: 10,
          nextToken: nextToken,
          searchTerm: currentSearchTerm || null
        }
      });

      if (moreData?.listGroupedNftPendingMintItems) {
        const newGroups = moreData.listGroupedNftPendingMintItems.items || [];
        setAllGroups((prev) => [...prev, ...newGroups]);
        setNextToken(moreData.listGroupedNftPendingMintItems.nextToken);
      }
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleGroupExpansion = (groupKey: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupKey)) {
      newExpandedGroups.delete(groupKey);
    } else {
      newExpandedGroups.add(groupKey);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const expandAllGroups = () => {
    const allGroupKeys: Set<string> = new Set(filteredGroups.map((group: any) => `${group.assetId}_${group.recipientWalletAddress}`));
    setExpandedGroups(allGroupKeys);
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  // Mint NFT function
  const mintNft = async (item: any) => {
    try {
      setIsMinting(true);

      const provider = new BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new Contract(item.contractAddress, ERC1155_ABI, signer);
      const currentTokenId = await contract.totalTokenTypes();
      const nextTokenId = BigInt(currentTokenId) + 1n;

      const { data: existing } = await refetchMintedNft({
        assetId: String(item.assetId)
      });

      const existingMintedNft = existing?.getMintedNfts;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      let tx;
      if (item.type === 'mint') {
        tx = await contract.mint(item.recipientWalletAddress, item.volume, currentTimestamp);
      } else if (item.type === 'addVolume') {
        tx = await contract.addVolume(BigInt(item.tokenId), item.volume, address);
      }

      const receipt = await tx.wait();

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
          tokenId: BigInt(nextTokenId).toString(),
          contractAddress: item.contractAddress,
          mintedVolume: String(item.volume),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await createMintedNft({ variables: { input: mintedNftInput } });
      }

      const payload = {
        id: item.id,
        assetId: item.assetId,
        tokenId: BigInt(nextTokenId).toString(),
        txHash: receipt?.hash
      };

      await axios.post(import.meta.env.VITE_APP_EVIDENT_UPDATE_URL, payload);

      // Reset pagination state and refetch
      setAllGroups([]);
      setNextToken(null);
      await refetch();

      openSnackbar({
        open: true,
        message: 'NFT minted successfully!',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
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

  if (loading)
    return (
      <MainCard>
        <Typography>Loading pending NFTs...</Typography>
      </MainCard>
    );
  if (error)
    return (
      <MainCard>
        <Typography color="error">Error loading data: {error.message}</Typography>
      </MainCard>
    );

  return (
    <>
      <MainCard title="Pending Minted NFTs" content={false}>
        <CardContent>
          {/* Search and Controls */}
          <Stack spacing={3}>
            <Box>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by asset ID, contract address, wallet, or type..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearch} size="small">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" size="small" onClick={expandAllGroups} disabled={filteredGroups.length === 0}>
                      Expand All
                    </Button>
                    <Button variant="outlined" size="small" onClick={collapseAllGroups} disabled={filteredGroups.length === 0}>
                      Collapse All
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Results Summary */}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredGroups.length} pending asset groups
                {searchTerm && ` (filtered from ${pendingGroupedItems.length} total)`}
                {nextToken && ' • More available'}
              </Typography>
            </Box>

            {/* Groups Display */}
            {filteredGroups.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchTerm ? 'No matching pending items found' : 'No pending mints available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search terms' : 'All items have been processed'}
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredGroups.map((group: any) => {
                  const groupKey = `${group.assetId}_${group.recipientWalletAddress}`;
                  return (
                    <Paper key={groupKey} sx={{ border: '1px solid', borderColor: 'divider' }}>
                      {/* Group Header */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'primary.50',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          '&:hover': { bgcolor: 'primary.100' }
                        }}
                        onClick={() => toggleGroupExpansion(groupKey)}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          {expandedGroups.has(groupKey) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          <Typography variant="subtitle1" fontWeight="medium">
                            Asset ID: {group.assetId}
                          </Typography>
                          <Chip label={`${group.items.length} pending`} size="small" color="warning" variant="filled" />
                        </Stack>
                        {/* <Chip
                        label={`Total Volume: ${group.items.reduce((sum: number, item: any) => sum + (item.volume || 0), 0).toLocaleString()}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      /> */}
                      </Box>

                      {/* Group Content */}
                      <Collapse in={expandedGroups.has(groupKey)}>
                        <Box sx={{ p: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                  <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Contract</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Recipient</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Token ID</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Volume</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Type</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Created</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', width: 120 }}>Action</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {group.items.map((item: any) => (
                                  <TableRow key={item.id} hover>
                                    <TableCell>
                                      <Link to={getBlockExploreLink(item.contractAddress)} style={{ textDecoration: 'none' }}>
                                        <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
                                          {shortenAddress(item.contractAddress)}
                                        </Typography>
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                      <Link to={getBlockExploreLink(item.recipientWalletAddress)} style={{ textDecoration: 'none' }}>
                                        <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace' }}>
                                          {shortenAddress(item.recipientWalletAddress)}
                                        </Typography>
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {item.tokenId || '-'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight="medium">
                                        {item.volume?.toLocaleString() || '0'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={item.type}
                                        size="small"
                                        color={item.type === 'mint' ? 'primary' : 'secondary'}
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(item.createdAt)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        color={item.type === 'mint' ? 'primary' : 'secondary'}
                                        startIcon={!isConnected ? <WalletIcon /> : null}
                                        onClick={() => {
                                          if (!isConnected) return open();
                                          setSelectedItem(item);
                                          setInputVolume(String(item.volume || ''));
                                          setOpenDialog(true);
                                        }}
                                        sx={{ minWidth: 100 }}
                                      >
                                        {!isConnected ? 'Connect' : item.type === 'mint' ? 'Mint' : 'Add Volume'}
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            )}

            {/* Load More Button */}
            {nextToken && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  startIcon={isLoadingMore ? <CircularProgress size={16} /> : <NavigateNextIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </MainCard>

      {/* Mint Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm NFT {selectedItem?.type === 'mint' ? 'Minting' : 'Volume Addition'}</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Asset ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {selectedItem.assetId}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip label={selectedItem.type} size="small" color={selectedItem.type === 'mint' ? 'primary' : 'secondary'} />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Volume
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedItem.volume?.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Recipient Address
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {selectedItem.recipientWalletAddress}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <TextField
                label="Volume to Process"
                type="number"
                fullWidth
                disabled
                value={inputVolume}
                helperText={`This will ${selectedItem.type === 'mint' ? 'mint' : 'add'} ${inputVolume} volume to the NFT`}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isMinting}
            onClick={async () => {
              if (!selectedItem || parseInt(inputVolume) <= 0) {
                openSnackbar({
                  open: true,
                  message: 'Invalid volume specified',
                  anchorOrigin: { vertical: 'top', horizontal: 'center' },
                  variant: 'alert',
                  alert: { color: 'error' }
                } as SnackbarProps);
                return;
              }

              await mintNft({ ...selectedItem, volume: parseInt(inputVolume) });
              setOpenDialog(false);
            }}
          >
            {isMinting ? 'Processing...' : `Confirm ${selectedItem?.type === 'mint' ? 'Mint' : 'Add Volume'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
