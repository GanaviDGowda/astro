import { StarIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { classNames } from '~/utils/class-names';

export interface ProductReview {
  id: string;
  title: string;
  rating: number;
  content: string;
  author: string;
  date: string;
  datetime: string;
}

export default function TopReviews({ reviews }: { reviews: ProductReview[] }) {
  const { t } = useTranslation();
  const noReviewsYetLabel = t('product.noReviewsYet', {
    defaultValue: 'No reviews yet',
  });
  const totalReviewsLabel = t('product.totalReviews', {
    defaultValue: 'reviews',
  });
  const maxStars = 5;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const ratingBreakdown = Array.from({ length: maxStars }, (_, index) => {
    const stars = maxStars - index;
    const count = reviews.filter(
      (review) => Math.round(review.rating) === stars,
    ).length;

    return {
      stars,
      count,
      percentage: reviews.length ? (count / reviews.length) * 100 : 0,
    };
  });

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="relative grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                {t('product.recentReviews')}
              </h2>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-5xl font-semibold text-slate-900">
                  {averageRating.toFixed(1)}
                </p>
                <div className="mt-3 flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={classNames(
                        averageRating > rating
                          ? 'text-amber-400'
                          : 'text-slate-200',
                        'h-5 w-5 flex-shrink-0',
                      )}
                      aria-hidden="true"
                    />
                  ))}
                  <p className="ml-2 text-sm text-slate-600">
                    {averageRating.toFixed(1)}
                    <span className="sr-only">
                      {' '}
                      {t('product.recentRating')}
                    </span>
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {reviews.length === 0
                    ? noReviewsYetLabel
                    : `${reviews.length} ${totalReviewsLabel}`}
                </p>
              </div>
              <div className="mt-5 space-y-2">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2">
                    <span className="w-3 text-xs font-medium text-slate-600">
                      {row.stars}
                    </span>
                    <StarIcon
                      className="h-3.5 w-3.5 text-amber-400"
                      aria-hidden="true"
                    />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${row.percentage}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-xs text-slate-500">
                      {row.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:col-span-8">
              {reviews.length === 0 ? (
                <article className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center">
                  <h3 className="text-base font-semibold text-slate-900">
                    {noReviewsYetLabel}
                  </h3>
                </article>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {review.title}
                      </h3>
                      <time
                        dateTime={review.datetime}
                        className="text-xs text-slate-500"
                      >
                        {review.date}
                      </time>
                    </div>
                    <div className="mt-3 flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            review.rating > rating
                              ? 'text-amber-400'
                              : 'text-slate-200',
                            'h-4 w-4 flex-shrink-0',
                          )}
                          aria-hidden="true"
                        />
                      ))}
                      <p className="ml-2 text-sm text-slate-600">
                        {review.rating}
                        <span className="sr-only">
                          {' '}
                          {t('product.recentRating')}
                        </span>
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {review.author}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {review.content}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
