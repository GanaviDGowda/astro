import { bootstrap } from "@vendure/core";
import { populate } from "@vendure/core/cli";
import net from "net";
import path from "path";
import { config } from "./vendure-config";

/**
 * Populate an empty Vendure database using the local products.csv file.
 *
 * Notes:
 * - Uses the official @vendure/create initial-data template.
 * - Uses @vendure/create images so asset filenames from products.csv resolve.
 */
async function runPopulate() {
  await assertDatabasePortIsReachable();

  const productsCsvPath = path.join(__dirname, "../products.csv");
  const initialDataPath =
    require.resolve("@vendure/create/assets/initial-data.json");
  const importAssetsDir = path.join(
    require.resolve("@vendure/create/assets/products.csv"),
    "../images",
  );

  const app = await populate(
    () =>
      bootstrap({
        ...config,
        importExportOptions: {
          ...(config.importExportOptions ?? {}),
          importAssetsDir,
        },
        // synchronize is required for first-time database bootstrap
        // when running the populate command directly.
        dbConnectionOptions: {
          ...config.dbConnectionOptions,
          synchronize: true,
        },
      }),
    initialDataPath,
    productsCsvPath,
  );

  await app.close();
}

async function assertDatabasePortIsReachable() {
  const dbOptions = config.dbConnectionOptions as { host?: string; port?: number };
  const host = String(dbOptions.host ?? "localhost");
  const port = Number(dbOptions.port ?? 5432);
  const timeoutMs = 3000;

  const isReachable = await canConnectTcp(host, port, timeoutMs);
  if (isReachable) {
    return;
  }

  throw new Error(
    [
      `Database is not reachable at ${host}:${port}.`,
      `Start Postgres and retry.`,
      `If using Docker in this project: "docker compose -f server/docker-compose.yml up -d postgres_db"`,
    ].join(" "),
  );
}

function canConnectTcp(host: string, port: number, timeoutMs: number) {
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finalize = (ok: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finalize(true));
    socket.once("timeout", () => finalize(false));
    socket.once("error", () => finalize(false));
    socket.connect(port, host);
  });
}

runPopulate().catch((err) => {
  console.error(err);
  process.exit(1);
});
