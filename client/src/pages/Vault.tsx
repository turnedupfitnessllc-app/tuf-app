/**
 * TUF VAULT Page — Progress & History
 * Design System: Stats, achievements, personal records
 */

import { TUF_DATA } from "@/lib/tuf-data";

export default function Vault() {
  const member = TUF_DATA.memberProfile;
  const stats = member.stats;

  return (
    <div className="min-h-screen bg-[#080808] text-[#f2f2f2] pb-20">
      {/* Header */}
      <section className="px-4 pt-6 pb-4 border-b border-[#1e1e1e]">
        <div className="text-xs tracking-widest uppercase text-[#888888] mb-1">Progress</div>
        <h1 className="font-bebas text-3xl tracking-wider text-white">
          <span className="text-[#a78bfa]">VAULT</span>
        </h1>
      </section>

      {/* Member Info */}
      <section className="px-4 py-6">
        <div className="tuf-card gold-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#8B0000] border-2 border-[#C8973A] flex items-center justify-center font-bebas text-2xl text-[#C8973A]">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bebas text-2xl tracking-wider text-white">{member.name}</h2>
              <div className="text-xs text-[#888888]">{member.age} years old • {member.level}</div>
              <div className="text-xs text-[#C8973A] mt-1">Member since {new Date(member.joinDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="px-4 py-4">
        <div className="font-bebas text-lg tracking-wider text-white border-l-4 border-l-[#a78bfa] pl-3 mb-4">
          YOUR <span className="text-[#a78bfa]">ACHIEVEMENTS</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="tuf-card ok-border">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Total Workouts</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.workoutsCompleted}</div>
            <div className="text-xs text-[#4caf50] mt-2">💪 Keep crushing it</div>
          </div>

          <div className="tuf-card gold-border">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Total Minutes</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.totalMinutes}</div>
            <div className="text-xs text-[#C8973A] mt-2">⏱️ {Math.round(stats.totalMinutes / 60)}h invested</div>
          </div>

          <div className="tuf-card red-border">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Current Streak</div>
            <div className="font-bebas text-3xl tracking-wider text-white">{stats.currentStreak}</div>
            <div className="text-xs text-[#b30000] mt-2">🔥 {stats.currentStreak} days strong</div>
          </div>

          <div className="tuf-card">
            <div className="text-xs tracking-widest uppercase text-[#888888] mb-2">Personal Records</div>
            <div className="font-bebas text-3xl tracking-wider text-[#a78bfa]">{stats.personalRecords}</div>
            <div className="text-xs text-[#a78bfa] mt-2">🏆 New milestones</div>
          </div>
        </div>
      </section>

      {/* Progress Timeline */}
      <section className="px-4 py-4">
        <div className="font-bebas text-lg tracking-wider text-white border-l-4 border-l-[#C8973A] pl-3 mb-4">
          RECENT <span className="text-[#C8973A]">MILESTONES</span>
        </div>

        <div className="space-y-3">
          {[
            { date: "Today", title: "Workout Completed", desc: "45 min • Chest & Back", icon: "✅" },
            { date: "Yesterday", title: "7-Day Streak", desc: "Consistency unlocked", icon: "🔥" },
            { date: "2 days ago", title: "Personal Record", desc: "DB Bench Press: 50 lbs", icon: "🏆" },
          ].map((milestone, idx) => (
            <div key={idx} className="tuf-card flex gap-3">
              <div className="text-2xl">{milestone.icon}</div>
              <div className="flex-1">
                <div className="font-bebas text-sm tracking-wider text-white">{milestone.title}</div>
                <div className="text-xs text-[#888888]">{milestone.desc}</div>
                <div className="text-xs text-[#555555] mt-1">{milestone.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-6">
        <button className="tuf-btn primary">VIEW FULL HISTORY</button>
      </section>
    </div>
  );
}
