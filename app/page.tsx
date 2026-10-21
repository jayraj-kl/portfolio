import { HomePage, homeMetadata } from "@/components/home/home-page";
import { ACTIVE_PROFILE } from "@/lib/content";

export const metadata = homeMetadata(ACTIVE_PROFILE);

export default function Home() {
  return <HomePage profile={ACTIVE_PROFILE} />;
}
