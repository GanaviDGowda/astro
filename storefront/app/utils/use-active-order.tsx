import { useFetcher } from '@remix-run/react';
import { CartLoaderData } from '~/routes/api.active-order';
import { OrderDetailFragment } from '~/generated/graphql';

export function useActiveOrder(initialActiveOrder?: OrderDetailFragment | null) {
  const activeOrderFetcher = useFetcher<CartLoaderData>();

  function refresh() {
    activeOrderFetcher.load('/api/active-order');
  }

  const optimisticActiveOrder = activeOrderFetcher.data?.activeOrder;
  const activeOrder = optimisticActiveOrder ?? initialActiveOrder;

  const removeItem = (lineId: string) => {
    activeOrderFetcher.submit(
      {
        action: 'removeItem',
        lineId,
      },
      {
        method: 'post',
        action: '/api/active-order',
      },
    );
  };
  const adjustOrderLine = (lineId: string, quantity: number) => {
    activeOrderFetcher.submit(
      {
        action: 'adjustItem',
        lineId,
        quantity: quantity.toString(),
      },
      {
        method: 'post',
        action: '/api/active-order',
      },
    );
  };
  return {
    activeOrderFetcher,
    activeOrder,
    removeItem,
    adjustOrderLine,
    refresh,
  };
}
