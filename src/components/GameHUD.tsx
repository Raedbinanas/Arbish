import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Trash2,
  Volume2,
  VolumeX,
  HelpCircle,
  Camera,
  Smartphone,
  Plus,
  BookOpen,
  Flame,
  Check,
  X,
  GraduationCap,
  Sun,
  Sunset,
  Moon,
  Languages,
  QrCode,
} from 'lucide-react';
import {
  formatRiyal,
  HELD_LABELS_AR,
  Language,
  MENU_LOCALIZED,
  STATION_LABELS,
  TUTORIAL_STEPS_I18N,
  UI_TEXT,
} from '../game/i18n';
import {
  ARBISH_MENU,
  GameHudSnapshot,
  HandItemType,
  IngredientId,
  MenuItemId,
  StationId,
} from '../game/types';

function heldItemToMenuId(held: HandItemType | null): MenuItemId | null {
  if (!held) return null;
  if (held.startsWith('tray-')) return held.replace('tray-', '') as MenuItemId;
  if (held === 'fries-cup') return 'loaded-fries';
  if (held === 'chicken-box') return 'chicken-bites';
  if (held === 'sides-box') return 'onion-rings';
  return null;
}

function getTimePhaseIcon(clockLabel: string) {
  const isAm = clockLabel.includes('AM');
  const hour = Number(clockLabel.split(':')[0]);
  if (!isAm && hour >= 12 && hour <= 4) {
    return <Sun className="h-3.5 w-3.5 text-amber-300" />;
  }
  if (!isAm && (hour === 5 || hour === 6)) {
    return <Sunset className="h-3.5 w-3.5 text-orange-400" />;
  }
  return <Moon className="h-3.5 w-3.5 text-sky-300" />;
}

interface GameHUDProps {
  hud: GameHudSnapshot;
  lang: Language;
  muted: boolean;
  onToggleLang: () => void;
  onToggleMute: () => void;
  onJumpStation: (station: StationId) => void;
  onTogglePointerLock: () => void;
  onToggleFreeCam: () => void;
  onDiscardHeld: () => void;
  onAddIngredient: (ing: IngredientId) => void;
  onPlateOrder: () => void;
  onClearAssembly: () => void;
  onTriggerOnlineOrder: () => void;
  onToggleOnlineOrders: () => void;
  onDispatchOnlineOrder: (ticketId: number) => void;
  onAcceptCustomer: (ticketId: number) => void;
  onDeclineCustomer: (ticketId: number) => void;
  onAcceptOnlineOrder: (ticketId: number) => void;
  onDeclineOnlineOrder: (ticketId: number) => void;
  onSkipTutorial: () => void;
  onShowGuide: () => void;
  onShowQr: () => void;
}

const STATION_IDS: Array<{ id: StationId; keyHint: string }> = [
  { id: 'counter', keyHint: '1' },
  { id: 'grill', keyHint: '2' },
  { id: 'fryer', keyHint: '3' },
  { id: 'prep', keyHint: '4' },
  { id: 'drinks', keyHint: '5' },
  { id: 'storefront', keyHint: '6' },
  { id: 'loft', keyHint: '7' },
  { id: 'storage', keyHint: '8' },
];

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  lang,
  muted,
  onToggleLang,
  onToggleMute,
  onJumpStation,
  onTogglePointerLock,
  onToggleFreeCam,
  onDiscardHeld,
  onAddIngredient,
  onPlateOrder,
  onClearAssembly,
  onTriggerOnlineOrder,
  onToggleOnlineOrders,
  onDispatchOnlineOrder,
  onAcceptCustomer,
  onDeclineCustomer,
  onAcceptOnlineOrder,
  onDeclineOnlineOrder,
  onSkipTutorial,
  onShowGuide,
  onShowQr,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [recipeOpen, setRecipeOpen] = useState(true);
  const heldMenuId = heldItemToMenuId(hud.heldItem);
  const t = UI_TEXT[lang];
  const menuCopy = MENU_LOCALIZED[lang];
  const stationCopy = STATION_LABELS[lang];
  const isRtl = lang === 'ar';

  const orderedCounts = hud.tickets.reduce<Partial<Record<MenuItemId, number>>>((acc, tk) => {
    acc[tk.itemId] = (acc[tk.itemId] ?? 0) + 1;
    return acc;
  }, {});

  const blurAfter = (fn: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    fn();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH' && hud.phase === 'playing') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hud.phase]);

  if (hud.phase !== 'playing') return null;

  const showPrepBar = hud.activeStation === 'prep' || hud.assembly.layers.length > 0;
  const tutStepData = hud.tutorialMode ? TUTORIAL_STEPS_I18N[lang][hud.tutorialStep] : null;
  const heldDisplayLabel = hud.heldItem
    ? lang === 'ar'
      ? HELD_LABELS_AR[hud.heldItem]
      : hud.heldLabel
    : t.handsEmpty;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4">
      {/* TOP BAR: Compact Status Strip (Left) + Tutorial Coach (Center) + Active Order Slips (Right) */}
      <div className="flex items-start justify-between gap-4">
        {/* Top-Left Clean Unboxed Metadata Strip with Neon Brand & Language Switch */}
        <div className="pointer-events-auto rounded-lg border border-white/12 bg-zinc-950/92 px-3.5 py-2 shadow-lg">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-zinc-200">
            <span className="inline-flex items-baseline gap-1 rounded-md border border-red-500/30 bg-[#0B0C10] px-2 py-0.5 shadow-[0_0_12px_rgba(239,68,68,0.28)]">
              <span className="font-script text-xl leading-none text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]">
                Arbish
              </span>
              <span className="font-script text-sm leading-none text-white -rotate-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.65)]">
                Bites
              </span>
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="font-mono-tabular font-semibold text-emerald-400">
              {formatRiyal(hud.money, lang)}
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="font-mono-tabular text-zinc-300">
              {hud.ordersServed} {t.served}
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="inline-flex items-center gap-1 font-mono-tabular font-semibold text-orange-400">
              <Flame className="h-3.5 w-3.5" />
              <span>
                {hud.streak} {t.streak}
              </span>
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="font-mono-tabular text-amber-400">
              {hud.rating.toFixed(1)}★
            </span>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono-tabular text-zinc-300">
              {getTimePhaseIcon(hud.shiftClockLabel)}
              <span>
                {t.shift} {hud.shiftNumber}/100 · {hud.shiftClockLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={blurAfter(onToggleLang)}
              className="ml-1 inline-flex items-center gap-1 rounded-md border border-white/15 bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Languages className="h-3 w-3 text-sky-400" />
              <span>{t.langLabel}</span>
            </button>
          </div>
        </div>

        {/* Top-Center Tutorial Coach Banner */}
        {hud.tutorialMode && tutStepData && (
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className="pointer-events-auto max-w-md rounded-xl border border-amber-400/40 bg-zinc-950/94 px-4 py-2.5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="font-mono-tabular text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {t.tutorialStep} {hud.tutorialStep + 1}/6
                </span>
              </div>
              <button
                type="button"
                onClick={blurAfter(onSkipTutorial)}
                className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                {t.skipTutorial}
              </button>
            </div>
            <div className="mt-1 font-display text-sm font-bold text-white">
              {tutStepData.title}
            </div>
            <div className="mt-0.5 text-xs leading-snug text-zinc-300">
              {tutStepData.hint}
            </div>
          </div>
        )}

        {/* Top-Right Compact Online Delivery Controls & Order Tickets */}
        <div className="flex flex-col items-end gap-2 max-w-xs">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-950/92 px-2.5 py-1.5 shadow-lg">
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-zinc-200">
              {t.online} ({hud.onlineDispatched})
            </span>
            <button
              type="button"
              onClick={blurAfter(onToggleOnlineOrders)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                hud.onlineOrdersEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {hud.onlineOrdersEnabled ? t.autoOn : t.paused}
            </button>
            <button
              type="button"
              onClick={blurAfter(onTriggerOnlineOrder)}
              title="Receive an Online Order right now"
              className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>{t.orderBtn}</span>
            </button>
          </div>

          {hud.tickets.length === 0 ? (
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className="rounded-lg border border-white/10 bg-zinc-950/88 px-3.5 py-2 text-xs text-zinc-400"
            >
              {t.waitingOrders}
            </div>
          ) : (
            hud.tickets.slice(0, 4).map((ticket) => {
              const menu = ARBISH_MENU[ticket.itemId];
              const localMenu = menuCopy[ticket.itemId];
              const pct = Math.max(0, Math.min(100, (ticket.patience / ticket.maxPatience) * 100));
              const urgent = pct < 30;
              const isOnline = ticket.source === 'online';
              const canDispatch = isOnline && ticket.taken && heldMenuId === ticket.itemId;
              return (
                <div
                  key={ticket.id}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`pointer-events-auto w-72 rounded-lg border px-3.5 py-2.5 shadow-lg ${
                    isOnline
                      ? !ticket.taken
                        ? 'border-amber-400/50 bg-zinc-950/95'
                        : 'border-emerald-500/40 bg-zinc-950/94'
                      : !ticket.taken
                        ? 'border-sky-400/45 bg-zinc-950/94'
                        : 'border-white/12 bg-zinc-950/92'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-mono-tabular font-bold text-zinc-100 truncate">
                      #{ticket.id} · {ticket.customerName}
                    </span>
                    <span
                      className={`font-medium shrink-0 ${
                        isOnline
                          ? !ticket.taken
                            ? 'text-amber-400'
                            : urgent
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          : !ticket.taken
                            ? 'text-sky-400'
                            : urgent
                              ? 'text-red-400'
                              : 'text-amber-400'
                      }`}
                    >
                      {isOnline
                        ? !ticket.taken
                          ? `${ticket.platform ?? t.online} ${t.offer}`
                          : ticket.platform ?? t.online
                        : !ticket.taken
                          ? t.atRegister
                          : urgent
                            ? t.urgent
                            : t.dineIn}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-white">
                      {localMenu.name}
                    </span>
                    {isOnline && ticket.payout !== undefined ? (
                      <span className="font-mono-tabular text-xs font-semibold text-emerald-400 shrink-0">
                        +{formatRiyal(ticket.payout, lang)}
                      </span>
                    ) : (
                      <span className="font-mono-tabular text-[11px] text-zinc-400 shrink-0">
                        {formatRiyal(menu.price, lang, 0)}
                      </span>
                    )}
                  </div>
                  {isOnline && (ticket.neighborhood || ticket.driverName) && (
                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-emerald-300/90">
                      <span>{ticket.neighborhood}</span>
                      {ticket.driverName && (
                        <span>
                          {t.rider}: {ticket.driverName}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-0.5 text-[11px] text-zinc-400 truncate">
                    {localMenu.steps.join(' · ')}
                  </div>

                  {/* Patience Bar + Accept/Decline or Dispatch */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full transition-all duration-150 ${
                          urgent
                            ? 'bg-red-500'
                            : isOnline
                              ? ticket.taken
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                              : ticket.taken
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {!ticket.taken ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={blurAfter(() =>
                            isOnline ? onAcceptOnlineOrder(ticket.id) : onAcceptCustomer(ticket.id)
                          )}
                          className="inline-flex items-center gap-0.5 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-500 transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>{t.accept}</span>
                        </button>
                        <button
                          type="button"
                          onClick={blurAfter(() =>
                            isOnline ? onDeclineOnlineOrder(ticket.id) : onDeclineCustomer(ticket.id)
                          )}
                          className="inline-flex items-center gap-0.5 rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                          <span>{t.decline}</span>
                        </button>
                      </div>
                    ) : canDispatch ? (
                      <button
                        type="button"
                        onClick={blurAfter(() => onDispatchOnlineOrder(ticket.id))}
                        className="rounded bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold text-white hover:bg-emerald-500 transition-colors shrink-0"
                      >
                        {t.dispatch}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CENTER CROSSHAIR + CONTEXTUAL INTERACTION PROMPT */}
      <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center">
        {(hud.isPointerLocked || hud.freeMouseLook) && (
          <div className="h-2 w-2 rounded-full border border-white bg-white/80 shadow" />
        )}

        {hud.hoverPrompt && (
          <div className="mt-24 rounded-lg border border-white/12 bg-zinc-950/92 px-3.5 py-2 text-center shadow-xl">
            <div className="text-xs font-semibold text-white">{hud.hoverPrompt}</div>
            {hud.hoverSubPrompt && (
              <div className="text-[11px] text-zinc-400">{hud.hoverSubPrompt}</div>
            )}
          </div>
        )}

        {hud.toastMessage && (
          <div className="mt-3 rounded-md border border-amber-400/30 bg-zinc-950/94 px-3.5 py-1.5 text-xs font-medium text-amber-200 shadow-lg">
            {hud.toastMessage}
          </div>
        )}
      </div>

      {/* BOTTOM-LEFT ARBISH BITES RECIPE GUIDE */}
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="pointer-events-auto fixed bottom-20 left-4 z-10 w-64 rounded-xl border border-white/12 bg-zinc-950/92 shadow-2xl xl:bottom-4"
      >
        <button
          type="button"
          onClick={blurAfter(() => setRecipeOpen((prev) => !prev))}
          className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-white/5 rounded-xl"
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-red-500" />
            <span className="font-display text-xs font-bold tracking-wide text-white">
              {t.arbishRecipes} ({Object.keys(ARBISH_MENU).length})
            </span>
          </div>
          {recipeOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </button>

        {recipeOpen && (
          <div className="border-t border-white/10 px-2.5 py-2 space-y-1.5 max-h-[42vh] overflow-y-auto">
            {Object.values(ARBISH_MENU).map((item) => {
              const localItem = menuCopy[item.id];
              const activeCount = orderedCounts[item.id] ?? 0;
              const readyOnBoard = hud.assembly.matchedItem === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-lg border px-2 py-1.5 transition-colors ${
                    readyOnBoard
                      ? 'border-emerald-500/50 bg-emerald-950/35'
                      : activeCount > 0
                        ? 'border-amber-500/40 bg-zinc-900/95'
                        : 'border-white/6 bg-zinc-900/65'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-display text-[11px] font-semibold text-zinc-100 truncate">
                      {localItem.name}
                    </span>
                    {readyOnBoard ? (
                      <span className="font-mono-tabular text-[10px] font-semibold text-emerald-400 shrink-0">
                        {t.ready}
                      </span>
                    ) : activeCount > 0 ? (
                      <span className="font-mono-tabular text-[10px] font-semibold text-amber-400 shrink-0">
                        {t.need} ×{activeCount}
                      </span>
                    ) : (
                      <span className="font-mono-tabular text-[10px] text-zinc-500 shrink-0">
                        {formatRiyal(item.price, lang, 0)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-snug text-zinc-400">
                    {localItem.steps.join(' → ')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOTTOM COLLAPSIBLE CONTROL DOCK */}
      <div className="pointer-events-none flex flex-col items-center gap-2">
        {/* Prep Station Quick-Build Sub-bar (only visible at Prep or when assembling) */}
        {!dockCollapsed && showPrepBar && (
          <div className="pointer-events-auto flex flex-col items-center gap-1.5 rounded-lg border border-white/12 bg-zinc-950/92 px-3 py-2 shadow-xl">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="mr-1 text-xs font-medium text-zinc-400">
                {t.board} ({hud.assembly.layers.length}):
              </span>
              <button
                type="button"
                onClick={() => onAddIngredient('bottom-bun')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-100 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.bottomBun}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('cheese')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-amber-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.cheese}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('lettuce')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-emerald-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.lettuce}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('tomato')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-red-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.tomato}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('jalapeno')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-lime-300 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.jalapeno}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('mozzarella')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-yellow-100 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.mozzarella}
              </button>
              <button
                type="button"
                onClick={() => onAddIngredient('top-bun')}
                className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-100 hover:bg-zinc-700 transition-colors whitespace-nowrap"
              >
                {t.topBun}
              </button>
              <span aria-hidden="true" className="mx-0.5 text-zinc-700">
                |
              </span>
              <button
                type="button"
                onClick={onPlateOrder}
                className={`rounded px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                  hud.assembly.matchedItem
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {hud.assembly.matchedItem
                  ? `${t.platePrefix} ${menuCopy[hud.assembly.matchedItem].shortName}`
                  : t.plateTray}
              </button>
              <button
                type="button"
                onClick={onClearAssembly}
                className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors whitespace-nowrap"
              >
                {t.clear}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-white/8 pt-1.5">
              <span className="text-[11px] font-medium text-zinc-400">{t.saucesLabel}</span>
              {(
                [
                  { id: 'classic-sauce', label: t.classicSauce, cls: 'text-orange-300' },
                  { id: 'cheese-sauce', label: t.cheeseSauce, cls: 'text-amber-300' },
                  { id: 'spicy-sauce', label: t.spicySauce, cls: 'text-red-300' },
                  { id: 'maple-sauce', label: t.mapleSauce, cls: 'text-yellow-300' },
                  { id: 'cherry-sauce', label: t.cherrySauce, cls: 'text-rose-300' },
                ] as const
              ).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onAddIngredient(sc.id)}
                  className={`rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[11px] font-medium ${sc.cls} hover:bg-zinc-800 transition-colors whitespace-nowrap`}
                >
                  + {sc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={() => setDockCollapsed((c) => !c)}
          className="pointer-events-auto flex items-center gap-1.5 rounded-t-lg border border-b-0 border-white/12 bg-zinc-950/92 px-3 py-1 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>{t.showControls}</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>{t.hideControls}</span>
            </>
          )}
        </button>

        {/* Main Bottom Control Dock */}
        {!dockCollapsed && (
          <div className="pointer-events-auto flex max-w-[94vw] flex-wrap items-center justify-center gap-2 rounded-xl border border-white/12 bg-zinc-950/94 px-3.5 py-2.5 shadow-2xl">
            {/* Station Quick-Jump Buttons */}
            <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1">
              {STATION_IDS.map((st) => {
                const active = hud.activeStation === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={blurAfter(() => onJumpStation(st.id))}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {st.keyHint}. {stationCopy[st.id]}
                  </button>
                );
              })}
            </div>

            <span aria-hidden="true" className="hidden sm:inline text-zinc-700">
              |
            </span>

            {/* Held Item Status & Discard */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs text-zinc-400">{t.holding}</span>
              <span className="text-xs font-semibold text-white whitespace-nowrap">
                {heldDisplayLabel}
              </span>
              {hud.heldItem && (
                <button
                  type="button"
                  onClick={blurAfter(onDiscardHeld)}
                  title="Discard held item (Q)"
                  className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-red-900/60 hover:text-red-200 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t.drop}</span>
                </button>
              )}
            </div>

            <span aria-hidden="true" className="hidden sm:inline text-zinc-700">
              |
            </span>

            {/* Camera & Utility Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={blurAfter(onTogglePointerLock)}
                title="Toggle Mouse Look (L)"
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  hud.isPointerLocked || hud.freeMouseLook
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span>
                  {hud.isPointerLocked || hud.freeMouseLook ? t.exitLook : t.mouseLook}
                </span>
              </button>

              <button
                type="button"
                onClick={blurAfter(onToggleFreeCam)}
                title="Fly Camera Anywhere (C)"
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  hud.freeCam
                    ? 'bg-sky-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{hud.freeCam ? t.freeCamOn : t.freeCam}</span>
              </button>

              <button
                type="button"
                onClick={blurAfter(onToggleMute)}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="rounded-md bg-zinc-800 p-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={blurAfter(onShowQr)}
                aria-label="Share Game QR Code"
                title="Game QR Code"
                className="rounded-md bg-zinc-800 p-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                <QrCode className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={blurAfter(onShowGuide)}
                aria-label="Kitchen guide"
                className="rounded-md bg-zinc-800 p-1.5 text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
