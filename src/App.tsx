/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './components/GameHUD';
import { QrShareModal } from './components/QrShareModal';
import { ShiftModal } from './components/ShiftModal';
import { ArbishEngine } from './game/ArbishEngine';
import { soundEngine } from './game/audio';
import { Language } from './game/i18n';
import { GameHudSnapshot, IngredientId, StationId } from './game/types';

const INITIAL_HUD: GameHudSnapshot = {
  phase: 'title',
  shiftNumber: 1,
  shiftClockLabel: '12:00 PM',
  shiftTimeLeft: 195,
  money: 0,
  tips: 0,
  ordersServed: 0,
  ordersMissed: 0,
  streak: 0,
  bestStreak: 0,
  rating: 5.0,
  tutorialMode: false,
  tutorialStep: 0,
  tutorialTitle: null,
  tutorialHint: null,
  heldItem: null,
  heldLabel: 'Hands Empty',
  hoverPrompt: null,
  hoverSubPrompt: null,
  activeStation: null,
  isPointerLocked: false,
  freeMouseLook: false,
  freeCam: false,
  cameraFov: 62,
  tickets: [],
  onlineOrdersEnabled: true,
  onlineDispatched: 0,
  grillSlots: [],
  fryerSlots: [],
  assembly: { layers: [], matchedItem: null },
  drinkSlot: { state: 'empty', flavor: 'Cola', progress: 0 },
  toastMessage: null,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<ArbishEngine | null>(null);

  const [hud, setHud] = useState<GameHudSnapshot>(INITIAL_HUD);
  const [muted, setMuted] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const engine = new ArbishEngine(container, (snapshot) => {
      setHud(snapshot);
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleStartShift = useCallback((shiftNum: number, tutorial = false) => {
    setShowGuide(false);
    engineRef.current?.startShift(shiftNum, tutorial);
  }, []);

  const handleSkipTutorial = useCallback(() => {
    engineRef.current?.skipTutorial();
  }, []);

  const handleJumpStation = useCallback((station: StationId) => {
    engineRef.current?.jumpToStation(station);
  }, []);

  const handleTogglePointerLock = useCallback(() => {
    engineRef.current?.togglePointerLock();
  }, []);

  const handleToggleFreeCam = useCallback(() => {
    engineRef.current?.toggleFreeCam();
  }, []);

  const handleDiscardHeld = useCallback(() => {
    engineRef.current?.discardHeldItem();
  }, []);

  const handleAddIngredient = useCallback((ing: IngredientId) => {
    engineRef.current?.addIngredientFromHud(ing);
  }, []);

  const handlePlateOrder = useCallback(() => {
    engineRef.current?.plateFromHud();
  }, []);

  const handleClearAssembly = useCallback(() => {
    engineRef.current?.clearAssemblyFromHud();
  }, []);

  const handleTriggerOnlineOrder = useCallback(() => {
    engineRef.current?.triggerOnlineOrder();
  }, []);

  const handleToggleOnlineOrders = useCallback(() => {
    engineRef.current?.toggleOnlineOrders();
  }, []);

  const handleDispatchOnlineOrder = useCallback((ticketId: number) => {
    engineRef.current?.dispatchOnlineOrderFromHud(ticketId);
  }, []);

  const handleAcceptCustomer = useCallback((ticketId: number) => {
    engineRef.current?.acceptCustomerOrderFromHud(ticketId);
  }, []);

  const handleDeclineCustomer = useCallback((ticketId: number) => {
    engineRef.current?.declineCustomerOrderFromHud(ticketId);
  }, []);

  const handleAcceptOnlineOrder = useCallback((ticketId: number) => {
    engineRef.current?.acceptOnlineOrderFromHud(ticketId);
  }, []);

  const handleDeclineOnlineOrder = useCallback((ticketId: number) => {
    engineRef.current?.declineOnlineOrderFromHud(ticketId);
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleToggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-zinc-950">
      {/* Isolated WebGL Canvas Mount */}
      <div ref={canvasMountRef} className="h-full w-full" />

      {/* Sibling React HUD & Shift Modal */}
      <GameHUD
        hud={hud}
        lang={lang}
        muted={muted}
        onToggleLang={handleToggleLang}
        onToggleMute={handleToggleMute}
        onJumpStation={handleJumpStation}
        onTogglePointerLock={handleTogglePointerLock}
        onToggleFreeCam={handleToggleFreeCam}
        onDiscardHeld={handleDiscardHeld}
        onAddIngredient={handleAddIngredient}
        onPlateOrder={handlePlateOrder}
        onClearAssembly={handleClearAssembly}
        onTriggerOnlineOrder={handleTriggerOnlineOrder}
        onToggleOnlineOrders={handleToggleOnlineOrders}
        onDispatchOnlineOrder={handleDispatchOnlineOrder}
        onAcceptCustomer={handleAcceptCustomer}
        onDeclineCustomer={handleDeclineCustomer}
        onAcceptOnlineOrder={handleAcceptOnlineOrder}
        onDeclineOnlineOrder={handleDeclineOnlineOrder}
        onSkipTutorial={handleSkipTutorial}
        onShowGuide={() => setShowGuide(true)}
        onShowQr={() => setShowQr(true)}
      />

      <ShiftModal
        hud={hud}
        lang={lang}
        showGuideOnly={showGuide}
        onToggleLang={handleToggleLang}
        onShowQr={() => setShowQr(true)}
        onCloseGuide={() => setShowGuide(false)}
        onStartShift={handleStartShift}
      />

      <QrShareModal
        open={showQr}
        lang={lang}
        onClose={() => setShowQr(false)}
      />
    </div>
  );
}
