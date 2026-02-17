import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { useState } from 'react';
import { Price } from '~/components/products/Price';
import { getProductBySlug } from '~/providers/products/products';
import {
  FetcherWithComponents,
  ShouldRevalidateFunction,
  useLoaderData,
  useOutletContext,
  MetaFunction,
} from '@remix-run/react';
import { CheckIcon, HeartIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { APP_META_TITLE } from '~/constants';
import { CartLoaderData } from '~/routes/api.active-order';
import { getSessionStorage } from '~/sessions';
import { ErrorCode, ErrorResult } from '~/generated/graphql';
import Alert from '~/components/Alert';
import { StockLevelLabel } from '~/components/products/StockLevelLabel';
import TopReviews, { ProductReview } from '~/components/products/TopReviews';
import { ScrollableContainer } from '~/components/products/ScrollableContainer';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.product?.name
        ? `${data.product.name} - ${APP_META_TITLE}`
        : APP_META_TITLE,
    },
  ];
};

export async function loader({ params, request }: DataFunctionArgs) {
  const { product } = await getProductBySlug(params.slug!, { request });
  if (!product) {
    throw new Response('Not Found', {
      status: 404,
    });
  }
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request?.headers.get('Cookie'),
  );
  const error = session.get('activeOrderError');
  return json(
    { product: product!, error },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    },
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

export default function ProductSlug() {
  const { product, error } = useLoaderData<typeof loader>();
  const { activeOrderFetcher } = useOutletContext<{
    activeOrderFetcher: FetcherWithComponents<CartLoaderData>;
  }>();
  const { activeOrder } = activeOrderFetcher.data ?? {};
  const addItemToOrderError = getAddItemToOrderError(error);
  const { t } = useTranslation();

  if (!product) {
    return <div>{t('product.notFound')}</div>;
  }

  const initialVariantId = product.variants[0]?.id ?? '';
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];
  const qtyInCart = selectedVariant
    ? activeOrder?.lines.find(
        (line) => line.productVariant.id === selectedVariant.id,
      )?.quantity ?? 0
    : 0;

  const asset = product.assets[0];
  const brandName = product.facetValues.find(
    (fv) => fv.facet.code === 'brand',
  )?.name;
  const [featuredAsset, setFeaturedAsset] = useState(
    selectedVariant?.featuredAsset ?? product.featuredAsset ?? asset,
  );
  const reviews = parseProductReviews(product.customFields);
  const imagePreview =
    featuredAsset?.preview ??
    selectedVariant?.featuredAsset?.preview ??
    product.featuredAsset?.preview ??
    asset?.preview;
  const isSubmitting = activeOrderFetcher.state !== 'idle';
  const isInCart = qtyInCart > 0;
  const canAddToCart = Boolean(selectedVariant) && !isSubmitting;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="pt-6">
        <Breadcrumbs
          items={
            product.collections[product.collections.length - 1]?.breadcrumbs ??
            []
          }
        ></Breadcrumbs>
      </div>
      <div className="grid gap-10 py-8 lg:grid-cols-12 lg:gap-12 lg:py-10">
        <div className="lg:col-span-7">
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-gray-900">
            {product.name}
          </h1>
          {brandName ? (
            <p className="mt-3 inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
              {brandName}
            </p>
          ) : null}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview + '?w=900'}
                alt={product.name}
                className="aspect-square h-full w-full object-cover object-center"
              />
            ) : (
              <div className="aspect-square h-full w-full flex items-center justify-center bg-slate-100">
                <PhotoIcon className="h-20 w-20 text-slate-300" />
              </div>
            )}
          </div>
          {product.assets.length > 1 && (
            <ScrollableContainer>
              {product.assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  className={`basis-1/3 md:basis-1/4 flex-shrink-0 select-none touch-pan-x rounded-lg ${
                    featuredAsset?.id === asset.id
                      ? 'outline outline-2 outline-primary outline-offset-[-2px]'
                      : ''
                  }`}
                  aria-pressed={featuredAsset?.id === asset.id}
                  aria-label={product.name}
                  onClick={() => {
                    setFeaturedAsset(asset);
                  }}
                >
                  <img
                    draggable="false"
                    className="h-24 w-full rounded-lg object-cover select-none"
                    src={
                      asset.preview +
                      '?preset=full' /* keeps thumb image loading lightweight */
                    }
                    alt={product.name}
                  />
                </button>
              ))}
            </ScrollableContainer>
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <p className="text-3xl text-gray-900">
                <Price
                  priceWithTax={selectedVariant?.priceWithTax}
                  currencyCode={selectedVariant?.currencyCode}
                />
              </p>
              <StockLevelLabel stockLevel={selectedVariant?.stockLevel} />
            </div>
            {selectedVariant?.sku ? (
              <p className="mt-2 text-sm text-gray-500">
                {selectedVariant.sku}
              </p>
            ) : null}
            <div className="mt-6">
              <h2 className="sr-only">{t('product.description')}</h2>
              <div
                className="text-base leading-7 text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: product.description,
                }}
              />
            </div>
            <activeOrderFetcher.Form
              method="post"
              action="/api/active-order"
              className="mt-8"
            >
              <input type="hidden" name="action" value="addItemToOrder" />
              {product.variants.length > 1 ? (
                <div>
                  <label
                    htmlFor="productVariant"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('product.selectOption')}
                  </label>
                  <select
                    className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    id="productVariant"
                    value={selectedVariantId}
                    name="variantId"
                    onChange={(e) => {
                      setSelectedVariantId(e.target.value);

                      const variant = product.variants.find(
                        (entry) => entry.id === e.target.value,
                      );
                      if (variant?.featuredAsset) {
                        setFeaturedAsset(variant.featuredAsset);
                      }
                    }}
                  >
                    {product.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="hidden"
                  name="variantId"
                  value={selectedVariantId}
                />
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className={`flex-1 rounded-md border border-transparent py-3 px-6 text-base font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isSubmitting
                      ? 'bg-gray-400'
                      : isInCart
                      ? 'bg-green-600 hover:bg-green-700 active:bg-green-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                  disabled={!canAddToCart}
                >
                  {isInCart ? (
                    <span className="flex items-center justify-center">
                      <CheckIcon className="mr-1 h-5 w-5" /> {qtyInCart}{' '}
                      {t('product.inCart')}
                    </span>
                  ) : (
                    t('product.addToCart')
                  )}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-gray-200 py-3 px-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                >
                  <HeartIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="sr-only">{t('product.addToFavorites')}</span>
                </button>
              </div>
              {addItemToOrderError && (
                <div className="mt-4">
                  <Alert message={addItemToOrderError} />
                </div>
              )}

              <section className="mt-8 rounded-lg bg-gray-50 p-4 text-sm">
                <h3 className="font-semibold text-gray-700">
                  {t('product.shippingAndReturns')}
                </h3>
                <div className="mt-2 space-y-2 text-gray-600">
                  <p>{t('product.shippingInfo')}</p>
                  <p>{t('product.shippingCostsInfo')}</p>
                  <p>{t('product.returnsInfo')}</p>
                </div>
              </section>
            </activeOrderFetcher.Form>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t pt-8 sm:mt-12">
        <TopReviews reviews={reviews}></TopReviews>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-gray-900 my-8">
        {t('product.notFound')}
      </h2>
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-4 md:mt-12">
        {/* Image gallery */}
        <div className="w-full max-w-2xl mx-auto sm:block lg:max-w-none">
          <span className="rounded-md overflow-hidden">
            <div className="w-full h-96 bg-slate-200 rounded-lg flex content-center justify-center">
              <PhotoIcon className="w-48 text-white"></PhotoIcon>
            </div>
          </span>
        </div>

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <div className="">{t('product.notFoundInfo')}</div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAddItemToOrderError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderModificationError:
    case ErrorCode.OrderLimitError:
    case ErrorCode.NegativeQuantityError:
    case ErrorCode.InsufficientStockError:
      return error.message;
  }
}

function parseProductReviews(customFields: unknown): ProductReview[] {
  if (!customFields || typeof customFields !== 'object') {
    return [];
  }

  const fields = customFields as Record<string, unknown>;
  const entries =
    fields.reviews ??
    fields.productReviews ??
    fields.topReviews ??
    parseJsonArray(fields.reviewsJson);
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry, index) => normalizeReview(entry, index))
    .filter((entry): entry is ProductReview => Boolean(entry));
}

function normalizeReview(entry: unknown, index: number): ProductReview | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const raw = entry as Record<string, unknown>;
  const rawRating = Number(raw.rating);
  const rating = Number.isFinite(rawRating)
    ? Math.max(1, Math.min(5, Math.round(rawRating)))
    : 5;

  const content =
    readString(raw.content) ??
    readString(raw.comment) ??
    readString(raw.text) ??
    readString(raw.body);
  if (!content) {
    return null;
  }

  const parsedDate = parseReviewDate(raw);
  const title =
    readString(raw.title) ??
    readString(raw.headline) ??
    readString(raw.summary) ??
    'Customer Review';
  const author =
    readString(raw.author) ??
    readString(raw.authorName) ??
    readString(raw.user) ??
    'Anonymous';

  return {
    id: readString(raw.id) ?? `review-${index}`,
    title,
    rating,
    content,
    author,
    date:
      parsedDate?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) ?? 'Recently',
    datetime: parsedDate?.toISOString().slice(0, 10) ?? '',
  };
}

function parseReviewDate(review: Record<string, unknown>) {
  const value =
    readString(review.datetime) ??
    readString(review.date) ??
    readString(review.createdAt);
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function readString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseJsonArray(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
