import React, { useMemo, useState } from 'react';
import { CardContent, Typography, Stack } from '@mui/material';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useQuery } from '@apollo/client';

import { NftPendingGroup, NftPendingItem, QueryResult, QueryVariables } from './types';

import SearchControls from './SearchBar';
import PendingMintedGroupsTable from './PendingMintedGroupsTable';
import PaginationControls from './PaginationControls';
import MintConfirmationDialog from './MintConfirmationDialog';

import { useMintNft } from './useMintNft';
import { LIST_NFT_PENDING_MINT_ITEMS } from 'graphql/queries';

import { openSnackbar } from 'api/snackbar';
import MainCard from 'components/MainCard';
import { SnackbarProps } from 'types/snackbar';

const ITEMS_PER_PAGE = 10;

export default function PendingMintedNftsTable() {
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();

  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NftPendingItem | null>(null);
  const [inputVolume, setInputVolume] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useQuery<QueryResult, QueryVariables>(LIST_NFT_PENDING_MINT_ITEMS, {
    variables: { limit: 50 }
  });

  const { mintNft, isMinting } = useMintNft(refetch);

  const pendingGroupedItems = useMemo<NftPendingGroup[]>(() => {
    const allGroups = data?.listGroupedNftPendingMintItems?.items || [];

    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.status?.toLowerCase() === 'pending')
      }))
      .filter((group) => group.items.length > 0);
  }, [data]);

  const filteredGroups = useMemo<NftPendingGroup[]>(() => {
    if (!searchTerm.trim()) return pendingGroupedItems;

    const lowerSearch = searchTerm.toLowerCase();

    return pendingGroupedItems
      .map((group) => {
        const filteredItems = group.items.filter((item) =>
          [item.contractAddress, item.assetId, item.recipientWalletAddress, item.type].some((field) =>
            field?.toLowerCase().includes(lowerSearch)
          )
        );
        return filteredItems.length ? { ...group, items: filteredItems } : null;
      })
      .filter((group): group is NftPendingGroup => Boolean(group));
  }, [searchTerm, pendingGroupedItems]);

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGroups.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGroups, currentPage]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGroupExpansion = (assetId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const expandAllGroups = () => {
    const allKeys = new Set(paginatedGroups.map((g) => `${g.assetId}_${g.recipientWalletAddress}`));
    setExpandedGroups(allKeys);
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const handleMintConfirm = async () => {
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

    await mintNft({ ...selectedItem, volume: parseInt(inputVolume, 10) });
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <MainCard>
        <Typography>Loading pending NFTs...</Typography>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard>
        <Typography color="error">Error loading data: {error.message}</Typography>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard title="Pending Minted NFTs" content={false}>
        <CardContent>
          <Stack spacing={3}>
            <SearchControls
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              onExpandAll={expandAllGroups}
              onCollapseAll={collapseAllGroups}
              disabled={paginatedGroups.length === 0}
              filteredCount={paginatedGroups.length}
              totalCount={filteredGroups.length}
              initialCount={pendingGroupedItems.length}
            />

            <PendingMintedGroupsTable
              groups={paginatedGroups}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroupExpansion}
              onMintClick={(item) => {
                if (!isConnected) return open();
                setSelectedItem(item);
                setInputVolume(String(item.volume || ''));
                setOpenDialog(true);
              }}
              isConnected={isConnected}
              searchTerm={searchTerm}
            />

            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </Stack>
        </CardContent>
      </MainCard>

      <MintConfirmationDialog
        open={openDialog}
        isMinting={isMinting}
        selectedItem={selectedItem}
        inputVolume={inputVolume}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleMintConfirm}
      />
    </>
  );
}
