import type { SourceSelection, SourceSummary } from '../types';

export const DATA_SCOPES = [
  'Live Telemetry & Clickbaits',
  'Product Views & Dwell Times',
  'Transactions, Cart & Orders',
  'User Sessions & Identifiers'
];

export const SOURCE_INFO: Record<string, SourceSummary> = {
  ShopPulse: {
    id: 'ShopPulse',
    name: 'ShopPulse Store',
    type: 'Consumer E-Commerce (Port 3000)',
    description: 'Active storefront with real-time user clickstream, products, cart events, and order tracking.',
    availableRecords: 0,
    dataAvailable: DATA_SCOPES,
    status: 'Connected',
    icon: 'ShoppingBag',
    primaryColor: '#A068FF'
  },
  TechMart: {
    id: 'TechMart',
    name: 'TechMart Electronics',
    type: 'High-Tech Hardware Hub (Port 5174)',
    description: 'Active electronics store streaming live catalog browsing, clickbaits, user logins, and order checkouts.',
    availableRecords: 0,
    dataAvailable: DATA_SCOPES,
    status: 'Connected',
    icon: 'Cpu',
    primaryColor: '#00F0FF'
  }
};

export const extractionService = {
  getAvailableDataTypes(_source?: SourceSelection): string[] {
    return DATA_SCOPES;
  },

  getSourceSummary(source: SourceSelection): SourceSummary {
    if (source === 'TechMart') return SOURCE_INFO.TechMart;
    return SOURCE_INFO.ShopPulse;
  }
};
