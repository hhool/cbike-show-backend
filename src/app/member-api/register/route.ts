import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const locale = String(body?.locale || "zh");

    if (!email || !password) {
      return NextResponse.json({ message: "邮箱和密码不能为空" }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const existing = await payload.find({
      collection: "members",
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.totalDocs > 0) {
      return NextResponse.json({ message: "该邮箱已注册" }, { status: 409 });
    }

    const member = await payload.create({
      collection: "members",
      data: {
        email,
        password,
        tier: "free",
        locale: locale === "en" ? "en" : "zh",
        consent: {
          privacy: true,
          terms: true,
          marketing: false,
          consentedAt: new Date().toISOString(),
        },
        _verified: true,
      } as any,
      overrideAccess: true,
    });

    return NextResponse.json({
      ok: true,
      member: { id: member.id, email: (member as any).email, tier: (member as any).tier },
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message || "注册失败" }, { status: 500 });
  }
}
