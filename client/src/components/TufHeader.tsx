/**
 * TUF Header Component
 * Design System: Dark theme with gold accents, sticky positioning
 * Bebas Neue for brand, Barlow Condensed for secondary text
 */

export function TufHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0e0e0e] border-b border-[#1e1e1e] shadow-sm" style={{ boxShadow: '0 1px 0 rgba(200,151,58,0.12)' }}>
      <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="font-bebas text-2xl tracking-widest text-white">
          TUF <span className="text-[#C8973A]">MOVE</span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Status pill */}
          <div className="text-xs tracking-widest uppercase text-[#b30000] bg-[rgba(139,0,0,0.15)] border border-[rgba(139,0,0,0.35)] px-2 py-0.5">
            ACTIVE
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#8B0000] border border-[#7a5a1e] flex items-center justify-center font-bebas text-sm text-[#C8973A] cursor-pointer">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
