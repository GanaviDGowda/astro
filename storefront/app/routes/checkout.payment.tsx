import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import {
  addPaymentToOrder,
  generateRazorpayOrderId,
  generateBraintreeClientToken,
  getEligiblePaymentMethods,
  getNextOrderStates,
  transitionOrderToState,
} from '~/providers/checkout/checkout';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { OutletContext } from '~/types';
import { CurrencyCode, ErrorCode, ErrorResult } from '~/generated/graphql';
import { RazorpayPayments } from '~/components/checkout/razorpay/RazorpayPayments';
import { DummyPayments } from '~/components/checkout/DummyPayments';
import { BraintreeDropIn } from '~/components/checkout/braintree/BraintreePayments';
import { getActiveOrder } from '~/providers/orders/order';
import { getSessionStorage } from '~/sessions';
import { useTranslation } from 'react-i18next';

export async function loader({ params, request }: DataFunctionArgs) {
  const session = await getSessionStorage().then((sessionStorage) =>
    sessionStorage.getSession(request?.headers.get('Cookie')),
  );
  const activeOrder = await getActiveOrder({ request });

  //check if there is an active order if not redirect to homepage
  if (
    !session ||
    !activeOrder ||
    !activeOrder.active ||
    activeOrder.lines.length === 0
  ) {
    return redirect('/');
  }

  const { eligiblePaymentMethods } = await getEligiblePaymentMethods({
    request,
  });
  const error = session.get('activeOrderError');
  let razorpayOrderId: string | undefined;
  let razorpayKeyId: string | undefined;
  let razorpayError: string | undefined;
  if (eligiblePaymentMethods.find((method) => method.code.includes('razorpay'))) {
    try {
      const { nextOrderStates } = await getNextOrderStates({
        request,
      });
      if (nextOrderStates.includes('ArrangingPayment')) {
        const transitionResult = await transitionOrderToState(
          'ArrangingPayment',
          { request },
        );
        if (transitionResult.transitionOrderToState?.__typename !== 'Order') {
          throw new Error(
            transitionResult.transitionOrderToState?.message ??
              'Unable to transition order to ArrangingPayment',
          );
        }
      }

      if (!activeOrder?.id) {
        throw new Error('No active order found');
      }

      const razorpayOrderIdResult = await generateRazorpayOrderId(
        activeOrder.id,
        { request },
      );
      const result = razorpayOrderIdResult.generateRazorpayOrderId;
      if (result.__typename === 'RazorpayOrderIdSuccess') {
        razorpayOrderId = result.razorpayOrderId;
      } else {
        razorpayError = result.message;
      }

      razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        razorpayError = 'RAZORPAY_KEY_ID is not set';
      }
    } catch (e: any) {
      razorpayError = e.message;
    }
  }

  let brainTreeKey: string | undefined;
  let brainTreeError: string | undefined;
  if (
    eligiblePaymentMethods.find((method) => method.code.includes('braintree'))
  ) {
    try {
      const generateBrainTreeTokenResult = await generateBraintreeClientToken({
        request,
      });
      brainTreeKey =
        generateBrainTreeTokenResult.generateBraintreeClientToken ?? '';
    } catch (e: any) {
      brainTreeError = e.message;
    }
  }
  return json({
    eligiblePaymentMethods,
    razorpayOrderId,
    razorpayKeyId,
    razorpayError,
    brainTreeKey,
    brainTreeError,
    error,
  });
}

export async function action({ params, request }: DataFunctionArgs) {
  const body = await request.formData();
  const paymentMethodCode = body.get('paymentMethodCode');
  const paymentNonce = body.get('paymentNonce');
  const paymentMetadata = body.get('paymentMetadata');
  if (typeof paymentMethodCode === 'string') {
    const { nextOrderStates } = await getNextOrderStates({
      request,
    });
    if (nextOrderStates.includes('ArrangingPayment')) {
      const transitionResult = await transitionOrderToState(
        'ArrangingPayment',
        { request },
      );
      if (transitionResult.transitionOrderToState?.__typename !== 'Order') {
        throw new Response('Not Found', {
          status: 400,
          statusText: transitionResult.transitionOrderToState?.message,
        });
      }
    }

    let metadata: any = {};
    if (typeof paymentMetadata === 'string') {
      const trimmed = paymentMetadata.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          metadata = JSON.parse(trimmed);
        } catch {
          metadata = trimmed;
        }
      } else {
        metadata = trimmed;
      }
    } else if (typeof paymentNonce === 'string') {
      metadata = { nonce: paymentNonce };
    }

    const result = await addPaymentToOrder(
      { method: paymentMethodCode, metadata },
      { request },
    );
    if (result.addPaymentToOrder.__typename === 'Order') {
      return redirect(
        `/checkout/confirmation/${result.addPaymentToOrder.code}`,
      );
    } else {
      throw new Response('Not Found', {
        status: 400,
        statusText: result.addPaymentToOrder?.message,
      });
    }
  }
}

export default function CheckoutPayment() {
  const {
    eligiblePaymentMethods,
    razorpayOrderId,
    razorpayKeyId,
    razorpayError,
    brainTreeKey,
    brainTreeError,
    error,
  } = useLoaderData<typeof loader>();
  const { activeOrderFetcher, activeOrder } = useOutletContext<OutletContext>();
  const { t } = useTranslation();

  const paymentError = getPaymentError(error);

  return (
    <div className="flex flex-col items-center divide-gray-200 divide-y">
      {eligiblePaymentMethods.map((paymentMethod) =>
        paymentMethod.code.includes('braintree') ? (
          <div className="py-3 w-full" key={paymentMethod.id}>
            {brainTreeError ? (
              <div>
                <p className="text-red-700 font-bold">
                  {t('checkout.braintreeError')}
                </p>
                <p className="text-sm">{brainTreeError}</p>
              </div>
            ) : (
              <BraintreeDropIn
                fullAmount={activeOrder?.totalWithTax ?? 0}
                currencyCode={
                  activeOrder?.currencyCode ?? ('USD' as CurrencyCode)
                }
                show={true}
                authorization={brainTreeKey!}
              />
            )}
          </div>
        ) : paymentMethod.code.includes('razorpay') ? (
          <div className="py-12" key={paymentMethod.id}>
            {razorpayError ? (
              <div>
                <p className="text-red-700 font-bold">
                  {t('checkout.razorpayError')}
                </p>
                <p className="text-sm">{razorpayError}</p>
              </div>
            ) : (
              <RazorpayPayments
                orderCode={activeOrder?.code ?? ''}
                razorpayOrderId={razorpayOrderId!}
                keyId={razorpayKeyId!}
                amount={activeOrder?.totalWithTax ?? 0}
                currencyCode={
                  activeOrder?.currencyCode ?? ('INR' as CurrencyCode)
                }
                customerName={
                  activeOrder?.customer
                    ? `${activeOrder.customer.firstName ?? ''} ${activeOrder.customer.lastName ?? ''}`.trim()
                    : undefined
                }
                customerEmail={activeOrder?.customer?.emailAddress ?? undefined}
                customerContact={
                  activeOrder?.shippingAddress?.phoneNumber ?? undefined
                }
              ></RazorpayPayments>
            )}
          </div>
        ) : (
          <div className="py-12" key={paymentMethod.id}>
            <DummyPayments
              paymentMethod={paymentMethod}
              paymentError={paymentError}
            />
          </div>
        ),
      )}
    </div>
  );
}

function getPaymentError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderPaymentStateError:
    case ErrorCode.IneligiblePaymentMethodError:
    case ErrorCode.PaymentFailedError:
    case ErrorCode.PaymentDeclinedError:
    case ErrorCode.OrderStateTransitionError:
    case ErrorCode.NoActiveOrderError:
      return error.message;
  }
}
