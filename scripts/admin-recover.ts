import process from "node:process";
import { getPayload } from "payload";
import config from "../payload.config";

type CliArgs = {
  email: string;
  password: string;
  name: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) continue;
    args.set(token.slice(2), value);
  }

  return {
    email: args.get("email") ?? "admin@cbike-lab.local",
    password: args.get("password") ?? "Admin@123456",
    name: args.get("name") ?? "Local Admin",
  };
}

async function main() {
  const { email, password, name } = parseArgs(process.argv.slice(2));
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: email,
      },
    },
    depth: 0,
    limit: 1,
  });

  if (existing.docs.length > 0) {
    const user = existing.docs[0];
    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        password,
        role: "super_admin",
        name,
      },
    });

    console.log(`RESET_OK email=${email} password=${password}`);
    return;
  }

  await payload.create({
    collection: "users",
    data: {
      email,
      password,
      role: "super_admin",
      name,
    },
  });

  console.log(`CREATE_OK email=${email} password=${password}`);
}

main().catch((error) => {
  console.error("ADMIN_RECOVER_FAILED", error);
  process.exitCode = 1;
});
