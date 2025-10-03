export interface Chart {
  id: string;
  title: string;
  [key: string]: unknown;
}

export interface CounterData {
  isLoss: boolean;
  id: string;
  title: string;
  info?: string;
  count: number;
}

export interface StatsData {
  total_transactions?: string | number;
  transactions_today?: string | number;
  total_addresses?: string | number;
  newAccountsIN24Hours?: string | number;
  coin_price?: string | number;
}

export interface ChartSection {
  id: AnalyticsKey;
  title: string;
  charts: Chart[];
}

export interface RawCounter {
  id?: string;
  title?: string;
  description?: string;
  value?: string | number;
}

export interface RawChartSection {
  id?: string;
  title?: string;
  [key: string]: unknown;
}

export type AnalyticsKey = 'accounts' | 'transactions' | 'blocks' | 'tokens' | 'gas' | 'contracts' | 'wattCoin';
