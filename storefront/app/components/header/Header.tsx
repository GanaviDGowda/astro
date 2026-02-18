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
  const navCollections = data?.collections?.slice(0, 6) || [];

  return (
    <header
      className={classNames(
        isScrollingUp ? 'sticky top-0 z-30 animate-dropIn' : '',
        'bg-surface border-b border-primary-100',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Rakshalokam Logo" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex flex-1 justify-center">
          <ul className="flex items-center gap-6 text-sm text-brand font-medium">
            {navCollections.map((collection) => (
              <li key={collection.id}>
                <Link
                  className="hover:text-brand transition-colors whitespace-nowrap"
                  to={'/collections/' + collection.slug}
                  prefetch="intent"
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2 text-brand">
          <Link
            to="/search"
            aria-label="Search products"
            className="p-2 rounded-full hover:bg-primary-50 transition-colors duration-200"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
          <Link
            to={isSignedIn ? '/account' : '/sign-in'}
            aria-label={
              isSignedIn ? t('account.myAccount') : t('account.signIn')
            }
            className="p-2 rounded-full hover:bg-primary-50 transition-colors duration-200"
          >
            <UserIcon className="h-5 w-5" />
          </Link>
          <button
            className="relative p-2 rounded-full hover:bg-primary-50 transition-colors duration-200"
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
    </header>
  );
}
