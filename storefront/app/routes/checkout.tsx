import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link, Outlet, useLocation, useOutletContext } from '@remix-run/react';
import { CartContents } from '~/components/cart/CartContents';
import { OutletContext } from '~/types';
import { classNames } from '~/utils/class-names';
import { CartTotals } from '~/components/cart/CartTotals';
import { useTranslation } from 'react-i18next';

const steps = ['shipping', 'payment', 'confirmation'];
const stepRoutes: Record<(typeof steps)[number], string | undefined> = {
  shipping: '/checkout',
  payment: '/checkout/payment',
  confirmation: undefined,
};

export default function Checkout() {
  const outletContext = useOutletContext<OutletContext>();
  const { activeOrder, adjustOrderLine, removeItem } = outletContext;
  const location = useLocation();
  const { t } = useTranslation();

  let state = 'shipping';
  if (location.pathname === '/checkout/payment') {
    state = 'payment';
  } else if (location.pathname.startsWith('/checkout/confirmation')) {
    state = 'confirmation';
  }
  let isConfirmationPage = state === 'confirmation';

  return (
    <div className="bg-[radial-gradient(circle_at_top,_#fffdfb,_#f5f7fb_45%,_#eef2f7_100%)]">
      <div
        className={classNames(
          isConfirmationPage ? 'lg:max-w-3xl mx-auto' : 'lg:max-w-7xl',
          'max-w-2xl mx-auto pt-10 pb-24 px-4 sm:px-6 lg:px-8',
        )}
      >
        <h2 className="sr-only">{t('cart.checkout')}</h2>
        <nav
          aria-label={t('cart.progress')}
          className="hidden sm:block mb-8 rounded-2xl border border-primary-100 bg-white/90 px-5 py-4 shadow-sm backdrop-blur"
        >
          <ol role="list" className="flex flex-wrap items-center justify-center gap-3">
            {steps.map((step, stepIdx) => {
              const isActive = step === state;
              const isCompleted = stepIdx < steps.indexOf(state);
              const stepLabel = t(`checkout.steps.${step}`);
              const stepRoute = stepRoutes[step as (typeof steps)[number]];
              const stepContent = (
                <>
                  <span
                    className={classNames(
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600',
                      'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                    )}
                  >
                    {stepIdx + 1}
                  </span>
                  {isActive ? (
                    <span
                      aria-current="page"
                      className="ml-3 font-medium text-primary-700"
                    >
                      {stepLabel}
                    </span>
                  ) : (
                    <span className="ml-3 text-gray-600">{stepLabel}</span>
                  )}
                </>
              );

              return (
              <li key={step} className="flex items-center">
                {stepRoute ? (
                  <Link
                    to={stepRoute}
                    prefetch="intent"
                    className="flex items-center transition-opacity hover:opacity-80"
                  >
                    {stepContent}
                  </Link>
                ) : (
                  <span className="flex items-center">
                    {stepContent}
                  </span>
                )}

                {stepIdx !== steps.length - 1 ? (
                  <ChevronRightIcon
                    className="w-5 h-5 text-gray-300 ml-4"
                    aria-hidden="true"
                  />
                ) : null}
              </li>
              );
            })}
          </ol>
        </nav>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <div className={isConfirmationPage ? 'lg:col-span-2' : ''}>
            <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
              <Outlet context={outletContext} />
            </div>
          </div>

          {/* Order summary */}
          {!isConfirmationPage && (
            <div className="mt-10 lg:mt-0">
              <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8 lg:sticky lg:top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                {t('order.summary')}
                </h2>

                <CartContents
                  orderLines={activeOrder?.lines ?? []}
                  currencyCode={activeOrder?.currencyCode!}
                  editable={state === 'shipping'}
                  removeItem={removeItem}
                  adjustOrderLine={adjustOrderLine}
                ></CartContents>
                <CartTotals order={activeOrder}></CartTotals>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
