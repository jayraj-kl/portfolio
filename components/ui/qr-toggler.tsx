"use client";

import { IconQrcode, IconX } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

interface QrTogglerProps {
  websiteUrl: string;
}

export const QrToggler = ({ websiteUrl }: QrTogglerProps) => {
  const [showQR, setShowQR] = useState(false);

  const handleClick = () => {
    setShowQR((prev) => !prev);
  };

  return (
    <>
      <IconQrcode
        className="h-full w-full text-neutral-500 dark:text-neutral-300"
        onClick={handleClick}
      />
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
                onClick={() => setShowQR(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-8 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowQR(false)}
                    className="absolute -right-3 -top-3 rounded-full bg-black dark:bg-white p-2 text-white dark:text-black transition-transform hover:scale-110"
                    aria-label="Close"
                  >
                    <IconX />
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
