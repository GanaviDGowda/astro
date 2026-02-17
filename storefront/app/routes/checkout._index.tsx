import { FormEvent, useState } from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import {
  Form,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from '@remix-run/react';
import { OutletContext } from '~/types';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import {
  getAvailableCountries,
  getEligibleShippingMethods,
} from '~/providers/checkout/checkout';
import { shippingFormDataIsValid } from '~/utils/validation';
import { getSessionStorage } from '~/sessions';
import { classNames } from '~/utils/class-names';
import {
  getActiveCustomerAddresses,
  getActiveCustomerDetails,
} from '~/providers/customer/customer';
import { AddressForm } from '~/components/account/AddressForm';
import { ShippingMethodSelector } from '~/components/checkout/ShippingMethodSelector';
import { ShippingAddressSelector } from '~/components/checkout/ShippingAddressSelector';
import { getActiveOrder } from '~/providers/orders/order';
import { useTranslation } from 'react-i18next';

export async function loader({ request }: DataFunctionArgs) {
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
  const [
    { availableCountries },
    { eligibleShippingMethods },
    { activeCustomer: activeCustomerAddresses },
    { activeCustomer: activeCustomerDetails },
  ] = await Promise.all([
    getAvailableCountries({ request }),
    getEligibleShippingMethods({ request }),
    getActiveCustomerAddresses({ request }),
    getActiveCustomerDetails({ request }),
  ]);
  const error = session.get('activeOrderError');
  return json({
    availableCountries,
    eligibleShippingMethods,
    activeCustomerAddresses,
    activeCustomerDetails,
    error,
  });
}

export default function CheckoutShipping() {
  const {
    availableCountries,
    eligibleShippingMethods,
    activeCustomerAddresses,
    activeCustomerDetails,
    error,
  } = useLoaderData<typeof loader>();
  const { activeOrderFetcher, activeOrder } = useOutletContext<OutletContext>();
  const [customerFormChanged, setCustomerFormChanged] = useState(false);
  const [addressFormChanged, setAddressFormChanged] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  let navigate = useNavigate();
  const { t } = useTranslation();

  const { customer, shippingAddress } = activeOrder ?? {};
  const isSignedIn = !!activeCustomerDetails?.id;
  const addresses = activeCustomerAddresses?.addresses ?? [];
  const contactFirstName =
    customer?.firstName ?? activeCustomerDetails?.firstName ?? '';
  const contactLastName =
    customer?.lastName ?? activeCustomerDetails?.lastName ?? '';
  const contactEmail =
    customer?.emailAddress ?? activeCustomerDetails?.emailAddress ?? '';
  const contactFullName = `${contactFirstName} ${contactLastName}`.trim();
  const defaultFullName =
    shippingAddress?.fullName ??
    (contactFullName || undefined);
  const hasContact = Boolean(customer || activeCustomerDetails);
  const hasShippingAddress = Boolean(
    shippingAddress?.streetLine1 && shippingAddress?.postalCode,
  );
  const hasShippingMethod = Boolean(activeOrder?.shippingLines?.length);
  const hasLines = Boolean(activeOrder?.lines?.length);
  const canProceedToPayment =
    hasContact && hasShippingAddress && hasShippingMethod && hasLines;

  const submitCustomerForm = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const { emailAddress, firstName, lastName } = Object.fromEntries<any>(
      formData.entries(),
    );
    const isValid = event.currentTarget.checkValidity();
    if (
      customerFormChanged &&
      isValid &&
      emailAddress &&
      firstName &&
      lastName
    ) {
      activeOrderFetcher.submit(formData, {
        method: 'post',
        action: '/api/active-order',
      });
      setCustomerFormChanged(false);
    }
  };
  const submitAddressForm = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const isValid = event.currentTarget.checkValidity();
    if (addressFormChanged && isValid) {
      setShippingAddress(formData);
    }
  };
  const submitSelectedAddress = (index: number) => {
    const selectedAddress = activeCustomer?.addresses?.[index];
    if (selectedAddress) {
      setSelectedAddressIndex(index);
      const formData = new FormData();
      Object.keys(selectedAddress).forEach((key) =>
        formData.append(key, (selectedAddress as any)[key]),
      );
      formData.append('countryCode', selectedAddress.country.code);
      formData.append('action', 'setCheckoutShipping');
      setShippingAddress(formData);
    }
  };

  function setShippingAddress(formData: FormData) {
    if (shippingFormDataIsValid(formData)) {
      activeOrderFetcher.submit(formData, {
        method: 'post',
        action: '/api/active-order',
      });
      setAddressFormChanged(false);
    }
  }

  const submitSelectedShippingMethod = (value?: string) => {
    if (value) {
      activeOrderFetcher.submit(
        {
          action: 'setShippingMethod',
          shippingMethodId: value,
        },
        {
          method: 'post',
          action: '/api/active-order',
        },
      );
    }
  };

  function navigateToPayment() {
    navigate('./payment');
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {t('checkout.detailsTitle')}
        </h3>

        {isSignedIn ? (
          <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50/40 p-4">
            {contactFullName || contactEmail ? (
              <>
                <p className="font-medium text-gray-900">{contactFullName}</p>
                <p className="text-gray-600">{contactEmail}</p>
              </>
            ) : (
              <p className="text-sm text-gray-700">{t('account.welcomeBack')}</p>
            )}
          </div>
        ) : (
          <Form
            method="post"
            action="/api/active-order"
            onBlur={submitCustomerForm}
            onChange={() => setCustomerFormChanged(true)}
            hidden={isSignedIn}
            className="mt-4"
          >
            <input type="hidden" name="action" value="setOrderCustomer" />
            <div>
              <label
                htmlFor="emailAddress"
                className="block text-sm font-medium text-gray-700"
              >
                {t('account.emailAddress')}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  autoComplete="email"
                  defaultValue={customer?.emailAddress}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              {error?.errorCode === 'EMAIL_ADDRESS_CONFLICT_ERROR' && (
                <p className="mt-2 text-sm text-red-600" id="email-error">
                  {error.message}
                </p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('account.firstName')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    defaultValue={customer?.firstName}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('account.lastName')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    defaultValue={customer?.lastName}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </section>

      <Form
        method="post"
        action="/api/active-order"
        onBlur={submitAddressForm}
        onChange={() => setAddressFormChanged(true)}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <input type="hidden" name="action" value="setCheckoutShipping" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {t('checkout.shippingTitle')}
        </h3>
        <div className="mt-4">
          {isSignedIn && addresses.length ? (
            <ShippingAddressSelector
              addresses={addresses}
              selectedAddressIndex={selectedAddressIndex}
              onChange={submitSelectedAddress}
            />
          ) : (
            <AddressForm
              availableCountries={activeOrder ? availableCountries : undefined}
              address={shippingAddress}
              defaultFullName={defaultFullName}
            ></AddressForm>
          )}
        </div>
      </Form>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ShippingMethodSelector
          eligibleShippingMethods={eligibleShippingMethods}
          currencyCode={activeOrder?.currencyCode}
          shippingMethodId={
            activeOrder?.shippingLines[0]?.shippingMethod.id ?? ''
          }
          onChange={submitSelectedShippingMethod}
        />
      </div>

      <button
        type="button"
        disabled={!canProceedToPayment}
        onClick={navigateToPayment}
        className={classNames(
          canProceedToPayment
            ? 'bg-primary-600 hover:bg-primary-700'
            : 'cursor-not-allowed bg-gray-400',
          'mt-6 flex w-full items-center justify-center space-x-2 rounded-lg border border-transparent py-3 text-base font-medium text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        )}
      >
        <LockClosedIcon className="w-5 h-5" />
        <span>{t('checkout.goToPayment')}</span>
      </button>
    </div>
  );
}
