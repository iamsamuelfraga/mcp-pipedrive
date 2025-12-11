import type { PipedriveClient } from '../../pipedrive-client.js';

export function getListCurrenciesTool(client: PipedriveClient) {
  return {
    'system/list_currencies': {
      description: `Get list of supported currencies and exchange rates.

Returns all currencies configured in your Pipedrive account, including:
- Currency codes (USD, EUR, GBP, etc.)
- Currency symbols and names
- Exchange rates relative to account's default currency
- Whether currency is active
- Decimal precision

This is essential for working with monetary fields and understanding currency conversions in deals and products.

Cached for 24 hours as currency rates don't change frequently in Pipedrive configuration.

Response includes array of currencies with:
- id: Currency ID
- code: ISO 4217 currency code (e.g., "USD", "EUR")
- name: Full currency name (e.g., "US Dollar")
- symbol: Currency symbol (e.g., "$", "€")
- decimal_points: Number of decimal places
- is_custom_flag: Whether it's a custom currency
- active_flag: Whether currency is active

Common use cases:
- Get supported currencies before creating deals
- Validate currency codes for monetary fields
- Understand exchange rates for reporting
- Check which currencies are active in the account`,
      inputSchema: {
        type: 'object' as const,
        properties: {},
        required: [],
      },
      handler: async () => {
        return client.get('/currencies', undefined, {
          enabled: true,
          ttl: 86400000, // 24 hours
        });
      },
    },
  };
}
