// components/PendingMintedNfts/PendingMintedGroupsTable.tsx

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { NftPendingGroup, NftPendingItem } from './types';
import { getBlockExploreLink } from 'utils/explorer';
import { shortenAddress } from 'utils/shortenAddress';
import { formatDate } from 'utils/date';

interface Props {
  groups: NftPendingGroup[];
  expandedGroups: Set<string>;
  onToggleGroup: (groupKey: string) => void;
  isConnected: boolean;
  onMintClick: (item: NftPendingItem) => void;
  searchTerm: string;
}

const PendingMintedGroupsTable: React.FC<Props> = ({ groups, expandedGroups, onToggleGroup, isConnected, onMintClick, searchTerm }) => {
  if (groups.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {searchTerm ? 'No matching pending items found' : 'No pending mints available'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {searchTerm ? 'Try adjusting your search terms' : 'All items have been processed'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {groups.map((group) => {
        const groupKey = `${group.assetId}_${group.recipientWalletAddress}`;
        return (
          <Paper key={groupKey} sx={{ border: '1px solid', borderColor: 'divider' }}>
            {/* Header */}
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
              onClick={() => onToggleGroup(groupKey)}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {expandedGroups.has(groupKey) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                <Typography variant="subtitle1" fontWeight="medium">
                  Asset ID: {group.assetId}
                </Typography>
                <Chip label={`${group.items.length} pending`} size="small" color="warning" variant="filled" />
              </Stack>
            </Box>

            {/* Content */}
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
                      {group.items.map((item) => (
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
                              onClick={() => onMintClick(item)}
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
  );
};

export default PendingMintedGroupsTable;
