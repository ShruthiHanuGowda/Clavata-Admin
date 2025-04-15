import { gql } from '@apollo/client';

export const LIST_COMPANY_WALLETS = gql`
  query ListAllUserWallets($nextToken: String) {
    listUserWallets(limit: 100, nextToken: $nextToken) {
      items {
        userAddress
        applicantId
        accessToken
        reviewStatus
        date
        denergyWallet
        ethereumWallet
        userWallet
        is_verified
      }
      nextToken
    }
  }
`;

export const LIST_USER_WALLETS = gql`
  query ListUserWallets($filter: TableUserWalletAddressFilterInput, $limit: Int) {
    listUserWalletAddresses(filter: $filter, limit: $limit) {
      items {
        walletAddress
        denergyWallet
        ethereumWallet
        userWallet
        is_verified
        date
      }
      nextToken
    }
  }
`;

export const LIST_NFT_WALLETS = gql`
  query {
    listMintedNfts(limit: 100) {
      items {
        assetId
        contractAddress
        createdAt
        mintedVolume
        tokenId
      }
      nextToken
    }
  }
`;

export const LIST_EVIDENT_ITEMS = gql`
  query ListEvidentItems {
    listEvidentItems {
      items {
        uid
        assetId
        availableVolume
        volume
        asset
      }
    }
  }
`;

export const LIST_TRANSACTION_HISTORY = gql`
  query ListTransactionsHistories {
    listTransactionsHistories(limit: 10) {
      items {
        transactionId
        amount
        destinationAccount
        sourceAccount
        status
        timestamp
        transactionType
      }
      nextToken
    }
  }
`;

export const LIST_NFT_COLLECTIONS = gql`
  query listNftCollections {
    listNftCollections {
      items {
        contractAddress
        collectionName
        symbol
        year
        country
        ownerAddress
        type
        createdAt
        updatedAt
      }
    }
  }
`;
