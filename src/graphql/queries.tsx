import { gql } from '@apollo/client';

export const LIST_COMPANY_WALLETS = gql`
  query ListUserWallets($nextToken: String) {
    listUserWallets(limit: 25, nextToken: $nextToken) {
      items {
        userAddress
        applicantId
        accessToken
        reviewStatus
        date
        denergyWallet
        ethereumWallet
        userWallet
        is_verified_kyb
        company_detail
      }
      nextToken
    }
  }
`;

export const LIST_USER_WALLETS = gql`
  query ListUserWallets($filter: TableUserWalletAddressFilterInput, $limit: Int) {
    listUserWalletAddresses(filter: $filter, limit: $limit) {
      items {
        emailAddress
        denergyWallet
        ethereumWallet
        applicantId
        userWallet
        is_verified
        date
        kycDetails
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

export const LIST_BENEFICIARIES = gql`
  query listAddressBooks {
    listAddressBooks {
      items {
        id
        name
        beneficiaryAddress
        walletAddress
        chain
      }
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

export const LIST_NON_MINTED_NFTS = gql`
  query ListNonMintedNfts($nextToken: String) {
    listNonMintedNfts(nextToken: $nextToken) {
      items {
        itemId
        assetId
        commissioningDate
        country
        startDate
        endDate
        facilityName
        volume
        year
      }
      nextToken
    }
  }
`;

export const LIST_NFT_PENDING_MINT_ITEMS = gql`
  query ListNftPendingMintItems($nextToken: String, $filter: TableNftPendingMintItemsFilterInput) {
    listNftPendingMintItems(nextToken: $nextToken, filter: $filter) {
      items {
        assetId
        id
        type
        volume
        updatedAt
        txHash
        tokenId
        status
        recipientWalletAddress
        createdAt
        contractAddress
      }
      nextToken
    }
  }
`;

export const UPDATE_NFT_PENDING_MINT = gql`
  mutation UpdateNftPendingMintItems($input: UpdateNftPendingMintItemsInput!) {
    updateNftPendingMintItems(input: $input) {
      id
      status
      txHash
      volume
      updatedAt
    }
  }
`;

export const GET_MINTED_NFT_BY_ASSET_ID = gql`
  query GetMintedNftByAssetId($assetId: String!) {
    getMintedNfts(assetId: $assetId) {
      assetId
      contractAddress
      tokenId
      mintedVolume
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_MINTED_NFT = gql`
  mutation CreateMintedNfts($input: CreateMintedNftsInput!) {
    createMintedNfts(input: $input) {
      assetId
      tokenId
      contractAddress
      mintedVolume
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_MINTED_NFT_BY_ASSET_ID = gql`
  mutation UpdateMintedNfts($input: UpdateMintedNftsInput!) {
    updateMintedNfts(input: $input) {
      assetId
      tokenId
      mintedVolume
      contractAddress
      createdAt
      updatedAt
    }
  }
`;
export const LIST_BLOGS = gql`
  query listBlogs {
    listBlogs {
      items {
        image_url
        id
        title
        content
        author_name
        tags
        status
      }
    }
  }
`;

export const CREATE_BLOG = gql`
  mutation createBlogs($createblogsinput: CreateBlogsInput!) {
    createBlogs(input: $createblogsinput) {
      id
      title
      image_url
      content
      author_name
      tags
      status
    }
  }
`;

export const UPDATE_BLOG = gql`
  mutation updateBlogs($updateblogsinput: UpdateBlogsInput!) {
    updateBlogs(input: $updateblogsinput) {
      id
      title
      image_url
      content
      author_name
      tags
      status
    }
  }
`;

export const DELETE_BLOG = gql`
  mutation deleteBlogs($input: DeleteBlogsInput!) {
    deleteBlogs(input: $input) {
      id
    }
  }
`;

export const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: String!) {
    getBlogs(id: $id) {
      id
      image_url
      title
      content
      author_name
      tags
      status
    }
  }
`;

export const LIST_PLATFORM_SETTINGS = gql`
  query listPlatformSettings {
    listPlatformSettings {
      items {
        pId
        keyName
        value
      }
    }
  }
`;

export const UPDATE_PLATFORM_SETTINGS = gql`
  mutation UpdatePlatformSettings($input: UpdatePlatformSettingsInput!) {
    updatePlatformSettings(input: $input) {
      pId
      keyName
      value
    }
  }
`;
