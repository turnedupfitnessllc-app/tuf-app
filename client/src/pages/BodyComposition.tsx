// BodyComposition.tsx — TUF Body Composition Tracker
// Mirrors the TUF Body Composition Assessment form from Drive
// Calculates BMI + U.S. Navy body fat % + tracks history
// Unit system: imperial (lbs/in) or metric (kg/cm) via useUnitPreference
import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useBodyComp,
  calculateBMI,
  calculateBodyFatNavy,
  getBMICategory,
  getBodyFatCategory,
  type BodyMeasurements,
} from "../hooks/useBodyComp";
import { useUnitPreference } from "@/hooks/useUnitPreference";

// ─── Helper ────────────────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChange,
  unit,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm outline-none"
        />
        {unit && (
          <span className="px-3 text-gray-500 text-xs font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}

function DeltaBadge({ delta, inverse = false }: { delta: number | null; inverse?: boolean }) {
  if (delta === null || delta === 0) return null;
  const isGood = inverse ? delta < 0 : delta > 0;
  return (
    <span
      className={`text-xs font-bold ml-2 ${isGood ? "text-emerald-400" : "text-red-400"}`}
    >
      {delta > 0 ? "+" : ""}
      {delta}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function BodyComposition() {
  const { history, latestEntry, saveEntry, getDelta, hasData } = useBodyComp();

  // Unit preference — storage is always lbs/inches (imperial-native)
  const {
    system, isImperial, toggleSystem,
    weightUnit, measureUnit,
    kgToLbs, lbsToKg, cmToInches, inchesToCm,
  } = useUnitPreference();

  // Convert stored lbs/inches → display units
  const toDisp = useMemo(() => ({
    weight: (lbs: number) => isImperial ? lbs : Math.round(lbsToKg(lbs) * 10) / 10,
    meas:   (inches: number) => isImperial ? inches : Math.round(inchesToCm(inches) * 10) / 10,
  }), [isImperial, lbsToKg, inchesToCm]);

  // Convert display input → lbs/inches for storage
  const toStore = useMemo(() => ({
    weight: (v: number) => isImperial ? v : Math.round(kgToLbs(v) * 10) / 10,
    meas:   (v: number) => isImperial ? v : Math.round(cmToInches(v) * 10) / 10,
  }), [isImperial, kgToLbs, cmToInches]);

  const [gender, setGender] = useState<"male" | "female">(
    (latestEntry?.gender as "male" | "female") ?? "male"
  );

  // Form values are always in display units (converted on save)
  const [form, setForm] = useState({
    weight: latestEntry?.weight ? toDisp.weight(latestEntry.weight).toString() : "",
    height: latestEntry?.height ? toDisp.meas(latestEntry.height).toString() : "",
    age: latestEntry?.age?.toString() ?? "",
    neck: latestEntry?.neck ? toDisp.meas(latestEntry.neck).toString() : "",
    chest: latestEntry?.chest ? toDisp.meas(latestEntry.chest).toString() : "",
    waist: latestEntry?.waist ? toDisp.meas(latestEntry.waist).toString() : "",
    hips: latestEntry?.hips ? toDisp.meas(latestEntry.hips).toString() : "",
    bicepRight: latestEntry?.bicepRight ? toDisp.meas(latestEntry.bicepRight).toString() : "",
    bicepLeft: latestEntry?.bicepLeft ? toDisp.meas(latestEntry.bicepLeft).toString() : "",
    thighRight: latestEntry?.thighRight ? toDisp.meas(latestEntry.thighRight).toString() : "",
    thighLeft: latestEntry?.thighLeft ? toDisp.meas(latestEntry.thighLeft).toString() : "",
    calfRight: latestEntry?.calfRight ? toDisp.meas(latestEntry.calfRight).toString() : "",
    calfLeft: latestEntry?.calfLeft ? toDisp.meas(latestEntry.calfLeft).toString() : "",
    wrist: latestEntry?.wrist ? toDisp.meas(latestEntry.wrist).toString() : "",
    notes: latestEntry?.notes ?? "",
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  const n = (v: string) => parseFloat(v) || 0;

  // Live preview — always compute in lbs/inches (storage units)
  const weightLbs = toStore.weight(n(form.weight));
  const heightIn  = toStore.meas(n(form.height));
  const waistIn   = toStore.meas(n(form.waist));
  const neckIn    = toStore.meas(n(form.neck));
  const hipsIn    = toStore.meas(n(form.hips));

  const liveBMI = calculateBMI(weightLbs, heightIn);
  const liveBF = calculateBodyFatNavy(gender, heightIn, waistIn, neckIn, hipsIn);
  const bmiCat = getBMICategory(liveBMI);
  const bfCat = getBodyFatCategory(liveBF, gender);

  const handleSave = () => {
    if (!form.weight || !form.height) return;
    saveEntry({
      gender,
      weight: toStore.weight(n(form.weight)),
      height: toStore.meas(n(form.height)),
      age: n(form.age),
      neck: toStore.meas(n(form.neck)),
      chest: toStore.meas(n(form.chest)),
      waist: toStore.meas(n(form.waist)),
      hips: toStore.meas(n(form.hips)),
      bicepRight: toStore.meas(n(form.bicepRight)),
      bicepLeft: toStore.meas(n(form.bicepLeft)),
      thighRight: toStore.meas(n(form.thighRight)),
      thighLeft: toStore.meas(n(form.thighLeft)),
      calfRight: toStore.meas(n(form.calfRight)),
      calfLeft: toStore.meas(n(form.calfLeft)),
      wrist: toStore.meas(n(form.wrist)),
      notes: form.notes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (field: string) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }));

  // Display a history value with correct unit label
  const dispW = (lbs: number) => isImperial ? `${lbs} lbs` : `${Math.round(lbsToKg(lbs) * 10) / 10} kg`;
  const dispM = (inches: number) => isImperial ? `${inches}"` : `${Math.round(inchesToCm(inches) * 10) / 10} cm`;

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Link href="/profile">
          <button className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            ←
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-white">Body Composition</h1>
          <p className="text-xs text-gray-500">TUF Assessment Protocol</p>
        </div>
        {/* Unit toggle */}
        <button
          onClick={toggleSystem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/25 active:scale-95 transition-all"
        >
          <span className="text-xs font-black text-orange-400 tracking-wide">
            {isImperial ? "IMPERIAL" : "METRIC"}
          </span>
          <span className="text-orange-400 text-xs">⇄</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(["form", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500"
            }`}
          >
            {tab === "form" ? "📋 Assessment" : `📊 History (${history.entries.length})`}
          </button>
        ))}
      </div>

      {activeTab === "form" && (
        <div className="px-4 py-5 space-y-6">
          {/* Live Results Preview */}
          {(liveBMI > 0 || liveBF > 0) && (
            <div className="grid grid-cols-2 gap-3">
              {liveBMI > 0 && (
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">BMI</p>
                  <p className="text-3xl font-black text-white">{liveBMI}</p>
                  <span
                    className="text-xs font-bold mt-1 inline-block"
                    style={{ color: bmiCat.color }}
                  >
                    {bmiCat.label}
                  </span>
                  <DeltaBadge delta={getDelta("bmi")} inverse />
                </div>
              )}
              {liveBF > 0 && (
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Body Fat</p>
                  <p className="text-3xl font-black text-white">{liveBF}%</p>
                  <span
                    className="text-xs font-bold mt-1 inline-block"
                    style={{ color: bfCat.color }}
                  >
                    {bfCat.label}
                  </span>
                  <DeltaBadge delta={getDelta("bodyFatPercent")} inverse />
                </div>
              )}
              {liveBMI > 0 && weightLbs > 0 && liveBF > 0 && (
                <>
                  <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Lean Mass</p>
                    <p className="text-2xl font-black text-emerald-400">
                      {isImperial
                        ? `${Math.round(weightLbs * (1 - liveBF / 100))} lbs`
                        : `${Math.round(lbsToKg(weightLbs * (1 - liveBF / 100)) * 10) / 10} kg`}
                    </p>
                    <DeltaBadge delta={getDelta("leanMassLbs")} />
                  </div>
                  <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                    <p className="text-xs text-gray-500 mb-1">Fat Mass</p>
                    <p className="text-2xl font-black text-orange-400">
                      {isImperial
                        ? `${Math.round(weightLbs * (liveBF / 100))} lbs`
                        : `${Math.round(lbsToKg(weightLbs * (liveBF / 100)) * 10) / 10} kg`}
                    </p>
                    <DeltaBadge delta={getDelta("fatMassLbs")} inverse />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Gender */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Gender
            </p>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                    gender === g
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Core Metrics */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Core Metrics
            </p>
            <div className="grid grid-cols-3 gap-3">
              <InputField
                label="Weight"
                value={form.weight}
                onChange={set("weight")}
                unit={weightUnit}
                placeholder={isImperial ? "185" : "84"}
              />
              <InputField
                label="Height"
                value={form.height}
                onChange={set("height")}
                unit={measureUnit}
                placeholder={isImperial ? "68" : "173"}
              />
              <InputField label="Age" value={form.age} onChange={set("age")} unit="yrs" />
            </div>
          </div>

          {/* Circumference Measurements */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Circumference Measurements
            </p>
            <p className="text-xs text-gray-600 mb-3">
              All measurements in {isImperial ? "inches" : "centimeters"}. Used for U.S. Navy body fat calculation.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Neck" value={form.neck} onChange={set("neck")} unit={measureUnit} />
              <InputField label="Chest" value={form.chest} onChange={set("chest")} unit={measureUnit} />
              <InputField label="Waist" value={form.waist} onChange={set("waist")} unit={measureUnit} />
              <InputField label="Hips" value={form.hips} onChange={set("hips")} unit={measureUnit} />
              <InputField label="Bicep (R)" value={form.bicepRight} onChange={set("bicepRight")} unit={measureUnit} />
              <InputField label="Bicep (L)" value={form.bicepLeft} onChange={set("bicepLeft")} unit={measureUnit} />
              <InputField label="Thigh (R)" value={form.thighRight} onChange={set("thighRight")} unit={measureUnit} />
              <InputField label="Thigh (L)" value={form.thighLeft} onChange={set("thighLeft")} unit={measureUnit} />
              <InputField label="Calf (R)" value={form.calfRight} onChange={set("calfRight")} unit={measureUnit} />
              <InputField label="Calf (L)" value={form.calfLeft} onChange={set("calfLeft")} unit={measureUnit} />
              <InputField label="Wrist" value={form.wrist} onChange={set("wrist")} unit={measureUnit} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Notes
            </p>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="How are you feeling? Any notable changes?"
              rows={2}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none resize-none placeholder-gray-600"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!form.weight || !form.height}
            className={`w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : !form.weight || !form.height
                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-400 text-white active:scale-95"
            }`}
          >
            {saved ? "✓ SAVED" : "SAVE ASSESSMENT"}
          </button>

          <p className="text-center text-xs text-gray-600">
            Body fat calculated using U.S. Navy Circumference Method
          </p>
        </div>
      )}

      {activeTab === "history" && (
        <div className="px-4 py-5 space-y-4">
          {!hasData ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📏</p>
              <p className="text-gray-400 font-semibold">No assessments yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Complete your first assessment to start tracking
              </p>
              <button
                onClick={() => setActiveTab("form")}
                className="mt-4 px-6 py-2 bg-orange-500 rounded-full text-white text-sm font-bold"
              >
                Start Assessment
              </button>
            </div>
          ) : (
            <>
              {/* Trend Summary */}
              {history.entries.length >= 2 && (
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                    Progress Since Last Assessment
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Weight", delta: getDelta("weight"), unit: isImperial ? " lbs" : " kg", inverse: true },
                      { label: "Body Fat", delta: getDelta("bodyFatPercent"), unit: "%", inverse: true },
                      { label: "Waist", delta: getDelta("waist"), unit: isImperial ? '"' : " cm", inverse: true },
                    ].map(({ label, delta, unit, inverse }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-500">{label}</p>
                        <p
                          className={`text-lg font-black ${
                            delta === null || delta === 0
                              ? "text-gray-500"
                              : (inverse ? delta < 0 : delta > 0)
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {delta === null || delta === 0
                            ? "—"
                            : `${delta > 0 ? "+" : ""}${delta}${unit}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entry List */}
              {history.entries.map((entry, i) => (
                <div
                  key={entry.date}
                  className={`rounded-2xl p-4 border ${
                    i === 0
                      ? "bg-gray-900 border-orange-500/30"
                      : "bg-gray-900/50 border-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-white">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    {i === 0 && (
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-base font-black text-white">
                        {isImperial ? entry.weight : Math.round(lbsToKg(entry.weight) * 10) / 10}
                      </p>
                      <p className="text-xs text-gray-600">{weightUnit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">BMI</p>
                      <p className="text-base font-black" style={{ color: getBMICategory(entry.bmi).color }}>
                        {entry.bmi}
                      </p>
                      <p className="text-xs text-gray-600">{getBMICategory(entry.bmi).label}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Body Fat</p>
                      <p
                        className="text-base font-black"
                        style={{ color: getBodyFatCategory(entry.bodyFatPercent, entry.gender).color }}
                      >
                        {entry.bodyFatPercent}%
                      </p>
                      <p className="text-xs text-gray-600">
                        {getBodyFatCategory(entry.bodyFatPercent, entry.gender).label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Lean</p>
                      <p className="text-base font-black text-emerald-400">
                        {isImperial ? entry.leanMassLbs : Math.round(lbsToKg(entry.leanMassLbs) * 10) / 10}
                      </p>
                      <p className="text-xs text-gray-600">{weightUnit}</p>
                    </div>
                  </div>
                  {entry.waist > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-4 gap-2 text-center text-xs">
                      {[
                        { label: "Waist", value: entry.waist },
                        { label: "Hips", value: entry.hips },
                        { label: "Chest", value: entry.chest },
                        { label: "Neck", value: entry.neck },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-gray-500">{label}</p>
                          <p className="text-gray-300 font-semibold">
                            {value
                              ? isImperial
                                ? `${value}"`
                                : `${Math.round(inchesToCm(value) * 10) / 10} cm`
                              : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {entry.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic">"{entry.notes}"</p>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
