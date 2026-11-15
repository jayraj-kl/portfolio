import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { QrToggler } from "@/components/ui/qr-toggler";
import {
  IconBrandX,
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
} from "@tabler/icons-react";
import { ANIMATION_THEME_TOGGLER_DURATION, WEBSITE_URL } from "@/lib/constants";

// The floating dock's items. Kept apart from constants.ts so that server code reading a plain
// value from there doesn't pull the dock's client components into its bundle.
export const links = [
  {
    title: "Toggle Theme",
    icon: <AnimatedThemeToggler duration={ANIMATION_THEME_TOGGLER_DURATION} />,
  },
  {
    title: "QR Code",
    icon: <QrToggler websiteUrl={WEBSITE_URL} />,
  },
  // {
  //   title: "Study map",
  //   icon: (
  //     <IconSitemap className="h-full w-full text-neutral-500 dark:text-neutral-300" />
  //   ),
  //   href: "/learn",
  // },
  {
    title: "Email",
    icon: (
      <IconMail className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "mailto:jayrajkladkat@gmail.com",
  },
  {
    title: "GitHub",
    icon: (
      <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "https://github.com/jayraj-kl",
  },
  {
    title: "LinkedIn",
    icon: (
      <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "https://www.linkedin.com/in/jayraj-ladkat-25534626b/",
  },
  {
    title: "X",
    icon: (
      <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "https://x.com/JayrajKLadkat",
  },
];
