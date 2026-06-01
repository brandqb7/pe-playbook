/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { WARM_UP_EXERCISES, COOL_DOWN_STRETCHES } from "../../data/curriculum";
import { setItem, getItem } from "../../lib/storage";
import { showToast } from "../../lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassPeriod {
  label: string;
  start: string; // "HH:MM" 24-hr
  end: string;   // "HH:MM" 24-hr
}

// Parse "8:00 AM" / "13:30" / "8:00" → "HH:MM" 24-hr string
function parseTimeTo24(raw: string): string {
  const s = raw.trim();
  const ampm = /AM|PM/i.test(s);
  const [timePart, meridian] = s.toUpperCase().split(/\s+/);
  let [hStr, mStr] = timePart.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  if (ampm) {
    if (meridian === "PM" && h !== 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;
  }
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function parseScheduleCSV(text: string): ClassPeriod[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 3) return null;
      try {
        return { label: parts[0], start: parseTimeTo24(parts[1]), end: parseTimeTo24(parts[2]) };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as ClassPeriod[];
}

function nowHHMM(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function hhmm24ToMins(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minsToDisplay(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface Exercise {
  id: string;
  name: string;
  time: number;
  icon?: string;
}

interface Stretch {
  id: string;
  name: string;
  holdTime: number;
  icon?: string;
}

interface Station {
  id: string;
  name: string;
  type: "skill" | "activity";
}

interface SeqStep {
  ex: Exercise | Stretch;
  isRest: boolean;
  dur: number;
  idx: number;
}

type PhaseType = "warmup" | "instruction" | "station" | "rotation" | "cooldown";

interface Phase {
  type: PhaseType;
  label: string;
  color: string;
  dur?: number;
  steps?: SeqStep[];
  stIdx?: number;
  name?: string;
  isSk?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function fmtSec(s: number) {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function buildSteps(list: (Exercise | Stretch)[], defTime: number, restTime: number): SeqStep[] {
  const steps: SeqStep[] = [];
  list.forEach((ex, i) => {
    const dur = (ex as Stretch).holdTime ?? (ex as Exercise).time ?? defTime;
    steps.push({ ex, isRest: false, dur, idx: i });
    if (i < list.length - 1) {
      steps.push({ ex, isRest: true, dur: restTime, idx: i });
    }
  });
  return steps;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimerPage() {
  // ── Settings ──
  const [classMin, setClassMin] = useState(55);
  const [classHr, setClassHr] = useState(0);
  const [cooldownBuffer, setCooldownBuffer] = useState(7);
  const [wuExTime, setWuExTime] = useState(25);
  const [wuRestTime, setWuRestTime] = useState(8);
  const [stTime, setStTime] = useState(240);
  const [rotTime, setRotTime] = useState(45);
  const [cdExTime, setCdExTime] = useState(12);
  const [cdRestTime, setCdRestTime] = useState(5);

  const [wuExercises, setWuExercises] = useState<Exercise[]>(
    WARM_UP_EXERCISES.map((e) => ({ id: e.name, name: e.name, time: e.time, icon: e.icon }))
  );
  const [cdStretches, setCdStretches] = useState<Stretch[]>(
    COOL_DOWN_STRETCHES.map((s) => ({ id: s.name, name: s.name, holdTime: s.holdTime, icon: s.icon }))
  );

  const [stations, setStations] = useState<Station[]>([
    { id: "s1", name: "Overhand Throw Form", type: "skill" },
    { id: "s2", name: "Target Practice", type: "skill" },
    { id: "s3", name: "Cracker Ball", type: "activity" },
    { id: "s4", name: "Swamp Ball", type: "activity" },
  ]);

  // ── Mounted flag — prevents hydration mismatch for clock/schedule ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ── Schedule state (loaded client-side only to avoid hydration mismatch) ──
  const [schedule, setSchedule] = useState<ClassPeriod[]>([]);
  const [scheduleError, setScheduleError] = useState("");

  useEffect(() => {
    const stored = getItem<ClassPeriod[]>("pe_class_schedule", []);
    if (stored.length > 0) setSchedule(stored);
  }, []);

  useEffect(() => { setItem("pe_class_schedule", schedule); }, [schedule]);

  // ── Live clock ──
  const [clockDisplay, setClockDisplay] = useState("");
  const [activePeriod, setActivePeriod] = useState<{ period: ClassPeriod; minsLeft: number; cdMinsLeft: number } | null>(null);

  // Refs declared before the effect that uses them
  const scheduleRef = useRef(schedule);
  useEffect(() => { scheduleRef.current = schedule; }, [schedule]);
  const cooldownBufferRef = useRef(cooldownBuffer);
  useEffect(() => { cooldownBufferRef.current = cooldownBuffer; }, [cooldownBuffer]);

  useEffect(() => {
    function tick() {
      const d = new Date();
      const h = d.getHours();
      const m = d.getMinutes().toString().padStart(2, "0");
      const s = d.getSeconds().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = ((h % 12) || 12).toString();
      setClockDisplay(`${h12}:${m}:${s} ${ampm}`);

      // Update active period each tick
      const nowMins = h * 60 + parseInt(m, 10);
      const found = scheduleRef.current.find((p) => {
        const s2 = hhmm24ToMins(p.start);
        const e = hhmm24ToMins(p.end);
        return nowMins >= s2 && nowMins < e;
      });
      if (found) {
        const minsLeft = hhmm24ToMins(found.end) - nowMins;
        setActivePeriod({ period: found, minsLeft, cdMinsLeft: minsLeft - cooldownBufferRef.current });
      } else {
        setActivePeriod(null);
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  function handleScheduleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseScheduleCSV(text);
      if (parsed.length === 0) {
        setScheduleError("No valid rows found. Format: Period Name, Start Time, End Time");
        return;
      }
      setSchedule(parsed);
      setScheduleError("");
      showToast(`Schedule loaded — ${parsed.length} periods`, "success");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── Timer state ──
  const [sequence, setSequence] = useState<Phase[]>([]);
  const [seqIdx, setSeqIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [instrMode, setInstrMode] = useState(false);
  const [instrElapsed, setInstrElapsed] = useState(0);
  const [built, setBuilt] = useState(false);
  const [classEnded, setClassEnded] = useState(false);

  // ── MVPA tracking ──
  const [mvpaSecs, setMvpaSecs] = useState(0);
  const [classSecs, setClassSecs] = useState(0);

  // ── Refs for stable closure access ──
  const seqRef = useRef(sequence);
  const seqIdxRef = useRef(seqIdx);
  const exIdxRef = useRef(exIdx);
  const timeLeftRef = useRef(timeLeft);
  const totalTimeRef = useRef(totalTime);
  const runningRef = useRef(running);
  const instrModeRef = useRef(instrMode);
  const mvpaSecsRef = useRef(mvpaSecs);
  const classSecsRef = useRef(classSecs);
  const instrElapsedRef = useRef(instrElapsed);
  const beepFiredRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { seqRef.current = sequence; }, [sequence]);
  useEffect(() => { seqIdxRef.current = seqIdx; }, [seqIdx]);
  useEffect(() => { exIdxRef.current = exIdx; }, [exIdx]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { totalTimeRef.current = totalTime; }, [totalTime]);
  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { instrModeRef.current = instrMode; }, [instrMode]);
  useEffect(() => { mvpaSecsRef.current = mvpaSecs; }, [mvpaSecs]);
  useEffect(() => { classSecsRef.current = classSecs; }, [classSecs]);
  useEffect(() => { instrElapsedRef.current = instrElapsed; }, [instrElapsed]);

  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const instrTickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
  }, []);

  function speak(text: string) {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.volume = 0.8;
    synthRef.current.speak(u);
  }

  function beep() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // ── Build sequence ──
  const buildSequence = useCallback(() => {
    const seq: Phase[] = [];

    const wuList = wuExercises.map((e) => ({ ...e }));
    seq.push({
      type: "warmup",
      label: "Warm-Up",
      color: "#06b6d4",
      steps: buildSteps(wuList as (Exercise | Stretch)[], wuExTime, wuRestTime),
    });

    seq.push({ type: "instruction", label: "Instruction", color: "#a855f7", dur: 0 });

    stations.forEach((st, i) => {
      seq.push({
        type: "station",
        label: `Station ${i + 1}`,
        color: "#22c55e",
        stIdx: i,
        name: st.name,
        isSk: st.type === "skill",
        dur: stTime,
      });
      if (i < stations.length - 1) {
        seq.push({ type: "rotation", label: "Rotate", color: "#f97316", dur: rotTime });
      }
    });

    const cdList = cdStretches.map((s) => ({ ...s }));
    seq.push({
      type: "cooldown",
      label: "Cool-Down",
      color: "#a855f7",
      steps: buildSteps(cdList as (Exercise | Stretch)[], cdExTime, cdRestTime),
    });

    return seq;
  }, [wuExercises, wuExTime, wuRestTime, cdStretches, stations, stTime, rotTime, cdExTime, cdRestTime]);

  const applyAndBuild = useCallback(() => {
    stopAll();
    const seq = buildSequence();
    setSequence(seq);
    setSeqIdx(0);
    setExIdx(0);
    setMvpaSecs(0);
    setClassSecs(0);
    setInstrMode(false);
    setInstrElapsed(0);
    setClassEnded(false);
    setBuilt(true);

    const firstPhase = seq[0];
    const firstDur = firstPhase.steps ? firstPhase.steps[0].dur : firstPhase.dur ?? 0;
    setTotalTime(firstDur);
    setTimeLeft(firstDur);
    beepFiredRef.current = false;

    showToast("Timer built — ready to start!", "success");
  }, [buildSequence]);

  function stopAll() {
    if (tickerRef.current) clearInterval(tickerRef.current);
    if (instrTickerRef.current) clearInterval(instrTickerRef.current);
    tickerRef.current = null;
    instrTickerRef.current = null;
    setRunning(false);
    setInstrMode(false);
    synthRef.current?.cancel();
  }

  // ── Main tick ──
  const doTick = useCallback(() => {
    const seq = seqRef.current;
    const si = seqIdxRef.current;
    const ei = exIdxRef.current;
    const tl = timeLeftRef.current;
    // MVPA tracking
    const p = seq[si];
    if (p) {
      classSecsRef.current++;
      setClassSecs((s) => s + 1);
      if (p.type === "warmup" || p.type === "station" || p.type === "cooldown") {
        if (p.steps) {
          const step = p.steps[ei];
          if (step && !step.isRest) {
            mvpaSecsRef.current++;
            setMvpaSecs((s) => s + 1);
          }
        } else {
          mvpaSecsRef.current++;
          setMvpaSecs((s) => s + 1);
        }
      } else if (p.type === "rotation" && classSecsRef.current % 2 === 0) {
        mvpaSecsRef.current++;
        setMvpaSecs((s) => s + 1);
      }
    }

    if (tl === 5 && !beepFiredRef.current) {
      beep();
      beepFiredRef.current = true;
    }

    if (tl > 0) {
      setTimeLeft((t) => t - 1);
      timeLeftRef.current = tl - 1;
      return;
    }

    // Phase/step advance
    if (p?.steps) {
      const step = p.steps[ei];
      if (!step.isRest) speak("Rest");
      const nextEi = ei + 1;
      if (nextEi < p.steps.length) {
        exIdxRef.current = nextEi;
        setExIdx(nextEi);
        const next = p.steps[nextEi];
        totalTimeRef.current = next.dur;
        timeLeftRef.current = next.dur;
        setTotalTime(next.dur);
        setTimeLeft(next.dur);
        beepFiredRef.current = false;
        if (!next.isRest) setTimeout(() => speak((next.ex as Exercise).name), 200);
        return;
      }
    }

    // Next phase
    const nextSi = si + 1;
    if (nextSi >= seq.length) {
      endClass();
      return;
    }

    seqIdxRef.current = nextSi;
    exIdxRef.current = 0;
    setSeqIdx(nextSi);
    setExIdx(0);
    beepFiredRef.current = false;

    const np = seq[nextSi];

    if (np.type === "instruction") {
      if (tickerRef.current) clearInterval(tickerRef.current);
      tickerRef.current = null;
      setRunning(false);
      instrModeRef.current = true;
      setInstrMode(true);
      instrElapsedRef.current = 0;
      setInstrElapsed(0);
      instrTickerRef.current = setInterval(() => {
        instrElapsedRef.current++;
        setInstrElapsed((e) => e + 1);
      }, 1000);
      return;
    } else if (np.type === "rotation") {
      speak("Rotate!");
    } else if (np.type === "station") {
      if (np.stIdx === 0) speak("All stations begin!");
    } else if (np.type === "cooldown") {
      speak("Cool down time.");
    }

    const dur = np.steps ? np.steps[0].dur : np.dur ?? 0;
    totalTimeRef.current = dur;
    timeLeftRef.current = dur;
    setTotalTime(dur);
    setTimeLeft(dur);
  }, []);

  function endClass() {
    stopAll();
    speak("Class complete! Great work everyone!");
    setClassEnded(true);
    // Save MVPA
    const entry = {
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      mvpaSecs: mvpaSecsRef.current,
      classSecs: classSecsRef.current,
      pct: classSecsRef.current > 0 ? Math.round((mvpaSecsRef.current / classSecsRef.current) * 100) : 0,
      savedAt: new Date().toISOString(),
    };
    const key = `mvpa_${new Date().toISOString().slice(0, 10).replace(/-/g, "_")}`;
    const existing = getItem<typeof entry[]>(key, []);
    setItem(key, [...existing, entry]);
    showToast("Class complete! MVPA saved.", "success");
  }

  function togglePlay() {
    if (!built) { showToast("Click 'Apply & Build Timer' first!", "error"); return; }
    if (!running) {
      setRunning(true);
      runningRef.current = true;
      if (seqIdxRef.current === 0 && exIdxRef.current === 0) {
        const firstStep = seqRef.current[0]?.steps?.[0];
        if (firstStep) speak((firstStep.ex as Exercise).name);
      }
      tickerRef.current = setInterval(doTick, 1000);
    } else {
      setRunning(false);
      runningRef.current = false;
      if (tickerRef.current) clearInterval(tickerRef.current);
      synthRef.current?.cancel();
    }
  }

  function startStations() {
    if (instrTickerRef.current) clearInterval(instrTickerRef.current);
    instrTickerRef.current = null;
    instrModeRef.current = false;
    setInstrMode(false);
    instrElapsedRef.current = 0;
    setInstrElapsed(0);

    const np = seqRef.current[seqIdxRef.current];
    const dur = np.steps ? np.steps[0].dur : np.dur ?? 0;
    totalTimeRef.current = dur;
    timeLeftRef.current = dur;
    setTotalTime(dur);
    setTimeLeft(dur);
    beepFiredRef.current = false;

    setRunning(true);
    runningRef.current = true;
    speak("All stations begin!");
    tickerRef.current = setInterval(doTick, 1000);
  }

  function skipPhase() {
    if (!built) return;
    const seq = seqRef.current;
    const si = seqIdxRef.current;
    const ei = exIdxRef.current;
    const p = seq[si];

    if (p?.steps && ei < p.steps.length - 1) {
      const next = ei + 1;
      exIdxRef.current = next;
      setExIdx(next);
      totalTimeRef.current = p.steps[next].dur;
      timeLeftRef.current = p.steps[next].dur;
      setTotalTime(p.steps[next].dur);
      setTimeLeft(p.steps[next].dur);
      beepFiredRef.current = false;
      return;
    }

    const nextSi = si + 1;
    if (nextSi >= seq.length) { resetTimer(); return; }
    seqIdxRef.current = nextSi;
    exIdxRef.current = 0;
    setSeqIdx(nextSi);
    setExIdx(0);
    beepFiredRef.current = false;

    if (seq[nextSi].type === "instruction") {
      instrModeRef.current = true;
      setInstrMode(true);
      return;
    }

    const dur = seq[nextSi].steps ? seq[nextSi].steps![0].dur : seq[nextSi].dur ?? 0;
    totalTimeRef.current = dur;
    timeLeftRef.current = dur;
    setTotalTime(dur);
    setTimeLeft(dur);
  }

  function resetTimer() {
    stopAll();
    setMvpaSecs(0);
    setClassSecs(0);
    setInstrElapsed(0);
    setClassEnded(false);
    setSeqIdx(0);
    setExIdx(0);
    seqIdxRef.current = 0;
    exIdxRef.current = 0;
    mvpaSecsRef.current = 0;
    classSecsRef.current = 0;
    beepFiredRef.current = false;

    if (sequence.length > 0) {
      const dur = sequence[0].steps ? sequence[0].steps[0].dur : sequence[0].dur ?? 0;
      setTotalTime(dur);
      setTimeLeft(dur);
      totalTimeRef.current = dur;
      timeLeftRef.current = dur;
    }
  }

  // ── Calculated values ──
  function calcBreakdown() {
    const totalClass = (classHr * 60 + classMin) * 60;
    const wuTotal = wuExercises.length * wuExTime + Math.max(0, wuExercises.length - 1) * wuRestTime;
    const cdTotal = cdStretches.reduce((a, s) => a + s.holdTime, 0) + Math.max(0, cdStretches.length - 1) * cdRestTime;
    const bufferSec = cooldownBuffer * 60;
    const stBlock = stations.length * stTime + Math.max(0, stations.length - 1) * rotTime;
    const instrAvail = totalClass - wuTotal - stBlock - Math.max(cdTotal, bufferSec);
    return { totalClass, wuTotal, cdTotal: Math.max(cdTotal, bufferSec), stBlock, instrAvail };
  }

  const bd = calcBreakdown();

  // ── Current phase info ──
  const curPhase = sequence[seqIdx];
  const curStep = curPhase?.steps?.[exIdx];
  const mvpaPct = classSecs > 0 ? Math.round((mvpaSecs / classSecs) * 100) : 0;
  const mvpaColor = mvpaPct >= 50 ? "#22c55e" : mvpaPct >= 35 ? "#f59e0b" : "#ef4444";
  const progressPct = totalTime > 0 ? ((timeLeft / totalTime) * 100) : 0;

  // ── Warm-up drag-to-reorder ──
  const dragIndexRef = useRef<number | null>(null);

  function onWuDragStart(i: number) {
    dragIndexRef.current = i;
  }

  function onWuDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === i) return;
    setWuExercises((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      return next;
    });
    dragIndexRef.current = i;
  }

  function onWuDragEnd() {
    dragIndexRef.current = null;
  }

  // ── Cool-down drag-to-reorder ──
  const cdDragIndexRef = useRef<number | null>(null);

  function onCdDragStart(i: number) {
    cdDragIndexRef.current = i;
  }

  function onCdDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    const from = cdDragIndexRef.current;
    if (from === null || from === i) return;
    setCdStretches((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      return next;
    });
    cdDragIndexRef.current = i;
  }

  function onCdDragEnd() {
    cdDragIndexRef.current = null;
  }

  function addStation() {
    setStations((prev) => [...prev, { id: `s${Date.now()}`, name: `Station ${prev.length + 1}`, type: "skill" }]);
  }

  function removeStation(id: string) {
    setStations((prev) => prev.length > 1 ? prev.filter((s) => s.id !== id) : prev);
  }

  function toggleStationType(id: string) {
    setStations((prev) => prev.map((s) => s.id === id ? { ...s, type: s.type === "skill" ? "activity" : "skill" } : s));
  }

  const phaseLabel = instrMode
    ? "Instruction Time"
    : curPhase?.type === "warmup"
    ? curStep?.isRest ? "Rest" : `Warm-Up: ${(curStep?.ex as Exercise)?.name ?? ""}`
    : curPhase?.type === "station"
    ? "Station Time — All Running"
    : curPhase?.type === "rotation"
    ? "ROTATE!"
    : curPhase?.type === "cooldown"
    ? curStep?.isRest ? "Rest" : `Cool-Down: ${(curStep?.ex as Stretch)?.name ?? ""}`
    : "—";

  const phaseColor = instrMode ? "#a855f7" : curPhase?.color ?? "var(--text)";

  return (
    <div className="flex overflow-hidden" style={{ background: "var(--bg)", fontFamily: "var(--font-dm-sans)", height: "calc(100vh - 56px)" }}>
      {/* ── Sidebar ── */}
      <div
        className="w-72 min-w-72 flex flex-col overflow-y-auto border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Logo + Live Clock */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="font-bebas text-lg tracking-widest" style={{ color: "var(--green)" }}>
            SMART TIMER
          </div>
          <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
            From warm-up to cool-down — fully organized
          </div>
          {/* Live clock — client-only to avoid hydration mismatch */}
          {mounted && (
            <div
              className="rounded-xl px-3 py-2 text-center"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
            >
              <div className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: "var(--dim)" }}>
                Current Time
              </div>
              <div className="font-bebas text-3xl tracking-wider" style={{ color: "var(--text)" }}>
                {clockDisplay}
              </div>
              {/* Current period info */}
              {!activePeriod && schedule.length > 0 && (
                <div className="text-xs mt-1" style={{ color: "var(--dim)" }}>No class in session</div>
              )}
              {activePeriod && (() => {
                const { period, minsLeft, cdMinsLeft } = activePeriod;
                const cdAlert = cdMinsLeft <= 0;
                const cdSoon = cdMinsLeft > 0 && cdMinsLeft <= 2;
                return (
                  <div className="mt-1.5 text-xs space-y-0.5">
                    <div className="font-bold" style={{ color: "var(--green)" }}>{period.label}</div>
                    <div style={{ color: "var(--muted)" }}>
                      {period.start.replace(/^0/, "")} – {period.end.replace(/^0/, "")} · {minsLeft}m left
                    </div>
                    <div
                      className="font-bold mt-1 px-2 py-1 rounded"
                      style={{
                        background: cdAlert ? "rgba(239,68,68,0.15)" : cdSoon ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.1)",
                        color: cdAlert ? "#ef4444" : cdSoon ? "#f59e0b" : "var(--dim)",
                      }}
                    >
                      {cdAlert ? "🧘 Cool-down now!" : cdSoon ? `⚠️ Cool-down in ${cdMinsLeft}m` : `🧘 Cool-down in ${cdMinsLeft}m`}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Schedule upload — client-only to avoid hydration mismatch */}
        {mounted && (
          <SideSection title="Schedule" icon="📅">
            {schedule.length === 0 ? (
              <div>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>
                  Upload a CSV to auto-detect your class periods.
                </p>
                <p className="text-xs mb-3 font-mono px-2 py-1.5 rounded" style={{ background: "var(--surface2)", color: "var(--dim)", fontSize: "10px" }}>
                  Period 1, 8:00 AM, 8:55 AM{"\n"}
                  Period 2, 9:05 AM, 10:00 AM
                </p>
                <label
                  className="flex items-center justify-center gap-2 w-full text-xs font-bold py-2 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                  style={{ background: "var(--green)", color: "#000" }}
                >
                  ↑ Upload Schedule CSV
                  <input type="file" accept=".csv,.txt" className="hidden" onChange={handleScheduleUpload} />
                </label>
                {scheduleError && (
                  <p className="text-xs mt-2" style={{ color: "#ef4444" }}>{scheduleError}</p>
                )}
              </div>
            ) : (
              <div>
                <div className="space-y-1 mb-3 max-h-36 overflow-y-auto pr-1">
                  {schedule.map((p, i) => {
                    const isActive = activePeriod?.period.label === p.label && activePeriod?.period.start === p.start;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 text-xs px-2 py-1.5 rounded-lg"
                        style={{
                          background: isActive ? "rgba(34,197,94,0.1)" : "var(--surface2)",
                          border: `1px solid ${isActive ? "rgba(34,197,94,0.4)" : "var(--border)"}`,
                          color: isActive ? "var(--text)" : "var(--muted)",
                        }}
                      >
                        <span className="font-bold truncate">{isActive ? "▶ " : ""}{p.label}</span>
                        <span className="flex-shrink-0" style={{ color: "var(--dim)" }}>
                          {p.start.replace(/^0/, "")}–{p.end.replace(/^0/, "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <label
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-1.5 rounded-lg cursor-pointer hover:opacity-80"
                    style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                  >
                    ↑ Replace
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleScheduleUpload} />
                  </label>
                  <button
                    onClick={() => { setSchedule([]); setItem("pe_class_schedule", []); }}
                    className="flex-1 text-xs font-bold py-1.5 rounded-lg hover:opacity-80"
                    style={{ background: "var(--surface2)", color: "var(--dim)", border: "1px solid var(--border)" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </SideSection>
        )}

        {/* Class time */}
        <SideSection title="Class Time" icon="🕐">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Hours</label>
              <input
                type="number"
                value={classHr}
                min={0}
                max={2}
                onChange={(e) => setClassHr(Number(e.target.value))}
                className="w-full text-center font-bold rounded-lg px-2 py-1.5 text-sm"
                style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)" }}
              />
            </div>
            <div className="font-bold text-lg" style={{ color: "var(--muted)" }}>:</div>
            <div className="flex-1">
              <label className="text-xs mb-1 block" style={{ color: "var(--muted)" }}>Minutes</label>
              <input
                type="number"
                value={classMin}
                min={15}
                max={90}
                onChange={(e) => setClassMin(Number(e.target.value))}
                className="w-full text-center font-bold rounded-lg px-2 py-1.5 text-sm"
                style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)" }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs flex-1" style={{ color: "var(--muted)" }}>Cool-down buffer (min)</label>
            <input
              type="number"
              value={cooldownBuffer}
              min={3}
              max={15}
              onChange={(e) => setCooldownBuffer(Number(e.target.value))}
              className="w-14 text-center font-bold rounded-lg px-1 py-1"
              style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: "12px" }}
            />
          </div>
          {/* Breakdown */}
          <div className="mt-3 rounded-lg p-3 text-xs space-y-1.5" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <BreakdownRow label="Class" val={fmtSec(bd.totalClass)} />
            <BreakdownRow label="Warm-Up" val={fmtSec(bd.wuTotal)} />
            <BreakdownRow label="Stations" val={`${stations.length} × ${fmtSec(stTime)} = ${fmtSec(bd.stBlock)}`} />
            <BreakdownRow label="Cool-Down" val={fmtSec(bd.cdTotal)} />
            <div className="pt-1 border-t" style={{ borderColor: "var(--border)" }}>
              <BreakdownRow
                label="For instruction"
                val={fmtSec(Math.max(0, bd.instrAvail))}
                highlight={bd.instrAvail < 0 ? "#ef4444" : bd.instrAvail < 300 ? "#f59e0b" : "#22c55e"}
              />
            </div>
          </div>
        </SideSection>

        {/* Timer values */}
        <SideSection title="Timing" icon="⏱">
          <div className="space-y-2">
            <AdjRow label="Warm-Up Exercise" val={wuExTime} unit="s" min={5} max={60} onChange={setWuExTime} />
            <AdjRow label="Warm-Up Rest" val={wuRestTime} unit="s" min={1} max={30} onChange={setWuRestTime} />
            <AdjRow label="Station Time" val={stTime} unit="s" min={60} max={900} onChange={setStTime} fmt={fmtSec} />
            <AdjRow label="Rotation Time" val={rotTime} unit="s" min={10} max={120} onChange={setRotTime} fmt={fmtSec} />
            <AdjRow label="Cool-Down Hold" val={cdExTime} unit="s" min={5} max={60} onChange={setCdExTime} />
            <AdjRow label="Cool-Down Rest" val={cdRestTime} unit="s" min={1} max={30} onChange={setCdRestTime} />
          </div>
        </SideSection>

        {/* Stations */}
        <SideSection title={`Stations (${stations.length})`} icon="🏃">
          <div className="space-y-2 mb-3">
            {stations.map((st, i) => (
              <div key={st.id} className="flex items-center gap-1.5">
                <span className="text-xs font-bold w-5 flex-shrink-0 text-center" style={{ color: "var(--dim)" }}>
                  {i + 1}
                </span>
                <button
                  onClick={() => toggleStationType(st.id)}
                  className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded"
                  style={{
                    background: st.type === "skill" ? "rgba(59,130,246,0.2)" : "rgba(249,115,22,0.2)",
                    color: st.type === "skill" ? "#3b82f6" : "#f97316",
                    border: `1px solid ${st.type === "skill" ? "rgba(59,130,246,0.4)" : "rgba(249,115,22,0.4)"}`,
                  }}
                >
                  {st.type === "skill" ? "Skill" : "Activity"}
                </button>
                <input
                  value={st.name}
                  onChange={(e) => setStations((prev) => prev.map((s) => s.id === st.id ? { ...s, name: e.target.value } : s))}
                  className="flex-1 min-w-0 text-xs px-2 py-1 rounded"
                  style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)" }}
                />
                <button
                  onClick={() => removeStation(st.id)}
                  className="flex-shrink-0 text-xs px-1.5 py-1 rounded hover:bg-red-500/20"
                  style={{ color: "var(--dim)" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addStation}
            className="w-full text-xs font-bold py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            + Add Station
          </button>
        </SideSection>

        {/* Warm-up exercises */}
        <SideSection title={`Warm-Up (${wuExercises.length})`} icon="🔥">
          <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto pr-1">
            {wuExercises.map((ex, i) => (
              <div
                key={ex.id}
                className="flex items-center gap-1.5 rounded"
                draggable
                onDragStart={() => onWuDragStart(i)}
                onDragOver={(e) => onWuDragOver(e, i)}
                onDragEnd={onWuDragEnd}
                style={{ cursor: "grab" }}
              >
                <span
                  className="text-sm select-none flex-shrink-0"
                  style={{ color: "var(--dim)", cursor: "grab", lineHeight: 1 }}
                  title="Drag to reorder"
                >
                  ⠿
                </span>
                <input
                  value={ex.name}
                  onChange={(e) => setWuExercises((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 min-w-0 text-xs px-2 py-1 rounded"
                  style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)", cursor: "text" }}
                />
                <button
                  onClick={() => setWuExercises((prev) => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev)}
                  className="text-xs px-1 rounded hover:opacity-70 flex-shrink-0"
                  style={{ color: "var(--dim)", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setWuExercises((prev) => [...prev, { id: `ex${Date.now()}`, name: "New Exercise", time: wuExTime }])}
            className="w-full text-xs font-bold py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            + Add Exercise
          </button>
        </SideSection>

        {/* Cool-down (draggable) */}
        <SideSection title={`Cool-Down (${cdStretches.length})`} icon="🧘">
          <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5">
            {cdStretches.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 rounded"
                draggable
                onDragStart={() => onCdDragStart(i)}
                onDragOver={(e) => onCdDragOver(e, i)}
                onDragEnd={onCdDragEnd}
                style={{ cursor: "grab" }}
              >
                <span
                  className="text-sm select-none flex-shrink-0"
                  style={{ color: "var(--dim)", cursor: "grab", lineHeight: 1 }}
                  title="Drag to reorder"
                >
                  ⠿
                </span>
                <input
                  value={s.name}
                  onChange={(e) => setCdStretches((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                  className="flex-1 min-w-0 text-xs px-2 py-1 rounded"
                  style={{ background: "var(--surface3)", border: "1px solid var(--border2)", color: "var(--text)", cursor: "text" }}
                />
                <span className="text-xs flex-shrink-0" style={{ color: "var(--dim)" }}>{s.holdTime}s</span>
              </div>
            ))}
          </div>
        </SideSection>

        {/* Apply button */}
        <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={applyAndBuild}
            className="w-full font-bold text-sm py-3 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--green)", color: "#000" }}
          >
            Apply &amp; Build Class Timer
          </button>
        </div>
      </div>

      {/* ── Main display ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Phase flow bar */}
        <div className="px-6 py-3 border-b overflow-x-auto" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          {built ? (
            <div className="flex items-center gap-1 min-w-max">
              {sequence.map((p, i) => (
                <div key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-xs px-1" style={{ color: "var(--dim)" }}>›</span>}
                  <div
                    className="text-xs font-bold px-2 py-1 rounded-lg transition-all"
                    style={{
                      background: i === seqIdx ? `${p.color}20` : i < seqIdx ? "var(--surface3)" : "var(--surface2)",
                      border: `1px solid ${i === seqIdx ? p.color : "var(--border)"}`,
                      color: i === seqIdx ? p.color : i < seqIdx ? "var(--dim)" : "var(--muted)",
                      textDecoration: i < seqIdx ? "line-through" : undefined,
                    }}
                  >
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm" style={{ color: "var(--dim)" }}>
              Configure settings on the left, then click <strong style={{ color: "var(--green)" }}>Apply &amp; Build</strong> to start
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {/* ── Instruction pause overlay ── */}
            {instrMode && (
              <div
                className="rounded-2xl p-8 text-center mb-6"
                style={{ background: "rgba(168,85,247,0.08)", border: "2px solid rgba(168,85,247,0.5)" }}
              >
                <div className="font-bebas text-2xl tracking-wider mb-2" style={{ color: "#a855f7" }}>
                  INSTRUCTION TIME
                </div>
                <div className="font-bebas text-5xl tracking-wider mb-4" style={{ color: "#a855f7" }}>
                  {fmt(instrElapsed)}
                </div>
                <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                  Timer paused — demonstrate each station. Take the time you need.
                </p>
                <button
                  onClick={startStations}
                  className="font-bold text-base px-8 py-4 rounded-xl transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "#22c55e", color: "#000" }}
                >
                  ▶ Start Stations
                </button>
              </div>
            )}

            {/* ── Big timer display ── */}
            {!instrMode && (
              <div
                className="rounded-2xl p-8 text-center mb-6"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${built ? "var(--border)" : "var(--border)"}`,
                }}
              >
                {/* Phase type label */}
                <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
                  {built
                    ? curPhase?.type === "warmup"
                      ? curStep?.isRest ? "Rest" : `Exercise ${(curStep?.idx ?? 0) + 1} of ${wuExercises.length}`
                      : curPhase?.type === "station"
                      ? "All Stations Running"
                      : curPhase?.type === "rotation"
                      ? "Rotation"
                      : curPhase?.type === "cooldown"
                      ? curStep?.isRest ? "Rest" : `Stretch ${(curStep?.idx ?? 0) + 1} of ${cdStretches.length}`
                      : ""
                    : "Ready"
                  }
                </div>

                {/* Big time */}
                <div
                  className="font-bebas tracking-wider leading-none mb-3"
                  style={{
                    fontSize: "clamp(80px, 15vw, 140px)",
                    color: !built ? "var(--dim)" : timeLeft <= 5 ? "#ef4444" : timeLeft <= 15 ? "#f59e0b" : phaseColor,
                  }}
                >
                  {built ? fmt(timeLeft) : "0:00"}
                </div>

                {/* Phase name */}
                <div
                  className="font-dm font-bold text-2xl mb-2"
                  style={{ color: built ? phaseColor : "var(--dim)" }}
                >
                  {built ? phaseLabel : "Build timer to start"}
                </div>

                {/* Progress bar */}
                <div className="relative h-2 rounded-full mb-6 overflow-hidden" style={{ background: "var(--surface3)" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${progressPct}%`, background: phaseColor }}
                  />
                </div>

                {/* Exercise dots */}
                {built && (curPhase?.type === "warmup" || curPhase?.type === "cooldown") && curPhase.steps && (
                  <div className="flex justify-center gap-1.5 mb-6">
                    {curPhase.steps
                      .filter((s) => !s.isRest)
                      .map((s, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full transition-all"
                          style={{
                            background:
                              i < (curStep?.idx ?? 0)
                                ? "var(--green)"
                                : i === (curStep?.isRest ? (curStep?.idx ?? 0) : (curStep?.idx ?? 0))
                                ? phaseColor
                                : "var(--surface3)",
                          }}
                        />
                      ))}
                  </div>
                )}

                {/* Controls */}
                {!classEnded ? (
                  <div className="flex justify-center gap-3">
                    {instrMode ? null : (
                      <button
                        onClick={togglePlay}
                        className="font-bold text-sm px-6 py-3 rounded-xl transition-all hover:opacity-90 active:scale-95 min-w-28"
                        style={{
                          background: running ? "var(--surface3)" : "var(--green)",
                          color: running ? "var(--text)" : "#000",
                          border: running ? "1px solid var(--border)" : "none",
                        }}
                      >
                        {running ? "⏸ Pause" : "▶ Play"}
                      </button>
                    )}
                    {built && (
                      <>
                        <button
                          onClick={skipPhase}
                          className="font-bold text-sm px-5 py-3 rounded-xl transition-all hover:opacity-80"
                          style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                        >
                          Skip →
                        </button>
                        <button
                          onClick={resetTimer}
                          className="font-bold text-sm px-5 py-3 rounded-xl transition-all hover:opacity-80"
                          style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                        >
                          ↺
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { resetTimer(); setBuilt(false); applyAndBuild(); }}
                    className="font-bold text-base px-8 py-3 rounded-xl transition-all hover:opacity-90"
                    style={{ background: "var(--green)", color: "#000" }}
                  >
                    ↺ New Class
                  </button>
                )}
              </div>
            )}

            {/* ── MVPA panel ── */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-bold tracking-wide uppercase mb-1" style={{ color: "var(--muted)" }}>
                  MVPA Time
                </div>
                <div className="font-bebas text-3xl" style={{ color: mvpaColor }}>
                  {fmt(mvpaSecs)}
                </div>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-bold tracking-wide uppercase mb-1" style={{ color: "var(--muted)" }}>
                  MVPA %
                </div>
                <div className="font-bebas text-3xl" style={{ color: mvpaColor }}>
                  {mvpaPct}%
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--dim)" }}>Goal: 50%</div>
              </div>
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs font-bold tracking-wide uppercase mb-1" style={{ color: "var(--muted)" }}>
                  Class Time
                </div>
                <div className="font-bebas text-3xl" style={{ color: "var(--text)" }}>
                  {fmt(classSecs)}
                </div>
              </div>
            </div>

            {/* MVPA progress bar */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>30-Min MVPA Goal</span>
                <span className="text-xs font-bold" style={{ color: mvpaColor }}>
                  {fmt(mvpaSecs)} / 30:00
                </span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "var(--surface3)" }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((mvpaSecs / 1800) * 100))}%`,
                    background: mvpaColor,
                  }}
                />
              </div>
            </div>

            {/* ── Station cards ── */}
            {built && (
              <div>
                <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--muted)" }}>
                  Stations
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {stations.map((st, i) => {
                    const isActive = !instrMode && curPhase?.type === "station";
                    return (
                      <div
                        key={st.id}
                        className="rounded-xl p-4 transition-all"
                        style={{
                          background: isActive
                            ? st.type === "skill"
                              ? "rgba(59,130,246,0.12)"
                              : "rgba(249,115,22,0.12)"
                            : "var(--surface)",
                          border: `1px solid ${
                            isActive
                              ? st.type === "skill"
                                ? "rgba(59,130,246,0.5)"
                                : "rgba(249,115,22,0.5)"
                              : "var(--border)"
                          }`,
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              background: st.type === "skill" ? "rgba(59,130,246,0.2)" : "rgba(249,115,22,0.2)",
                              color: st.type === "skill" ? "#3b82f6" : "#f97316",
                            }}
                          >
                            {st.type === "skill" ? "📘 Skill" : "🏃 Activity"}
                          </span>
                        </div>
                        <div className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
                          {st.name}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>
                          Station {i + 1}
                        </div>
                        {isActive && (
                          <div className="mt-2 text-xs font-bold" style={{ color: "#22c55e" }}>
                            ▶ Running
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SideSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function BreakdownRow({ label, val, highlight }: { label: string; val: string; highlight?: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: "var(--dim)" }}>{label}</span>
      <span className="font-bold" style={{ color: highlight ?? "var(--text)" }}>
        {val}
      </span>
    </div>
  );
}

function AdjRow({
  label,
  val,
  unit,
  min,
  max,
  onChange,
  fmt: fmtFn,
}: {
  label: string;
  val: number;
  unit: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs flex-1" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, val - (min >= 60 ? 30 : 1)))}
          className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center"
          style={{ background: "var(--surface3)", color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          −
        </button>
        <span className="text-xs font-bold w-12 text-center" style={{ color: "var(--text)" }}>
          {fmtFn ? fmtFn(val) : `${val}${unit}`}
        </span>
        <button
          onClick={() => onChange(Math.min(max, val + (min >= 60 ? 30 : 1)))}
          className="w-6 h-6 rounded text-sm font-bold flex items-center justify-center"
          style={{ background: "var(--surface3)", color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          +
        </button>
      </div>
    </div>
  );
}
