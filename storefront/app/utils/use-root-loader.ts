import { useMatches } from '@remix-run/react';
import { loader as rootLoader, RootLoaderData } from '~/root';
import { CurrencyCode } from '~/generated/graphql';

export function useRootLoader(): RootLoaderData {
  const rootMatch = useMatches().find((match) => match.id === 'root');
  if (!rootMatch || !rootMatch.data) {
    // Return default values when loader data is not available
    return {
      activeCustomer: { activeCustomer: null, _headers: new Headers() },
      activeChannel: { __typename: 'Channel' as const, id: '', currencyCode: CurrencyCode.Usd },
      collections: [],
      locale: 'en',
    } as RootLoaderData;
  }
  // Handle DataWithResponseInit wrapper
  const data = rootMatch.data as any;
  if (data.type === 'DataWithResponseInit') {
    return data.data as RootLoaderData;
  }
  return data as RootLoaderData;
}
