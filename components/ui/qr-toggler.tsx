"use client";

import { IconQrcode, IconX } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface QrTogglerProps {
  websiteUrl: string;
}

export const QrToggler = ({ websiteUrl }: QrTogglerProps) => {
  const [showQR, setShowQR] = useState(false);
  const reduce = useReducedMotion();
  const trigger = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where the trigger sits from the middle of the screen, read as the card opens: the card
  // arrives from that side and leaves the same way, so it is plain which button it belongs to.
  const [from, setFrom] = useState({ x: 0, y: 0 });

  const open = () => {
    const r = trigger.current?.getBoundingClientRect();
    if (r) {
      setFrom({
        x: (r.left + r.width / 2 - window.innerWidth / 2) * 0.08,
        y: (r.top + r.height / 2 - window.innerHeight / 2) * 0.08,
      });
    }
    setShowQR(true);
  };
  const close = () => {
    setShowQR(false);
    trigger.current?.focus({ preventScroll: true });
  };

  // Focus moves into the card; Escape closes it.
  useEffect(() => {
    if (!showQR) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowQR(false);
        trigger.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showQR]);

  const away = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: from.x, y: from.y };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="Show a QR code for this site"
        aria-haspopup="dialog"
        className="block h-full w-full rounded-full"
        onClick={() => (showQR ? close() : open())}
      >
        <IconQrcode aria-hidden="true" className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md bg-black/40"
                onClick={close}
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="QR code for this site"
                  initial={away}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={away}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", bounce: 0, duration: 0.35 }}
                  className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    className="absolute -right-3 -top-3 rounded-full bg-black dark:bg-white p-2 text-white dark:text-black transition-transform hover:scale-110 active:scale-95"
                    aria-label="Close"
                  >
                    <IconX aria-hidden="true" />
                  </button>
                  <div className="rounded-lg bg-white p-2">
                    <QRCodeSVG
                      value={websiteUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
