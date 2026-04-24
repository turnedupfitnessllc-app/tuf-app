/**
 * FoodLibrarySearch — TUF 1,802-item food database search component
 *
 * Searches the full food library (from TUF meal planner Excel) by name.
 * Shows macros per serving with dual-unit display (oz/g or g only).
 * Used in FuelTracker log-meal modal and Feast DATABASE tab.
 *
 * Props:
 *   onSelect(item, servingG) — called when user picks a food and confirms serving size
 *   compact — smaller card layout for use inside modals
 *   placeholder — custom search placeholder text
 */

import { useState, useMemo, useCallback } from "react";
import { useUnitPreference } from "@/hooks/useUnitPreference";
import foodLibrary from "../../../shared/foodLibrary.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodMacros {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface FoodItem {
  food_group: string;
  name: string;
  serve_g: number;
  serve_oz: number;
  common_measure: string;
  per_100g: FoodMacros;
  per_serving: FoodMacros;
  custom?: boolean;
}

interface SelectedFood {
  item: FoodItem;
  servingG: number;
  macros: FoodMacros;
}

interface FoodLibrarySearchProps {
  onSelect: (food: SelectedFood) => void;
  compact?: boolean;
  placeholder?: string;
  showGroupFilter?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const library = foodLibrary as FoodItem[];

const FOOD_GROUPS = Array.from(new Set(library.map((f) => f.food_group))).sort();

const GROUP_ICONS: Record<string, string> = {
  "Poultry Products": "🍗",
  "Beef Products": "🥩",
  "Pork Products": "🥓",
  "Finfish and Shellfish Products": "🐟",
  "Lamb, Veal, and Game Products": "🫀",
  "Vegetables and Vegetable Products": "🥦",
  "Fruits and Fruit Juices": "🍎",
  "Cereal Grains and Pasta": "🌾",
  "Dairy and Egg Products": "🥛",
  "Legumes and Legume Products": "🫘",
  "Nut and Seed Products": "🥜",
  "Fats and Oils": "🫒",
  "Spices and Herbs": "🌿",
  "Baked Products": "🍞",
  "Sweets": "🍬",
  "Beverages": "🥤",
};

function calcMacros(item: FoodItem, servingG: number): FoodMacros {
  const r = servingG / 100;
  return {
    calories: Math.round(item.per_100g.calories * r * 10) / 10,
    protein_g: Math.round(item.per_100g.protein_g * r * 100) / 100,
    carbs_g: Math.round(item.per_100g.carbs_g * r * 100) / 100,
    fat_g: Math.round(item.per_100g.fat_g * r * 100) / 100,
  };
}

// ─── Serving Size Picker ──────────────────────────────────────────────────────

function ServingPicker({
  item,
  onConfirm,
  onCancel,
}: {
  item: FoodItem;
  onConfirm: (servingG: number) => void;
  onCancel: () => void;
}) {
  const { isImperial, gToOz } = useUnitPreference();
  const [servingG, setServingG] = useState(item.serve_g);
  const macros = useMemo(() => calcMacros(item, servingG), [item, servingG]);

  const presets = useMemo(() => {
    const base = item.serve_g;
    return [
      { label: "½ serving", g: Math.round(base * 0.5) },
      { label: item.common_measure, g: base },
      { label: "1.5×", g: Math.round(base * 1.5) },
      { label: "2×", g: Math.round(base * 2) },
    ];
  }, [item]);

  return (
    <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-4 mt-2">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-white font-black text-sm leading-tight">{item.name}</p>
          <p className="text-gray-500 text-xs mt-0.5">{item.food_group}</p>
        </div>
        <button onClick={onCancel} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
      </div>

      {/* Macro preview */}
      <div className="grid grid-cols-4 gap-2 text-center mb-4">
        <div className="bg-gray-800 rounded-xl py-2">
          <p className="text-orange-400 font-black text-base">{Math.round(macros.calories)}</p>
          <p className="text-gray-500 text-[9px] font-bold">KCAL</p>
        </div>
        <div className="bg-gray-800 rounded-xl py-2">
          <p className="text-blue-400 font-black text-base">{macros.protein_g}g</p>
          <p className="text-gray-500 text-[9px] font-bold">PROTEIN</p>
        </div>
        <div className="bg-gray-800 rounded-xl py-2">
          <p className="text-yellow-400 font-black text-base">{macros.carbs_g}g</p>
          <p className="text-gray-500 text-[9px] font-bold">CARBS</p>
        </div>
        <div className="bg-gray-800 rounded-xl py-2">
          <p className="text-gray-300 font-black text-base">{macros.fat_g}g</p>
          <p className="text-gray-500 text-[9px] font-bold">FAT</p>
        </div>
      </div>

      {/* Serving size input */}
      <div className="mb-3">
        <label className="text-gray-400 text-[10px] font-black tracking-wider block mb-1.5">
          SERVING SIZE
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={servingG}
            onChange={(e) => setServingG(Math.max(1, Number(e.target.value)))}
            className="w-20 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm text-center outline-none focus:border-orange-500/50"
          />
          <span className="text-gray-400 text-sm">g</span>
          {isImperial && (
            <span className="text-gray-500 text-xs">
              ({Math.round(gToOz(servingG) * 10) / 10} oz)
            </span>
          )}
        </div>
        {/* Preset buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setServingG(p.g)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                servingG === p.g
                  ? "bg-orange-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onConfirm(servingG)}
        className="w-full py-3 bg-orange-500 hover:bg-orange-400 active:scale-95 rounded-xl text-white font-black text-sm tracking-wide transition-all"
      >
        ADD TO MEAL
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FoodLibrarySearch({
  onSelect,
  compact = false,
  placeholder = "Search 1,802 foods — chicken, broccoli, garlic powder...",
  showGroupFilter = true,
}: FoodLibrarySearchProps) {
  const { isImperial, gToOz } = useUnitPreference();
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [pickerItem, setPickerItem] = useState<FoodItem | null>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q && selectedGroup === "all") return library.slice(0, 8);

    return library
      .filter((item) => {
        const nameMatch = !q || item.name.toLowerCase().includes(q);
        const groupMatch = selectedGroup === "all" || item.food_group === selectedGroup;
        return nameMatch && groupMatch;
      })
      .sort((a, b) => {
        if (!q) return 0;
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aScore = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
        const bScore = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;
        return aScore - bScore;
      })
      .slice(0, 12);
  }, [query, selectedGroup]);

  const handleConfirm = useCallback(
    (servingG: number) => {
      if (!pickerItem) return;
      onSelect({
        item: pickerItem,
        servingG,
        macros: calcMacros(pickerItem, servingG),
      });
      setPickerItem(null);
      setQuery("");
    },
    [pickerItem, onSelect]
  );

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Group filter */}
      {showGroupFilter && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGroup("all")}
            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
              selectedGroup === "all"
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-gray-400 border border-white/10"
            }`}
          >
            ALL
          </button>
          {FOOD_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedGroup === g
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-gray-400 border border-white/10"
              }`}
            >
              {GROUP_ICONS[g] || "🍽️"} {g.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* Serving picker (shown when item selected) */}
      {pickerItem && (
        <ServingPicker
          item={pickerItem}
          onConfirm={handleConfirm}
          onCancel={() => setPickerItem(null)}
        />
      )}

      {/* Results */}
      {!pickerItem && (
        <div className={`space-y-1 ${compact ? "max-h-48" : "max-h-64"} overflow-y-auto`}>
          {results.map((item, i) => (
            <button
              key={`${item.name}-${i}`}
              onClick={() => setPickerItem(item)}
              className="w-full text-left bg-white/4 hover:bg-orange-500/10 border border-white/6 hover:border-orange-500/30 rounded-xl px-3 py-2.5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{item.name}</p>
                  <p className="text-gray-500 text-[9px] mt-0.5">
                    {GROUP_ICONS[item.food_group] || "🍽️"} {item.food_group} ·{" "}
                    {isImperial
                      ? `${item.serve_oz} oz (${item.serve_g}g)`
                      : `${item.serve_g}g`}{" "}
                    per {item.common_measure}
                  </p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="text-orange-400 text-[10px] font-black">
                    {Math.round(item.per_serving.calories)} kcal
                  </p>
                  <p className="text-blue-400 text-[9px]">{item.per_serving.protein_g}g P</p>
                </div>
              </div>
            </button>
          ))}

          {results.length === 0 && (
            <div className="text-gray-500 text-xs text-center py-4">
              No foods found. Try a different search term.
            </div>
          )}

          {!query && selectedGroup === "all" && (
            <p className="text-gray-600 text-[9px] text-center pt-1">
              Showing 8 of 1,802 foods. Type to search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
