import { Link } from '@remix-run/react';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { useRootLoader } from '~/utils/use-root-loader';
import { BoltIcon, UserIcon } from '@heroicons/react/24/solid';
import { useScrollingUp } from '~/utils/use-scrolling-up';
import { classNames } from '~/utils/class-names';
import { useTranslation } from 'react-i18next';

export function Header({
  onCartIconClick,
  cartQuantity,
}: {
  onCartIconClick: () => void;
  cartQuantity: number;
}) {
  const data = useRootLoader();
  const isSignedIn = !!data?.activeCustomer?.activeCustomer?.id;
  const isScrollingUp = useScrollingUp();
  const { t } = useTranslation();
  const featuredCollections = data?.collections?.slice(0, 7) || [];

  return (
    <header
      className={classNames(
        isScrollingUp ? 'sticky top-0 z-30 animate-dropIn' : '',
        'bg-[#fffdfb] border-b border-primary-100',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl sm:text-3xl tracking-wide font-semibold text-brand lowercase"
        >
          astro
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 text-brand">
          <Link
            to="/search"
            aria-label="Search products"
            className="p-2.5 rounded-full hover:bg-primary-50 transition-colors duration-200"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
          <Link
            to={isSignedIn ? '/account' : '/sign-in'}
            aria-label={
              isSignedIn ? t('account.myAccount') : t('account.signIn')
            }
            className="p-2.5 rounded-full hover:bg-primary-50 transition-colors duration-200"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            aria-label="Highlights"
            className="p-2.5 rounded-full hover:bg-primary-50 transition-colors duration-200"
          >
            <BoltIcon className="h-5 w-5 text-primary-500" />
          </button>
          <button
            className="relative p-2.5 rounded-full hover:bg-primary-50 transition-colors duration-200"
            onClick={onCartIconClick}
            aria-label="Open cart tray"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            {cartQuantity ? (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 rounded-full bg-primary-600 text-white text-xs font-semibold flex items-center justify-center">
                {cartQuantity}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div className="border-t border-primary-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <nav className="flex-1 overflow-x-auto scrollbar-none">
            <ul className="flex items-center gap-8 min-w-max text-base text-brand font-medium">
              {data?.collections?.map((collection) => (
                <li key={collection.id}>
                  <Link
                    className="hover:text-brand transition-colors whitespace-nowrap py-1"
                    to={'/collections/' + collection.slug}
                    prefetch="intent"
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <button
              type="button"
              className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-md text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Chat with Sevak
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 overflow-x-auto scrollbar-none">
          <ul className="flex items-start gap-6 min-w-max">
            {featuredCollections.map((collection) => (
              <li key={collection.id} className="text-center">
                <Link
                  to={'/collections/' + collection.slug}
                  prefetch="intent"
                  className="block group"
                >
                  <div className="h-14 w-14 rounded-full bg-primary-50 ring-1 ring-primary-200 overflow-hidden mx-auto group-hover:scale-105 transition-transform">
                    {collection.featuredAsset?.preview ? (
                      <img
                        src={`${collection.featuredAsset.preview}?w=120&h=120`}
                        alt={collection.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-brand">
                        {collection.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="mt-2 block text-xs text-brand whitespace-nowrap">
                    {collection.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
