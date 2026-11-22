import React from 'react';
import { Languages, QrCode } from 'lucide-react';
import { formatRiyal, Language, MENU_LOCALIZED, UI_TEXT } from '../game/i18n';
import { ARBISH_MENU, GameHudSnapshot } from '../game/types';

interface ShiftModalProps {
  hud: GameHudSnapshot;
  lang: Language;
  showGuideOnly: boolean;
  onToggleLang: () => void;
  onShowQr: () => void;
  onCloseGuide: () => void;
  onStartShift: (shiftNum: number, tutorial?: boolean) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  hud,
  lang,
  showGuideOnly,
  onToggleLang,
  onShowQr,
  onCloseGuide,
  onStartShift,
}) => {
  const isTitle = hud.phase === 'title';
  const isShiftEnd = hud.phase === 'shift-end';
  const isGameComplete = hud.phase === 'game-complete';

  if (!isTitle && !isShiftEnd && !isGameComplete && !showGuideOnly) return null;

  const t = UI_TEXT[lang];
  const menuCopy = MENU_LOCALIZED[lang];
  const isRtl = lang === 'ar';

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/65 p-4">
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="w-full max-w-2xl rounded-2xl border border-white/12 bg-zinc-950/96 p-6 sm:p-7 shadow-2xl"
      >
        {/* 100x Cooler Matte-Black Storefront Neon Plaque Header */}
        <div
          dir="ltr"
          className="relative overflow-hidden rounded-xl border border-white/12 bg-[#0B0C10] px-5 py-4 shadow-[0_0_32px_rgba(239,68,68,0.22)]"
        >
          <div className="pointer-events-none absolute -top-10 left-10 h-28 w-44 rounded-full bg-red-600/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-40 rounded-full bg-blue-600/20 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-script text-5xl sm:text-6xl leading-none text-[#ff2626] drop-shadow-[0_0_16px_rgba(239,68,68,0.95)]">
                  Arbish
                </span>
                <span className="font-script text-3xl sm:text-4xl leading-none text-white -rotate-6 drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]">
                  Bites
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="text-[10px] sm:text-[11px] font-display font-bold tracking-[0.32em] text-zinc-200 uppercase">
                  BURGERS AND MORE
                </span>
                <span className="h-0.5 w-16 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onShowQr}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-600/15 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-600/30 transition-colors"
                >
                  <QrCode className="h-3.5 w-3.5 text-red-400" />
                  <span>QR</span>
                </button>
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900/95 px-3 py-1 text-xs font-semibold text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <Languages className="h-3.5 w-3.5 text-sky-400" />
                  <span>{t.langLabel}</span>
                </button>
              </div>
              <span className="font-mono-tabular text-[11px] text-zinc-400">
                {t.makkahHours}
              </span>
            </div>
          </div>
        </div>

        {isGameComplete ? (
          <div className="mt-5">
            <div className="inline-block rounded-md border border-amber-400/35 bg-amber-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {t.finaleBadge}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              {t.finaleTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-300">{t.finaleDesc}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.totalEarnings}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-emerald-400">
                  {formatRiyal(hud.money, lang)}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.totalTips}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-amber-400">
                  {formatRiyal(hud.tips, lang)}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.ordersServed}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-white">
                  {hud.ordersServed}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.bestStreak}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-orange-400">
                  {hud.bestStreak}x
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.finalRating}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-amber-300">
                  {hud.rating.toFixed(1)}★
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.onlineDispatched}</div>
                <div className="mt-1 font-mono-tabular text-xl font-bold text-emerald-300">
                  {hud.onlineDispatched}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onStartShift(1, false)}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                {t.playAgain}
              </button>
            </div>
          </div>
        ) : isShiftEnd ? (
          <div className="mt-5">
            <h2 className="font-display text-2xl font-bold text-white">
              {t.shiftComplete(hud.shiftNumber)}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              {t.shiftCompleteDesc(hud.shiftNumber)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.earnings}</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-emerald-400">
                  {formatRiyal(hud.money, lang)}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.tips}</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-amber-400">
                  {formatRiyal(hud.tips, lang)}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.served}</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-white">
                  {hud.ordersServed}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.bestStreak}</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-orange-400">
                  {hud.bestStreak}x
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-3">
                <div className="text-xs text-zinc-400">{t.rating}</div>
                <div className="mt-1 font-mono-tabular text-lg font-bold text-amber-300">
                  {hud.rating.toFixed(1)}★
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onStartShift(1, false)}
                className="rounded-lg border border-white/12 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                {t.restartShift1}
              </button>
              <button
                type="button"
                onClick={() => onStartShift(hud.shiftNumber + 1, false)}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                {t.startNextShift(hud.shiftNumber + 1)}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <h1 className="font-display text-2xl font-bold text-white text-balance">
              {showGuideOnly ? t.guideTitle : t.titleHeading}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{t.titleDesc}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-zinc-900/90 p-3.5">
                <div className="text-xs font-semibold text-zinc-200">{t.controls}</div>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-400">
                  <li>
                    <span className="font-mono-tabular text-zinc-200">WASD</span> — {t.ctrlWalk}
                  </li>
                  <li>
                    <span className="font-mono-tabular text-zinc-200">Drag / Arrows / L</span> —{' '}
                    {t.ctrlLook}
                  </li>
                  <li>
                    <span className="font-mono-tabular text-zinc-200">C / Wheel</span> — {t.ctrlFly}
                  </li>
                  <li>
                    <span className="font-mono-tabular text-zinc-200">Click / E · 1–8</span> —{' '}
                    {t.ctrlInteract}
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-white/10 bg-zinc-900/90 p-3.5">
                <div className="text-xs font-semibold text-zinc-200">
                  {t.menuTitle} ({Object.keys(ARBISH_MENU).length})
                </div>
                <ul className="mt-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-1 text-xs text-zinc-400">
                  {Object.values(ARBISH_MENU).map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                      <span className="text-zinc-200 truncate">
                        {menuCopy[item.id].shortName}
                      </span>
                      <span className="font-mono-tabular text-amber-400 shrink-0">
                        {formatRiyal(item.price, lang, 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              {showGuideOnly ? (
                <button
                  type="button"
                  onClick={onCloseGuide}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                >
                  {t.backToKitchen}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onStartShift(1, true)}
                    className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors"
                  >
                    {t.startTutorial}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartShift(1, false)}
                    className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
                  >
                    {t.clockInStart}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
