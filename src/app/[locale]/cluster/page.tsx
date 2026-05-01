import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale }> };

export default async function ClusterPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/cluster/about`);
}
