import { promises as fs } from "fs";
import path from "path";

export type Submission = {
  id: string;
  name: string;
  shortWish: string;
  longWish: string;
  costAnswer: string | null;
  createdAt: string;
  updatedAt: string;
};

const ORDER_KEY = "xuyuan:order";
const itemKey = (id: string) => `xuyuan:s:${id}`;

function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return Redis.fromEnv();
}

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "submissions.json");

async function readFileStore(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Submission[]) : [];
  } catch {
    return [];
  }
}

async function writeFileStore(rows: Submission[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(rows, null, 2), "utf-8");
}

export async function createSubmission(
  input: Pick<Submission, "name" | "shortWish" | "longWish">
): Promise<Submission> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const row: Submission = {
    id,
    name: input.name.trim(),
    shortWish: input.shortWish.trim(),
    longWish: input.longWish.trim(),
    costAnswer: null,
    createdAt: now,
    updatedAt: now,
  };

  if (redisConfigured()) {
    const redis = await getRedis();
    await redis.set(itemKey(id), JSON.stringify(row));
    await redis.lpush(ORDER_KEY, id);
    return row;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  const all = await readFileStore();
  all.unshift(row);
  await writeFileStore(all);
  return row;
}

export async function setCostAnswer(
  id: string,
  costAnswer: string
): Promise<Submission | null> {
  const trimmed = costAnswer.trim();
  if (!trimmed) return null;

  if (redisConfigured()) {
    const redis = await getRedis();
    const raw = await redis.get<string>(itemKey(id));
    if (raw == null || typeof raw !== "string") return null;
    const row = JSON.parse(raw) as Submission;
    row.costAnswer = trimmed;
    row.updatedAt = new Date().toISOString();
    await redis.set(itemKey(id), JSON.stringify(row));
    return row;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  const all = await readFileStore();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    costAnswer: trimmed,
    updatedAt: new Date().toISOString(),
  };
  await writeFileStore(all);
  return all[idx];
}

export async function listSubmissions(): Promise<Submission[]> {
  if (redisConfigured()) {
    const redis = await getRedis();
    const ids = await redis.lrange<string>(ORDER_KEY, 0, -1);
    if (!ids.length) return [];
    const out: Submission[] = [];
    for (const id of ids) {
      const raw = await redis.get<string>(itemKey(id));
      if (raw != null && typeof raw === "string") {
        out.push(JSON.parse(raw) as Submission);
      }
    }
    return out;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("REDIS_NOT_CONFIGURED");
  }

  return readFileStore();
}
