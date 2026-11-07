import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const defaultPath = fileURLToPath(new URL("../../logs/auth-events.jsonl", import.meta.url));

export async function writeAuthEvent(event) {
    const file = process.env.AUTH_LOG_PATH || defaultPath;
    await mkdir(dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify(event) + "\n", "utf8");
}
