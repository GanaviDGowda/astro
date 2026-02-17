import { RootLoaderData } from '~/root';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

const navigation = {
  support: [
    { page: 'help', href: '#' },
    { page: 'trackOrder', href: '#' },
    { page: 'shipping', href: '#' },
    { page: 'returns', href: '#' },
  ],
  company: [
    { page: 'about', href: '#' },
    { page: 'blog', href: '#' },
    { page: 'responsibility', href: '#' },
    { page: 'press', href: '#' },
  ],
};

export default function Footer({
  collections,
}: {
  collections: RootLoaderData['collections'];
}) {
  const { t } = useTranslation();

  return (
    <footer
      className="mt-16 border-t border-primary-100 bg-[#fffdfb]"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        {t('footer.title')}
      </h2>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 xl:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-brand tracking-wider uppercase mb-6">
                {t('footer.shop')}
              </h3>
              <ul role="list" className="space-y-3">
                {collections?.map((collection) => (
                  <li key={collection.id}>
                    <Link
                      className="text-base text-gray-700 hover:text-primary-700 transition-colors"
                      to={'/collections/' + collection.slug}
                      prefetch="intent"
                    >
                      {collection.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 md:mt-0">
              <h3 className="text-sm font-semibold text-brand tracking-wider uppercase mb-6">
                {t('footer.support')}
              </h3>
              <ul role="list" className="space-y-3">
                {navigation.support.map(({ page, href }) => (
                  <li key={page}>
                    <a
                      href={href}
                      className="text-base text-gray-700 hover:text-primary-700 transition-colors"
                    >
                      {t(`navigation.support.${page}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 md:mt-0">
            <div>
              <h3 className="text-sm font-semibold text-brand tracking-wider uppercase mb-6">
                {t('footer.company')}
              </h3>
              <ul role="list" className="space-y-3">
                {navigation.company.map(({ page, href }) => (
                  <li key={page}>
                    <a
                      href={href}
                      className="text-base text-gray-700 hover:text-primary-700 transition-colors"
                    >
                      {t(`navigation.company.${page}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 xl:mt-0">
          <h3 className="text-sm font-semibold text-brand tracking-wider uppercase mb-6">
            {t('footer.subscribeHeader')}
          </h3>
          <p className="mt-4 text-base text-gray-700 leading-relaxed">
            {t('footer.subscribeIntro')}
          </p>
          <form className="mt-6 sm:flex sm:max-w-md">
            <label htmlFor="email-address" className="sr-only">
              {t('acount.emailAddress')}
            </label>
            <input
              type="email"
              name="email-address"
              id="email-address"
              autoComplete="email"
              required
              className="appearance-none min-w-0 w-full bg-white border border-primary-200 rounded-md py-3 px-4 text-base text-brand placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-400 focus:border-primary-400 focus:placeholder-gray-400"
              placeholder={t('footer.emailPlaceholder')}
            />
            <div className="mt-4 rounded-md sm:mt-0 sm:ml-4 sm:flex-shrink-0">
              <button
                type="submit"
                className="w-full bg-primary-600 border border-transparent rounded-md py-3 px-6 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary-300"
              >
                {t('footer.subscribe')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="mt-12 border-t border-primary-100 pt-8">
        <a
          className="flex items-center space-x-3 font-medium text-gray-500 hover:text-brand transition-colors"
          href="https://github.com/vendure-ecommerce/storefront-remix-starter"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          <span>github.com/vendure-ecommerce/storefront-remix-starter</span>
        </a>
      </div>
    </footer>
  );
}
