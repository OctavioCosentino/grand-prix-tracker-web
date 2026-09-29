import React from "react";
import SiteLayout from "@/components/SiteLayout";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteLayout>{children}</SiteLayout>;
}
