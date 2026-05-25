import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Shipment",
  description: "Track your car parts and electronics shipments from our USA warehouse directly to Accra, Ghana.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
