import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "@/app/(payload)/admin/importMap";
import config from "@payload-config";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default async function Page({ params, searchParams }: Args) {
  const { segments = [] } = await params;
  const isDashboardRoot = segments.length === 0;

  if (segments[0] === "create-first-user") {
    const payload = await getPayload({ config });
    const users = await payload.find({
      collection: "users",
      depth: 0,
      limit: 1,
      pagination: false,
    });

    if (users.docs.length > 0) {
      redirect("/admin/login");
    }
  }

  return (
    <>
      {isDashboardRoot && (
        <div
          style={{
            margin: "12px 16px 0",
            padding: "12px 14px",
            border: "1px solid #d8e3ea",
            borderRadius: 10,
            background: "#f8fbfd",
          }}
        >
          <a
            href="/i18n/brands"
            style={{
              color: "#174a74",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            快捷入口: 多语言运营页 (Locale Operations)
          </a>
          <p style={{ margin: "6px 0 0", color: "#4f6472", fontSize: 13 }}>
            支持按命名空间检索与批量更新中英文词条。
          </p>
        </div>
      )}
      {RootPage({ config, params, searchParams, importMap })}
    </>
  );
}
