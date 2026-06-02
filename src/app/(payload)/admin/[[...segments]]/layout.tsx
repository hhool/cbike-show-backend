import React from "react";
import "@payloadcms/next/css";
import { ProgressBar, RootProvider } from "@payloadcms/ui";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { defaultTheme } from "@payloadcms/ui/providers/Theme";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import { cookies as nextCookies } from "next/headers";
import { getLocalI18n, getPayload } from "payload";
import { en } from "@payloadcms/translations/languages/en";
import { zh } from "@payloadcms/translations/languages/zh";
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { importMap } from "@/app/(payload)/admin/importMap";

export const dynamic = "force-dynamic";

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config });
  const resolvedConfig = payload.config;
  const fallbackLanguage = resolvedConfig.i18n?.fallbackLanguage ?? "zh";
  const activeLanguage = fallbackLanguage === "zh" ? zh : en;
  const i18n = await getLocalI18n({ config: resolvedConfig, language: fallbackLanguage });
  const clientConfig = getClientConfig({ config: resolvedConfig, i18n, importMap, user: null });
  const supportedLanguages = resolvedConfig.i18n?.supportedLanguages ?? { en, zh };
  const languageOptions = Object.entries(supportedLanguages).map(([language, lc]) => ({
    label: lc.translations.general.thisLanguage, value: language
  }));

  return (
    <RootProvider
      config={clientConfig}
      dateFNSKey={activeLanguage.dateFNSKey}
      fallbackLang={fallbackLanguage}
      isNavOpen={true}
      languageCode={fallbackLanguage}
      languageOptions={languageOptions}
      locale={fallbackLanguage}
      permissions={null as never}
      serverFunction={serverFunction}
      switchLanguageServerAction={async (lang: string) => {
        "use server";
        const cs = await nextCookies();
        cs.set({ name: `${resolvedConfig.cookiePrefix || "payload"}-lng`, maxAge: 60 * 60 * 24 * 365, path: "/", value: lang });
      }}
      theme={defaultTheme}
      translations={activeLanguage.translations}
      user={null}
    >
      <ProgressBar />
      {children}
      <div id="portal" />
    </RootProvider>
  );
}
