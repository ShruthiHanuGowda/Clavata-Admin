export function getBlockExploreLink(
  data: string | number | undefined | null,
  type?: 'transaction' | 'token' | 'address' | 'block' | 'countdown'
): string {
  const explorersUrl = 'https://explorer.denergytestnet.com/';
  switch (type) {
    case 'transaction': {
      return `${explorersUrl}/tx/${data}`;
    }
    case 'token': {
      return `${explorersUrl}/token/${data}`;
    }
    case 'block': {
      return `${explorersUrl}/block/${data}`;
    }
    case 'countdown': {
      return `${explorersUrl}/block/countdown/${data}`;
    }
    default: {
      return `${explorersUrl}/address/${data}`;
    }
  }
}
