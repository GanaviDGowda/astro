import { Link, useLoaderData } from '@remix-run/react';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  BoltIcon,
  HeartIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { CollectionsQuery } from '~/generated/graphql';
import { getCollections } from '~/providers/collections/collections';

export async function loader({ request }: LoaderFunctionArgs) {
  const collections = await getCollections(request, { take: 20 });
  return json({ collections });
}

type CollectionItem = CollectionsQuery['collections']['items'][number];

type ProductLike = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  discountLabel: string;
  sharkFav: boolean;
  newArrival: boolean;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
};

const purposeItems = [
  { label: 'Wealth', icon: SparklesIcon },
  { label: 'Health', icon: HeartIcon },
  { label: 'Love', icon: HeartIcon },
  { label: 'Luck', icon: SparklesIcon },
  { label: 'Protection', icon: ShieldCheckIcon },
  { label: 'Peace', icon: BoltIcon },
  { label: 'Courage', icon: BoltIcon },
  { label: 'Balance', icon: ScaleIcon },
];

function toProduct(collection: CollectionItem, index: number): ProductLike {
  const price = 499 + (index % 5) * 100;
  const discount = 25 + (index % 7) * 5;
  const oldPrice = Math.round((price * 100) / (100 - discount));

  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    image: collection.featuredAsset?.preview,
    discountLabel: index % 4 === 0 ? 'Up to 40% off' : `${discount}% off`,
    sharkFav: index % 3 === 0,
    newArrival: index % 5 === 0,
    rating: 4 + (index % 2),
    reviews: 32 + index * 21,
    price,
    oldPrice,
  };
}

function SectionHeader({
  title,
  viewAll,
}: {
  title: string;
  viewAll?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-5 gap-4">
      <h2 className="text-3xl sm:text-4xl leading-tight tracking-tight font-semibold text-brand">
        {title}
      </h2>
      {viewAll ? (
        <Link
          to="/search"
          className="text-base font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        >
          View all
        </Link>
      ) : null}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-primary-200 mt-8" />;
}

function ProductCard({
  product,
  height = 'h-[250px]',
}: {
  product: ProductLike;
  height?: string;
}) {
  return (
    <Link
      to={`/collections/${product.slug}`}
      prefetch="intent"
      className="group flex h-full flex-col rounded-xl border border-primary-100 bg-white overflow-hidden transition-colors hover:border-primary-300"
    >
      <div className="relative overflow-hidden bg-primary-50">
        {product.image ? (
          <img
            src={`${product.image}?w=640&h=760`}
            alt={product.name}
            className={`${height} w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]`}
          />
        ) : (
          <div className={`${height} bg-primary-100`} />
        )}

        <span className="absolute top-0 left-0 bg-primary-600 text-white text-[12px] px-3 py-1 font-semibold uppercase tracking-wide">
          {product.discountLabel}
        </span>

        {product.sharkFav ? (
          <span className="absolute top-0 right-0 bg-brand text-primary-100 text-[10px] px-2 py-1 font-bold uppercase tracking-wide">
            Sharks' Favourite
          </span>
        ) : null}

        {product.newArrival ? (
          <span className="absolute top-8 left-0 bg-primary-100 text-primary-800 text-[11px] px-3 py-1 font-medium uppercase tracking-wide">
            New arrival
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="mt-4 px-4 text-[18px] leading-[1.35] font-semibold text-brand line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-2 px-4 flex items-center gap-2 text-sm leading-none">
          <span
            className="flex items-center gap-1"
            aria-label={`${product.rating} out of 5 stars`}
          >
            {[0, 1, 2, 3, 4].map((star) => (
              <StarIcon
                key={star}
                className={`h-3.5 w-3.5 ${
                  star < product.rating ? 'text-amber-500' : 'text-zinc-300'
                }`}
              />
            ))}
          </span>
          <span className="text-zinc-700 text-xs font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-brand text-sm">({product.reviews})</span>
        </p>
        <p className="px-4 pb-4 pt-2 text-brand text-3xl leading-none font-bold">
          Rs {product.price}
          <span className="ml-2 text-zinc-500 text-sm line-through font-normal">
            Rs {product.oldPrice}
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function Index() {
  const { collections } = useLoaderData<typeof loader>();
  const products = collections.map((item, index) => toProduct(item, index));

  const heroImage = collections[0]?.featuredAsset?.preview;
  const sharks = products.slice(0, 5);
  const rowTwo = products.slice(5, 10);
  const circles = collections.slice(0, 7);
  const trending = products.slice(10, 14);
  const energy = products.slice(2, 10);
  const rudraksha = products.slice(4, 8);
  const spiritual = products.slice(8, 12);

  return (
    <div className="bg-transparent">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-primary-50 to-white border-b border-primary-100">
        {heroImage ? (
          <img
            src={`${heroImage}?w=1900&h=900`}
            alt="Rakshalokam Hero"
            className="absolute right-0 top-0 h-full w-[58%] object-cover opacity-20 mix-blend-multiply"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_40%,rgba(247,121,29,0.26),transparent_48%)]" />

        <div className="relative max-w-[1280px] mx-auto px-6 min-h-[420px] lg:min-h-[500px] py-12 lg:py-16 flex items-end">
          <div className="w-full grid lg:grid-cols-[360px_1fr] gap-10 items-end">
            <div className="bg-white border border-primary-200 rounded-2xl p-7 text-brand max-w-[360px]">
              <p className="text-primary-700 font-semibold uppercase tracking-wide text-sm">
                Special Discount Offer
              </p>
              <p className="mt-3 text-5xl leading-none font-extrabold">
                15% OFF
              </p>
              <div className="mt-5 inline-flex rounded-lg px-4 py-2 bg-primary-600 text-white font-semibold text-lg">
                Use code - TRILOK15
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                Limited period offer on selected collections.
              </p>
            </div>

            <div className="text-left lg:text-center text-brand pb-1 lg:pb-8">
              <p className="text-sm uppercase tracking-[0.18em] text-primary-700 font-semibold">
                Timeless Energy Pieces
              </p>
              <h1 className="mt-4 text-5xl md:text-7xl tracking-wide">
                RAKSHALOKAM
              </h1>
              <p className="mt-4 text-lg md:text-2xl text-zinc-700 max-w-2xl mx-auto">
                Clean, intentional pieces designed with traditional meaning and
                modern form.
              </p>
              <Link
                to="/search"
                className="mt-6 inline-flex items-center px-5 py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
              >
                Explore all products
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <SectionHeader title="Sharks' Favourites" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {sharks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Divider />
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pb-10">
        <div className="bg-white border border-primary-100 rounded-2xl p-8 md:p-10">
          <h2 className="text-3xl sm:text-4xl leading-tight font-semibold text-brand">
            Asli Wearables - Lab Tested
          </h2>
          <p className="mt-4 text-brand text-lg sm:text-2xl leading-[1.4] max-w-4xl">
            We follow our proprietary BTR system to ensure you always get
            original and genuine beads and stones.
          </p>
          {collections[2]?.featuredAsset?.preview ? (
            <img
              src={`${collections[2]?.featuredAsset?.preview}?w=1400&h=560`}
              alt="Lab tested collection"
              className="mt-7 h-[300px] md:h-[360px] w-full object-cover rounded-xl"
            />
          ) : null}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {rowTwo.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Divider />
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <SectionHeader title="Shop Our Collections" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-5">
          {circles.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              prefetch="intent"
              className="text-center"
            >
              <div className="h-[170px] w-[170px] max-w-full mx-auto rounded-full overflow-hidden ring-1 ring-primary-200">
                {collection.featuredAsset?.preview ? (
                  <img
                    src={`${collection.featuredAsset?.preview}?w=400&h=400`}
                    alt={collection.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary-100" />
                )}
              </div>
              <p className="mt-3 text-[20px] leading-tight font-medium text-brand">
                {collection.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <SectionHeader title="Latest & Trending" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trending.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-primary-100/70 border-y border-primary-200 py-12 mt-6">
        <div className="max-w-[1060px] mx-auto px-6">
          <h2 className="text-brand text-4xl leading-none text-center font-semibold mb-7">
            Shop By Purpose
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {purposeItems.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="bg-white border border-primary-200 rounded-xl px-3 py-4 text-center text-brand"
              >
                <div className="h-10 w-10 mx-auto rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-2 text-[18px] leading-none">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-10">
        <SectionHeader title="Explore Energy Stones" viewAll />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {energy.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {energy.slice(5, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-8">
        <SectionHeader title="Single Rudraksha Beads" viewAll />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-2">
          <div className="bg-white border border-primary-100 rounded-xl overflow-hidden flex flex-col lg:row-span-2">
            {collections[1]?.featuredAsset?.preview ? (
              <img
                src={`${collections[1]?.featuredAsset?.preview}?w=860&h=950`}
                alt="Original Nepali Rudraksha"
                className="h-[500px] lg:h-full w-full object-cover"
              />
            ) : null}
            <div className="bg-primary-600 text-white p-5 lg:p-6">
              <h3 className="text-2xl lg:text-3xl leading-none font-semibold">
                Original Nepali Rudraksha
              </h3>
              <p className="mt-2 text-lg lg:text-xl leading-tight">
                1 Mukhi to 11 Mukhi - with certificate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:col-span-2 lg:row-span-2">
            {rudraksha.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
        <Divider />
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pt-8 pb-16">
        <SectionHeader title="Spiritual Jewellery" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {spiritual.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
