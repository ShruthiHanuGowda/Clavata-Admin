import { useState } from 'react';
import { Contract, BrowserProvider, Eip1193Provider } from 'ethers';
import { useAppKitAccount } from '@reown/appkit/react';
import { useMutation, useQuery } from '@apollo/client';
import axios from 'axios';

import { NftPendingItem, GetMintedNftByAssetIdData, GetMintedNftByAssetIdVars, EthersError, GraphQlError, GenericError } from './types';
import { ERC1155_ABI } from 'abi';
import { CREATE_MINTED_NFT, UPDATE_MINTED_NFT_BY_ASSET_ID, GET_MINTED_NFT_BY_ASSET_ID } from 'graphql/queries';

import { SnackbarProps } from 'types/snackbar';
import { openSnackbar } from 'api/snackbar';

export const useMintNft = (refetch: () => void) => {
  const { address } = useAppKitAccount();
  const [isMinting, setIsMinting] = useState(false);

  const [createMintedNft] = useMutation(CREATE_MINTED_NFT);
  const [updateMintedNftByAssetId] = useMutation(UPDATE_MINTED_NFT_BY_ASSET_ID);

  const { refetch: refetchMintedNft } = useQuery<GetMintedNftByAssetIdData, GetMintedNftByAssetIdVars>(GET_MINTED_NFT_BY_ASSET_ID, {
    variables: { assetId: '' },
    skip: true
  });

  const mintNft = async (item: NftPendingItem) => {
    try {
      setIsMinting(true);

      // Setup contract
      const provider = new BrowserProvider(window.ethereum as unknown as Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new Contract(item.contractAddress, ERC1155_ABI, signer);

      // Determine next token ID
      const currentTokenId = await contract.totalTokenTypes();
      const nextTokenId = BigInt(currentTokenId) + 1n;

      // Check for existing minted NFT
      const { data: existing } = await refetchMintedNft({
        assetId: String(item.assetId ?? '')
      });
      const existingMinted = existing?.getMintedNfts;

      const currentTimestamp = Math.floor(Date.now() / 1000);
      let tx;

      // Perform contract call
      if (item.type === 'mint') {
        tx = await contract.mint(item.recipientWalletAddress, item.volume, currentTimestamp);
      } else if (item.type === 'addVolume') {
        tx = await contract.addVolume(BigInt(item.tokenId ?? '0'), item.volume, address);
      } else {
        throw new Error(`Unsupported mint type: ${item.type}`);
      }

      const receipt = await tx.wait();

      // Update or create record in DB
      if (existingMinted) {
        const updatedVolume = parseInt(existingMinted.mintedVolume || '0') + (item.volume || 0);

        await updateMintedNftByAssetId({
          variables: {
            input: {
              assetId: item.assetId,
              mintedVolume: updatedVolume.toString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      } else {
        const mintedNftInput = {
          assetId: item.assetId,
          tokenId: nextTokenId.toString(),
          contractAddress: item.contractAddress,
          mintedVolume: String(item.volume),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await createMintedNft({ variables: { input: mintedNftInput } });
      }

      // Notify backend service
      const payload = {
        id: item.id,
        assetId: item.assetId,
        tokenId: nextTokenId.toString(),
        txHash: receipt.hash
      };

      await axios.post(import.meta.env.VITE_APP_EVIDENT_UPDATE_URL, payload);
      refetch();

      openSnackbar({
        open: true,
        message: 'NFT minted successfully!',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        variant: 'alert',
        alert: { color: 'success' }
      } as SnackbarProps);
    } catch (error: unknown) {
      console.error('Minting error:', error);

      let message = 'Failed to mint NFT';

      if (isEthersError(error)) {
        message = error?.error?.message || message;
      } else if (isGraphQlError(error)) {
        message = error.data?.message || message;
      } else if (isGenericError(error)) {
        message = error.message || message;
      }

      openSnackbar({
        open: true,
        message,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        variant: 'alert',
        alert: { color: 'error' }
      } as SnackbarProps);
    } finally {
      setIsMinting(false);
    }
  };

  return {
    mintNft,
    isMinting
  };
};

// Type Guards
function isEthersError(e: unknown): e is EthersError {
  return typeof e === 'object' && e !== null && 'error' in e;
}

function isGraphQlError(e: unknown): e is GraphQlError {
  return typeof e === 'object' && e !== null && 'data' in e;
}

function isGenericError(e: unknown): e is GenericError {
  return typeof e === 'object' && e !== null && 'message' in e;
}
