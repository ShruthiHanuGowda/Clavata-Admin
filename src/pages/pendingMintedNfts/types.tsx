export interface NftPendingItem {
  id: string;
  assetId: string;
  contractAddress: string;
  recipientWalletAddress: string;
  tokenId?: string;
  volume: number;
  type: 'mint' | 'addVolume';
  status?: string;
  createdAt: string;
}

export interface NftPendingGroup {
  assetId: string;
  recipientWalletAddress: string;
  items: NftPendingItem[];
}

export type EthersError = { error?: { message?: string } };
export type GraphQlError = { data?: { message?: string } };
export type GenericError = { message?: string };

export type QueryVariables = {
  limit: number;
};

export type QueryResult = {
  listGroupedNftPendingMintItems: {
    items: NftPendingGroup[];
  };
};

export interface MintedNft {
  assetId: string;
  tokenId: string;
  mintedVolume: string;
  contractAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMintedNftByAssetIdData {
  getMintedNfts: MintedNft | null;
}

export interface GetMintedNftByAssetIdVars {
  assetId: string;
}
