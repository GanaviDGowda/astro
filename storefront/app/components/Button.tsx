import clsx from 'clsx';

export function Button(
  props: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>,
) {
  return (
    <button
      {...props}
      className={clsx(
        'hover:text-brand hover:bg-primary-50 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-0 focus:ring-primary-300',
        'bg-white border border-primary-200 rounded-md py-2 px-4 text-base font-medium text-brand',
        'flex items-center justify-around gap-2',
        'disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400',
        props.className,
      )}
    >
      {props.children}
    </button>
  );
}
