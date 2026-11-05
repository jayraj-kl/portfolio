import type { Metadata } from "next";
import { Avatar3DLab } from "./avatar-3d-lab";

export const metadata: Metadata = {
  title: "3D avatar lab",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Avatar3DLab />;
}
