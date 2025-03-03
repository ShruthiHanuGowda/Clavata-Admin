import { gql } from "@apollo/client";

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

