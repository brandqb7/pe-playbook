import { createClient } from "./supabase/client";

const KEYS = {
  LESSON_PLANS: "pe_lesson_plans",
  TIMER_CONFIG: "pe_timer_config",
  MVPA_DATA: "pe_mvpa_data",
  YEAR_PLAN: "pe_year_plan",
  SETTINGS: "pe_settings",
  WARM_UP_EXERCISES: "pe_warmup_exercises",
  COOL_DOWN_STRETCHES: "pe_cooldown_stretches",
  SAVED_GAMES: "pe_saved_games",
  SAVED_SKILLS: "pe_saved_skills",
};

// ─── localStorage helpers (offline / SSR fallback) ────────────────────────────

export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export function setItemDebounced<T>(key: string, value: T, ms = 500): void {
  clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(() => setItem(key, value), ms);
}

// ─── Supabase cloud helpers ────────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── Class Schedule ────────────────────────────────────────────────────────────

export interface ClassPeriod {
  label: string;
  start: string;
  end: string;
}

export async function getSchedule(): Promise<ClassPeriod[]> {
  const userId = await getUserId();
  if (!userId) return getItem<ClassPeriod[]>("pe_class_schedule", []);
  const supabase = createClient();
  const { data } = await supabase
    .from("class_schedules")
    .select("label, start_time, end_time, sort_order")
    .eq("user_id", userId)
    .order("sort_order");
  if (!data || data.length === 0) return getItem<ClassPeriod[]>("pe_class_schedule", []);
  return data.map((r) => ({ label: r.label, start: r.start_time, end: r.end_time }));
}

export async function saveSchedule(periods: ClassPeriod[]): Promise<void> {
  setItem("pe_class_schedule", periods);
  const userId = await getUserId();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("class_schedules").delete().eq("user_id", userId);
  if (periods.length > 0) {
    await supabase.from("class_schedules").insert(
      periods.map((p, i) => ({
        user_id: userId,
        label: p.label,
        start_time: p.start,
        end_time: p.end,
        sort_order: i,
      }))
    );
  }
}

// ── MVPA Records ─────────────────────────────────────────────────────────────

export interface MvpaRecord {
  date: string;
  mvpaSecs: number;
  classSecs: number;
  pct: number;
  savedAt: string;
}

export async function saveMvpaRecord(record: MvpaRecord): Promise<void> {
  // Local fallback
  const key = `mvpa_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`;
  const existing = getItem<MvpaRecord[]>(key, []);
  setItem(key, [...existing, record]);

  const userId = await getUserId();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("mvpa_records").insert({
    user_id: userId,
    date: record.date,
    mvpa_secs: record.mvpaSecs,
    class_secs: record.classSecs,
    pct: record.pct,
    saved_at: record.savedAt,
  });
}

export async function getMvpaRecords(): Promise<MvpaRecord[]> {
  const userId = await getUserId();
  if (!userId) {
    // Pull from all mvpa_ localStorage keys
    const records: MvpaRecord[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("mvpa_")) {
        const arr = getItem<MvpaRecord[]>(k, []);
        records.push(...arr);
      }
    }
    return records.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }
  const supabase = createClient();
  const { data } = await supabase
    .from("mvpa_records")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  return (data ?? []).map((r) => ({
    date: r.date,
    mvpaSecs: r.mvpa_secs,
    classSecs: r.class_secs,
    pct: r.pct,
    savedAt: r.saved_at,
  }));
}

// ── Timer Settings ────────────────────────────────────────────────────────────

export async function getTimerSettings<T>(fallback: T): Promise<T> {
  const userId = await getUserId();
  if (!userId) return getItem<T>("pe_timer_config", fallback);
  const supabase = createClient();
  const { data } = await supabase
    .from("timer_settings")
    .select("settings")
    .eq("user_id", userId)
    .single();
  return (data?.settings as T) ?? getItem<T>("pe_timer_config", fallback);
}

export async function saveTimerSettings<T>(settings: T): Promise<void> {
  setItem("pe_timer_config", settings);
  const userId = await getUserId();
  if (!userId) return;
  const supabase = createClient();
  await supabase.from("timer_settings").upsert(
    { user_id: userId, settings, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

// ── Generic JSON table helper ─────────────────────────────────────────────────

type JsonTable = "lesson_plans" | "year_plan" | "warm_up_exercises" | "cool_down_stretches";
type JsonField = "data" | "exercises" | "stretches";

const TABLE_FIELD: Record<JsonTable, JsonField> = {
  lesson_plans: "data",
  year_plan: "data",
  warm_up_exercises: "exercises",
  cool_down_stretches: "stretches",
};

const TABLE_LOCAL_KEY: Record<JsonTable, string> = {
  lesson_plans: KEYS.LESSON_PLANS,
  year_plan: KEYS.YEAR_PLAN,
  warm_up_exercises: KEYS.WARM_UP_EXERCISES,
  cool_down_stretches: KEYS.COOL_DOWN_STRETCHES,
};

export async function getCloudItem<T>(table: JsonTable, fallback: T): Promise<T> {
  const userId = await getUserId();
  if (!userId) return getItem<T>(TABLE_LOCAL_KEY[table], fallback);
  const supabase = createClient();
  const field = TABLE_FIELD[table];
  const { data } = await supabase
    .from(table)
    .select(field)
    .eq("user_id", userId)
    .single();
  return (data?.[field] as T) ?? getItem<T>(TABLE_LOCAL_KEY[table], fallback);
}

export async function saveCloudItem<T>(table: JsonTable, value: T): Promise<void> {
  setItem(TABLE_LOCAL_KEY[table], value);
  const userId = await getUserId();
  if (!userId) return;
  const supabase = createClient();
  const field = TABLE_FIELD[table];
  await supabase.from(table).upsert(
    { user_id: userId, [field]: value, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
}

export { KEYS };
