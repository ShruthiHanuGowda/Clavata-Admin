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
  query listNft($contractAddress: String) {
    listMintedNfts(filter: { contractAddress: { contains: $contractAddress } }) {
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

export const LIST_DTERMINAL_TRANSACTION_HISTORY = gql`
  query ListAllTransactions {
    listDterminalTransactionHistories(limit: 10) {
      items {
        transactionHash
        method
        block
        age
        from
        to
        amount
        txnFee
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

export const LIST_AIRDROP_COLLECTIONS = gql`
  query ListAirdropClaims {
    listAirdropClaims {
      items {
        walletAddress
        amount
        claimedAt
        txHash
      }
      nextToken
    }
  }
`;

export const LIST_TRANSACTION_HISTORY_MOBILE = gql`
  query ListTransactionsHistories {
    listTransactionHistoryMobiles {
      items {
        amount
        coinCode
        createdAt
        from
        method
        to
        transactionHash
        transactionStatus
        txnFee
      }
    }
  }
`;
