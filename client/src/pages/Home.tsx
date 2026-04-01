/**
 * TUF Home Page
 * Design System: Dark theme with three pillar tiles (MOVE, FUEL, FEAST)
 * Shows member greeting, score hero, and pillar navigation
 */

import { TUF_DATA } from "@/lib/tuf-data";

export default function Home() {
  const member = TUF_DATA.memberProfile;
  const stats = member.stats;

  return (
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] pb-20">
      {/* Greeting Section */}
      <section className="px-4 pt-6 pb-4">
        <div className="text-xs tracking-widest uppercase text-[#888888] mb-1">
          Welcome back
        </div>
        <h1 className="font-bebas text-4xl tracking-wider text-white">
          Hey <span className="text-[#C8973A]">{member.name}</span>
        </h1>

        {/* Score Hero */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <div className="font-bebas text-sm tracking-wider text-white">
              <span className="text-[#C8973A]">{stats.currentStreak}</span>-DAY STREAK
            </div>
            <div className="text-xs text-[#888888] mt-1">Keep the momentum going</div>
          </div>
          <div className="text-4xl">🔥</div>
        </div>
      </section>

      {/* Pillar Tiles */}
      <section className="px-4 py-4">
        <div className="grid grid-cols-3 gap-2">
          {/* MOVE Tile */}
          <a
            href="/move"
            className="bg-[#141414] border border-[#1e1e1e] p-4 text-center cursor-pointer transition-all hover:border-[#C8973A] hover:bg-[#1c1c1c] relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C8973A] to-[#7a5a1e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="text-2xl mb-2">💪</div>
            <div className="font-bebas text-sm tracking-wider text-white">MOVE</div>
            <div className="text-xs text-[#888888] mt-1">{TUF_DATA.exercises.length} exercises</div>
          </a>

          {/* FUEL Tile */}
          <a
            href="/fuel"
            className="bg-[#141414] border border-[#1e1e1e] p-4 text-center cursor-pointer transition-all hover:border-[#4caf50] hover:bg-[#1c1c1c] relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4caf50] to-[#2e7d32] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="text-2xl mb-2">🥗</div>
            <div className="font-bebas text-sm tracking-wider text-white">FUEL</div>
            <div className="text-xs text-[#888888] mt-1">Nutrition tracking</div>
          </a>

          {/* FEAST Tile */}
          <a
            href="/feast"
            className="bg-[#141414] border border-[#1e1e1e] p-4 text-center cursor-pointer transition-all hover:border-[#f97316] hover:bg-[#1c1c1c] relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f97316] to-[#c2510a] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <div className="text-2xl mb-2">🍽️</div>
            <div className="font-bebas text-sm tracking-wider text-white">FEAST</div>
            <div className="text-xs text-[#888888] mt-1">{TUF_DATA.recipes.length} recipes</div>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-4">
        <div className="font-bebas text-lg tracking-wider text-white border-l-4 border-l-[#8B0000] pl-3 mb-4">
          YOUR <span className="text-[#C8973A]">STATS</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#141414] border border-[#1e1e1e] border-l-4 border-l-[#C8973A] p-4">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Workouts</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.workoutsCompleted}</div>
          </div>

          <div className="bg-[#141414] border border-[#1e1e1e] border-l-4 border-l-[#4caf50] p-4">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Minutes</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.totalMinutes}</div>
          </div>

          <div className="bg-[#141414] border border-[#1e1e1e] border-l-4 border-l-[#f97316] p-4">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Streak</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.currentStreak}</div>
          </div>

          <div className="bg-[#141414] border border-[#1e1e1e] border-l-4 border-l-[#a78bfa] p-4">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">PRs</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.personalRecords}</div>
          </div>
        </div>
      </section>

      {/* CTA Button */}
      <section className="px-4 py-6">
        <button className="tuf-btn primary">START WORKOUT</button>
      </section>
    </div>
  );
}
