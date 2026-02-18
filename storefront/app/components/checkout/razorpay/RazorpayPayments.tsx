import { useEffect, useState } from 'react';
import { useSubmit } from '@remix-run/react';
import { CurrencyCode } from '~/generated/graphql';
import { classNames } from '~/utils/class-names';
import { useTranslation } from 'react-i18next';
import { themeColors } from '~/theme/tokens';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      on: (event: string, handler: (response: any) => void) => void;
      open: () => void;
    };
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayPayments(props: {
  orderCode: string;
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currencyCode: CurrencyCode;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;
}) {
  const {
    orderCode,
    razorpayOrderId,
    keyId,
    amount,
    currencyCode,
    customerName,
    customerEmail,
    customerContact,
  } = props;
  const { t } = useTranslation();
  const submit = useSubmit();

  const [ready, setReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    loadRazorpayScript().then((loaded) => {
      if (!isMounted) {
        return;
      }
      if (loaded) {
        setReady(true);
      } else {
        setLoadError(t('checkout.paymentErrorMessage'));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [t]);

  const openCheckout = () => {
    if (!ready || !window.Razorpay) {
      setLoadError(t('checkout.paymentErrorMessage'));
      return;
    }
    if (!razorpayOrderId || !keyId) {
      setLoadError(t('checkout.paymentErrorMessage'));
      return;
    }

    setProcessing(true);

    const options = {
      key: keyId,
      order_id: razorpayOrderId,
      amount,
      currency: currencyCode.toString(),
      name: 'Rakshalokam',
      description: `Order ${orderCode}`,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerContact,
      },
      notes: {
        orderCode,
      },
      handler: (response: {
        razorpay_payment_id?: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) => {
        const formData = new FormData();
        formData.set('paymentMethodCode', 'razorpay');
        formData.set(
          'paymentMetadata',
          JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        );
        submit(formData, { method: 'post' });
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
      theme: {
        color: themeColors.razorpayTheme,
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      setLoadError(
        response?.error?.description ?? t('checkout.paymentErrorMessage'),
      );
      setProcessing(false);
    });
    razorpay.open();
  };

  const isDisabled = !ready || !razorpayOrderId || !keyId || processing;

  return (
    <div className="w-full">
      <button
        onClick={openCheckout}
        className={classNames(
          !isDisabled ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400',
          'flex w-full items-center justify-center space-x-2 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        )}
        disabled={isDisabled}
      >
        {processing
          ? t('checkout.paymentProcessing')
          : !ready
          ? t('checkout.paymentLoading')
          : `${t('checkout.payWith')} Razorpay`}
      </button>
      {loadError ? (
        <p className="mt-2 text-sm text-red-700">{loadError}</p>
      ) : null}
    </div>
  );
}
