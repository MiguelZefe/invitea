import { notFound } from "next/navigation";
import CommercialLab from "./CommercialLab";

export const metadata = {
  title: "Laboratorio local · ZefeInvita",
  robots: { index: false, follow: false },
};

export default function CommercialLabPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <CommercialLab />;
}
