import memoize from 'lodash/memoize';

import type { AppKitNetwork } from '@reown/appkit/networks';

const denergyTestnet = {
  id: 4442,
  network: 'denergyTestnet',
  name: 'denergyTestnet',
  nativeCurrency: {
    name: 'WATT',
    symbol: 'WATT',
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.denergytestnet.com']
    }
  },
  blockExplorers: {
    default: {
      name: 'Denergy Testnet',
      url: 'https://explorer.denergytestnet.com/'
    }
  },
  contracts: {
    ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as `0x${string}` },
    ensUniversalResolver: {
      address: '0xce01f8eee7E479C928F8919abD53E553a36CeF67' as `0x${string}`,
      blockCreated: 33377
    },
    multicall3: {
      address: '0xce5c4eeb87a3fbafb6d8865777aecc5a9bdd49da' as `0x${string}`,
      blockCreated: 33377
    }
  },
  testnet: true
};

// const sepoliaETHTestnet = {
//   id: 11155111,
//   network: 'sepolia',
//   name: 'sepolia',
//   nativeCurrency: {
//     name: 'ETH',
//     symbol: 'ETH',
//     decimals: 18
//   },
//   rpcUrls: {
//     default: {
//       http: ['https://rpc.denergytestnet.com']
//     }
//   },
//   blockExplorers: {
//     default: {
//       name: 'sepolia',
//       url: 'https://sepolia.etherscan.io/'
//     }
//   },
//   contracts: {
//     ensRegistry: { address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as `0x${string}` },
//     ensUniversalResolver: {
//       address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
//       blockCreated: 33377
//     },
//     multicall3: {
//       address: '0xce5c4eeb87a3fbafb6d8865777aecc5a9bdd49da' as `0x${string}`,
//       blockCreated: 33377
//     }
//   },
//   testnet: true
// };

export enum ChainId {
  ETHEREUM = 4442,
  SEPOLIA = 11155111
}

export const CHAIN_QUERY_NAME: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: 'denergy',
  [ChainId.SEPOLIA]: 'Sepolia'
};

const CHAIN_QUERY_NAME_TO_ID = Object.entries(CHAIN_QUERY_NAME).reduce(
  (acc, [chainId, chainName]) => {
    return {
      [chainName.toLowerCase()]: chainId as unknown as ChainId,
      ...acc
    };
  },
  {} as Record<string, ChainId>
);

export const CHAINS: [AppKitNetwork, ...AppKitNetwork[]] = [denergyTestnet];

export const PUBLIC_NODES: Record<ChainId, string[] | readonly string[]> = {
  [ChainId.ETHEREUM]: [
    ...denergyTestnet.rpcUrls.default.http
    // 'https://ethereum.publicnode.com',
    // 'https://eth.llamarpc.com',
  ],
  [ChainId.SEPOLIA]: [
    ...denergyTestnet.rpcUrls.default.http
    // 'https://ethereum.publicnode.com',
    // 'https://eth.llamarpc.com',
  ]
};

export const getChainId = memoize((chainName: string) => {
  if (!chainName) return undefined;
  return CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] ? +CHAIN_QUERY_NAME_TO_ID[chainName.toLowerCase()] : undefined;
});
