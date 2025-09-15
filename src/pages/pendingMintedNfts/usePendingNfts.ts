import { useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { QueryResult, QueryVariables, NftPendingGroup } from './types';
import { LIST_NFT_PENDING_MINT_ITEMS } from 'graphql/queries';

export const usePendingNfts = (searchTerm: string, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useQuery<QueryResult, QueryVariables>(LIST_NFT_PENDING_MINT_ITEMS, {
    variables: { limit: 50 }
  });

  const pendingGroups = useMemo<NftPendingGroup[]>(() => {
    const allGroups = data?.listGroupedNftPendingMintItems?.items || [];
    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.status?.toLowerCase() === 'pending')
      }))
      .filter((group) => group.items.length > 0);
  }, [data]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return pendingGroups;

    return pendingGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) =>
          [item.contractAddress, item.assetId, item.recipientWalletAddress, item.type].some((field) =>
            field?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        return filteredItems.length ? { ...group, items: filteredItems } : null;
      })
      .filter((group): group is NftPendingGroup => Boolean(group));
  }, [searchTerm, pendingGroups]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, currentPage, itemsPerPage]);

  const toggleGroupExpansion = (assetId: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(assetId)) {
      newSet.delete(assetId);
    } else {
      newSet.add(assetId);
    }
    setExpandedGroups(newSet);
  };

  const expandAllGroups = () => {
    setExpandedGroups(new Set(paginatedGroups.map((g) => `${g.assetId}_${g.recipientWalletAddress}`)));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  return {
    loading,
    error,
    refetch,
    currentPage,
    setCurrentPage,
    filteredGroups,
    paginatedGroups,
    expandedGroups,
    toggleGroupExpansion,
    expandAllGroups,
    collapseAllGroups,
    totalPages
  };
};
