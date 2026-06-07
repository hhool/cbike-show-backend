export type StorageEntityType = "product" | "brand" | "review" | "page" | "member" | "common";

export type StorageKeyInput = {
  env: "prod" | "preview" | "dev";
  entityType: StorageEntityType;
  entityId: string;
  now?: Date;
  filename: string;
};

const sanitizeSegment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "unknown";

const extFromFilename = (filename: string): string => {
  const idx = filename.lastIndexOf(".");
  if (idx === -1 || idx === filename.length - 1) {
    return "bin";
  }

  return filename.slice(idx + 1).toLowerCase();
};

const randomSuffix = (): string => Math.random().toString(36).slice(2, 8);

export const resolveStorageEnv = (): "prod" | "preview" | "dev" => {
  if (process.env.VERCEL_ENV === "production") return "prod";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.NODE_ENV === "production") return "prod";
  return "dev";
};

export const buildStorageKeys = ({ env, entityType, entityId, now = new Date(), filename }: StorageKeyInput) => {
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeType = sanitizeSegment(entityType);
  const safeEntityId = sanitizeSegment(entityId);
  const ext = sanitizeSegment(extFromFilename(filename));
  const baseName = `${Date.now()}-${randomSuffix()}.${ext}`;
  const prefix = `${env}/media/${yyyy}/${mm}/${safeType}/${safeEntityId}`;

  return {
    original: `${prefix}/original/${baseName}`,
    thumb: `${prefix}/thumb/${baseName}`,
    card: `${prefix}/card/${baseName}`,
    hero: `${prefix}/hero/${baseName}`,
  };
};
