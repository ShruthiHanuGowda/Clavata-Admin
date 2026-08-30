import { gql } from '@apollo/client';

export const ADMIN_CUSTOMERS = gql`
    query AdminCustomers(
        $search: String
        $status: CustomerStatus
    ) {
        adminCustomers(
            search: $search
            status: $status
        ) {
            success
            message
            totalCount

            customers {
                userId
                fullName
                phoneNumber
                email

                activeRole
                providerStatus
                salonId
                status

                totalBookings
                completedBookings
                cancelledBookings
                totalSpent
                lastBooking

                createdAt
                updatedAt
            }
        }
    }
`;

export const ADMIN_SALONS = gql`
  query AdminSalons(
    $search: String
    $kycStatus: KycStatus
    $salonStatus: SalonStatus
    $isActive: Boolean
  ) {
    adminSalons(
      search: $search
      kycStatus: $kycStatus
      salonStatus: $salonStatus
      isActive: $isActive
    ) {
      success
      message
      totalCount

      salons {
        salonId
        ownerUserId
        salonName
        ownerName
        businessType
        ownerPhoneNumber
        alternatePhone
        email

        address {
          addressLine
          city
          state
          pincode
        }

        latitude
        longitude

        gstNumber
        panNumber
        aadhaarNumber

        bankAccount
        ifsc
        accountHolderName

        logoUrl
        coverImageUrl
        galleryImages

        kycStatus
        salonStatus

        isActive
        isVisible
        isDeleted

        averageRating
        totalReviews
        totalAppointments
        totalCompletedAppointments
        totalCancelledAppointments
        totalRevenue

        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        rejectionReason

        lastUpdatedBy
        createdAt
        updatedAt
      }
    }
  }
`;
// export const LIST_COMPANY_WALLETS = gql`
//   query ListUserWallets($limit: Int, $nextToken: String, $filter: TableUserWalletsFilterInput) {
//     listUserWallets(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         userAddress
//         applicantId
//         accessToken
//         reviewStatus
//         date
//         denergyWallet
//         ethereumWallet
//         userWallet
//         is_verified_kyb
//         company_detail
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_USER_WALLETS = gql`
//   query ListUserWallets($filter: TableUserWalletAddressFilterInput, $limit: Int, $nextToken: String) {
//     listUserWalletAddresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
//       items {
//         emailAddress
//         denergyWallet
//         ethereumWallet
//         applicantId
//         userWallet
//         is_verified
//         date
//         kycDetails
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_NFT_WALLETS = gql`
//   query listNft($contractAddress: String, $limit: Int, $nextToken: String) {
//     listMintedNfts(limit: $limit, nextToken: $nextToken, filter: { contractAddress: { contains: $contractAddress } }) {
//       items {
//         assetId
//         contractAddress
//         createdAt
//         mintedVolume
//         tokenId
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_EVIDENT_ITEMS = gql`
//   query ListEvidentItems($limit: Int, $nextToken: String, $filter: TableEvidentItemsFilterInput) {
//     listEvidentItems(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         uid
//         assetId
//         availableVolume
//         volume
//         asset
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_TRANSACTION_HISTORY = gql`
//   query ListTransactionsHistories($filter: TableTransactionsHistoryFilterInput, $limit: Int, $nextToken: String) {
//     listTransactionsHistories(filter: $filter, limit: $limit, nextToken: $nextToken) {
//       items {
//         transactionId
//         amount
//         destinationAccount
//         sourceAccount
//         status
//         timestamp
//         transactionType
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_DTERMINAL_TRANSACTION_HISTORY = gql`
//   query ListAllTransactions($limit: Int, $nextToken: String, $filter: TableDterminalTransactionHistoryFilterInput) {
//     listDterminalTransactionHistories(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         transactionHash
//         method
//         age
//         from
//         to
//         amount
//         txnFee
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_NFT_COLLECTIONS = gql`
//   query listNftCollections($limit: Int, $nextToken: String, $filter: TableNftCollectionsFilterInput) {
//     listNftCollections(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         contractAddress
//         collectionName
//         collection_image
//         country_image
//         energy_type_image
//         symbol
//         year
//         country
//         ownerAddress
//         type
//         createdAt
//         updatedAt
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_AIRDROP_COLLECTIONS = gql`
//   query ListAirdropClaims($limit: Int, $nextToken: String, $filter: TableAirdropClaimsFilterInput) {
//     listAirdropClaims(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         walletAddress
//         amount
//         claimedAt
//         txHash
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_BENEFICIARIES = gql`
//   query listAddressBooks($limit: Int, $nextToken: String, $filter: TableAddressBookFilterInput) {
//     listAddressBooks(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         id
//         name
//         beneficiaryAddress
//         walletAddress
//         chain
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_TRANSACTION_HISTORY_MOBILE = gql`
//   query ListTransactionsHistories($limit: Int, $nextToken: String, $filter: TableTransactionHistoryMobileFilterInput) {
//     listTransactionHistoryMobiles(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         amount
//         coinCode
//         createdAt
//         from
//         method
//         to
//         transactionHash
//         transactionStatus
//         txnFee
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_NON_MINTED_NFTS = gql`
//   query ListNonMintedNfts($limit: Int, $nextToken: String, $filter: TableNonMintedNftsFilterInput) {
//     listNonMintedNfts(limit: $limit, nextToken: $nextToken, filter: $filter) {
//       items {
//         itemId
//         assetId
//         commissioningDate
//         country
//         startDate
//         endDate
//         facilityName
//         volume
//         year
//       }
//       nextToken
//     }
//   }
// `;

// export const LIST_NFT_PENDING_MINT_ITEMS = gql`
//   query ListGroupedNftPendingMintItems($limit: Int, $nextToken: String, $searchTerm: String) {
//     listGroupedNftPendingMintItems(limit: $limit, nextToken: $nextToken, searchTerm: $searchTerm) {
//       items {
//         assetId
//         items {
//           assetId
//           id
//           type
//           volume
//           updatedAt
//           txHash
//           tokenId
//           status
//           recipientWalletAddress
//           createdAt
//           contractAddress
//         }
//         recipientWalletAddress
//       }
//       nextToken
//     }
//   }
// `;

// export const UPDATE_NFT_PENDING_MINT = gql`
//   mutation UpdateNftPendingMintItems($input: UpdateNftPendingMintItemsInput!) {
//     updateNftPendingMintItems(input: $input) {
//       id
//       status
//       txHash
//       volume
//       updatedAt
//     }
//   }
// `;

// export const GET_MINTED_NFT_BY_ASSET_ID = gql`
//   query GetMintedNftByAssetId($assetId: String!) {
//     getMintedNfts(assetId: $assetId) {
//       assetId
//       contractAddress
//       tokenId
//       mintedVolume
//       createdAt
//       updatedAt
//     }
//   }
// `;

// export const CREATE_MINTED_NFT = gql`
//   mutation CreateMintedNfts($input: CreateMintedNftsInput!) {
//     createMintedNfts(input: $input) {
//       assetId
//       tokenId
//       contractAddress
//       mintedVolume
//       createdAt
//       updatedAt
//     }
//   }
// `;

// export const UPDATE_MINTED_NFT_BY_ASSET_ID = gql`
//   mutation UpdateMintedNfts($input: UpdateMintedNftsInput!) {
//     updateMintedNfts(input: $input) {
//       assetId
//       tokenId
//       mintedVolume
//       contractAddress
//       createdAt
//       updatedAt
//     }
//   }
// `;
// export const LIST_BLOGS = gql`
//   query listBlogs($limit: Int, $nextToken: String) {
//     listBlogs(limit: $limit, nextToken: $nextToken) {
//       items {
//         image_url
//         id
//         title
//         content
//         author_name
//         tags
//         status
//       }
//       nextToken
//     }
//   }
// `;

// export const CREATE_BLOG = gql`
//   mutation createBlogs($createblogsinput: CreateBlogsInput!) {
//     createBlogs(input: $createblogsinput) {
//       id
//       title
//       image_url
//       content
//       author_name
//       tags
//       status
//     }
//   }
// `;

// export const UPDATE_BLOG = gql`
//   mutation updateBlogs($updateblogsinput: UpdateBlogsInput!) {
//     updateBlogs(input: $updateblogsinput) {
//       id
//       title
//       image_url
//       content
//       author_name
//       tags
//       status
//     }
//   }
// `;

// export const DELETE_BLOG = gql`
//   mutation deleteBlogs($input: DeleteBlogsInput!) {
//     deleteBlogs(input: $input) {
//       id
//     }
//   }
// `;

// export const GET_BLOG_BY_ID = gql`
//   query GetBlogById($id: String!) {
//     getBlogs(id: $id) {
//       id
//       image_url
//       title
//       content
//       author_name
//       tags
//       status
//     }
//   }
// `;

// export const LIST_PLATFORM_SETTINGS = gql`
//   query listPlatformSettings {
//     listPlatformSettings {
//       items {
//         pId
//         keyName
//         value
//       }
//     }
//   }
// `;

// export const UPDATE_PLATFORM_SETTINGS = gql`
//   mutation UpdatePlatformSettings($input: UpdatePlatformSettingsInput!) {
//     updatePlatformSettings(input: $input) {
//       pId
//       keyName
//       value
//     }
//   }
// `;
