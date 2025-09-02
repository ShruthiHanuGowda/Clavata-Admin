// material-ui
import { TableCellProps } from '@mui/material/TableCell';

// project import
import { KeyedObject } from './root';
import { Gender } from 'config';

// types

export type ArrangementOrder = 'asc' | 'desc' | undefined;

export type GetComparator = (o: ArrangementOrder, o1: string) => (a: KeyedObject, b: KeyedObject) => number;

export interface EnhancedTableHeadProps extends TableCellProps {
  onSelectAllClick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  order: ArrangementOrder;
  orderBy?: string;
  numSelected: number;
  rowCount: number;
  onRequestSort: (e: React.SyntheticEvent, p: string) => void;
}

export type HeadCell = {
  id: string;
  numeric: boolean;
  label: string;
  disablePadding?: string | boolean | undefined;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
};

export type TableDataApiResponse = {
  data: TableDataProps[];
  meta: {
    totalRowCount: number;
  };
};

export type TableDataProps = {
  applicantId: string;
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherName: string;
  email: string;
  age: number;
  gender: Gender;
  role: string;
  visits: number;
  progress: number;
  status: string;
  orderStatus: string;
  contact: string;
  country: string;
  address: string;
  about: string;
  avatar: number;
  skills: string[];
  time: string[];
  validatorId: string;
};

export interface AddressBookItem {
  id: string;
  name: string;
  walletAddress: string;
  beneficiaryAddress: string;
  chain: string;
}
export type KYCDetails = {
  info?: {
    firstName?: string;
    lastName?: string;
    fatherName?: string;
    dob?: string;
    country?: string;
  };
  fullResponse?: {
    info?: {
      firstName?: string;
      lastName?: string;
      dob?: string;
      country?: string;
    };
    fixedInfo?: {
      nationality?: string;
    };
    review?: {
      reviewResult?: {
        reviewAnswer?: string;
      };
    };
  };
  email?: string;
  ipCountry?: string;
};

export type UserWallet = {
  id: string;
  emailAddress: string;
  userWallet: string;
  denergyWallet?: string;
  ethereumWallet?: string;
  applicantId?: string;
  is_verified?: boolean;
  reviewStatus?: string;
  date?: string;
  kycDetails?: string | KYCDetails;
};

export type UserTableRow = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  fatherName: string;
  email?: string;
  wallet_address?: string;
  denergyWallet?: string;
  ethereumWallet?: string;
  applicantId?: string;
  is_verified?: boolean;
  reviewStatus?: string;
  date?: string;
  kycDetails?: KYCDetails | null;
};

export type ListUserWalletsResponse = {
  listUserWalletAddresses: {
    items: UserWallet[];
    nextToken: string | null;
  };
};

export interface AddressBookResponse {
  listAddressBooks: {
    items: AddressBookItem[];
    nextToken: string | null;
  };
}

export type AirdropClaim = {
  id: string;
  txHash: string;
  walletAddress: string;
  claimedAt: string;
  amount: string;
};

export type ListAirdropClaimsResponse = {
  listAirdropClaims: {
    items: AirdropClaim[];
    nextToken: string | null;
  };
};
export interface CompanyInfo {
  companyName?: string;
  registrationNumber?: string;
  countryOfIncorporation?: string;
  [key: string]: unknown;
}
export interface CompanyTableRow {
  id: string | number;
  email: string;
  wallet_address: string;
  denergyWallet?: string;
  ethereumWallet?: string;
  applicantId?: string;
  is_verified_kyb?: boolean;
  reviewStatus?: string;
  date?: string;
  company_detail?: CompanyInfo;
}

export type RawUserCompanyWallet = {
  id?: string;
  userAddress: string;
  userWallet: string;
  denergyWallet?: string;
  ethereumWallet?: string;
  applicantId?: string;
  is_verified_kyb?: boolean;
  reviewStatus?: string;
  date?: string;
  company_detail?:
    | string
    | {
        fullResponse?: {
          fixedInfo?: {
            companyInfo?: CompanyInfo;
          };
        };
      };
};

export type ListCompanyResponse = {
  listUserWallets?: {
    items: RawUserCompanyWallet[];
    nextToken: string | null;
  };
};

export type TransactionHistoryItem = {
  id: string;
  amount: string;
  destinationAccount: string;
  sourceAccount: string;
  status: string;
  timestamp: string;
  transactionId: string;
  transactionType: string;
};

export type ListTransactionHistoryResponse = {
  listTransactionsHistories?: {
    items: TransactionHistoryItem[];
    nextToken: string | null;
  };
};

export type DTerminalTransactionItem = {
  transactionHash: string;
  method: string;
  age: string;
  from: string;
  to: string;
  amount: string;
  txnFee: string;
};

export type ListDTerminalTransactionHistoryResponse = {
  listDterminalTransactionHistories?: {
    items: DTerminalTransactionItem[];
    nextToken: string | null;
  };
};

export type MintedNft = {
  id: string;
  assetId: string;
  contractAddress: string;
  createdAt: string;
  mintedVolume: string;
  tokenId: string;
};

export type ListMintedNftsResponse = {
  listMintedNfts?: {
    items: MintedNft[];
    nextToken: string | null;
  };
};
