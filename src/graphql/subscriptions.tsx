import { gql } from '@apollo/client';

export const ON_CREATE_EVIDENT_ITEM = gql`
  subscription OnCreateEvidentItems {
    onCreateEvidentItems {
      uid
      asset
      volume
    }
  }
`;

export const ON_UPDATE_EVIDENT_ITEM = gql`
  subscription OnUpdateEvidentItems {
    onUpdateEvidentItems {
      uid
      assetQ
      volume
    }
  }
`;

export const ON_DELETE_EVIDENT_ITEM = gql`
  subscription OnDeleteEvidentItems {
    onDeleteEvidentItems {
      uid
    }
  }
`;
