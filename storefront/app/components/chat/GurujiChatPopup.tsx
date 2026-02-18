import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <g strokeWidth="0" />
      <g strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.821 14.121c-.241.682-1.199 1.247-1.963 1.412-.523.11-1.205.199-3.503-.754C7.774 13.71 4.19 9.901 4.19 7.366c0-1.29.744-2.793 2.045-2.793.626 0 .764.012.97.507.241.582.829 2.016.899 2.163.289.603-.294.956-.717 1.482-.135.158-.288.329-.117.623.17.288.758 1.246 1.622 2.015 1.116.995 2.021 1.312 2.345 1.447.241.1.529.077.705-.111.223-.241.5-.641.782-1.035.199-.283.452-.318.717-.218.179.062 2.454 1.119 2.55 1.288.071.123.071.705-.17 1.387M10.002 0h-.005C4.484 0 0 4.485 0 10c0 2.187.705 4.215 1.904 5.86L.658 19.577l3.843-1.229A9.9 9.9 0 0 0 10.002 20C15.515 20 20 15.515 20 10S15.515 0 10.002 0"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function GurujiChatPopup({
  whatsappNumber,
}: {
  whatsappNumber?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : undefined;

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleOpen = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-5 right-5 z-40 w-[260px] sm:w-[300px] overflow-hidden rounded-2xl border border-primary-200 bg-surface shadow-hero-pack">
          <div className="flex items-center justify-between border-b border-primary-100 bg-surface-muted px-4 py-3">
            <p className="text-sm font-semibold text-brand">Chat with Guruji</p>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close chat"
              className="rounded-full p-1 text-primary-700 hover:bg-primary-50"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="px-4 py-4">
            <div className="h-40 w-full overflow-hidden rounded-xl bg-primary-50 ring-1 ring-primary-100">
              <img
                src="/guruji-placeholder.svg"
                alt="Guruji"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-sm text-brand">Price is 500rs</p>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-200 py-2.5 text-sm font-semibold text-white opacity-70"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp unavailable
              </button>
            )}
          </div>
        </div>
      ) : null}

      {isMinimized && !isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open WhatsApp chat"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-hero-pack transition-colors hover:bg-primary-700"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </button>
      ) : null}
    </>
  );
}
