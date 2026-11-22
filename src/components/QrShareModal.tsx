import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, QrCode, X } from 'lucide-react';
import { Language } from '../game/i18n';

interface QrShareModalProps {
  open: boolean;
  lang: Language;
  onClose: () => void;
}

const SHARED_GAME_URL =
  'https://ais-pre-cetpyeg3baq2upv3brndxo-567935614621.europe-west2.run.app';

export const QrShareModal: React.FC<QrShareModalProps> = ({ open, lang, onClose }) => {
  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : SHARED_GAME_URL;
  const defaultUrl = currentUrl.includes('ais-dev-') ? SHARED_GAME_URL : currentUrl;

  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const safeUrl = targetUrl.trim() || SHARED_GAME_URL;
    QRCode.toDataURL(safeUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0B0C10',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [open, targetUrl]);

  if (!open) return null;

  const isAr = lang === 'ar';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'arbish-bites-game-qr.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-950/75 p-4">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="w-full max-w-md rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 border border-red-500/40 text-red-400">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                {isAr ? 'رمز QR للعبة أربش بايتس' : 'Arbish Bites Game QR Code'}
              </h2>
              <p className="text-xs text-zinc-400">
                {isAr
                  ? 'امسح الكود بكاميرا الجوال لفتح اللعبة مباشرة'
                  : 'Scan with your phone camera to open the game'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR modal"
            className="rounded-lg bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Branded White QR Card */}
        <div className="mt-5 flex flex-col items-center rounded-xl border border-white/10 bg-[#0B0C10] p-5">
          <div className="mb-3 flex items-baseline gap-1.5" dir="ltr">
            <span className="font-script text-3xl leading-none text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              Arbish
            </span>
            <span className="font-script text-lg leading-none text-white -rotate-6">
              Bites
            </span>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-[0_0_24px_rgba(239,68,68,0.22)]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Arbish Bites QR Code"
                className="h-52 w-52 object-contain"
              />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center text-xs text-zinc-500">
                Generating...
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            MAKKAH · AL-SHAWQIYYA
          </div>
        </div>

        {/* Link Presets & Input */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTargetUrl(SHARED_GAME_URL)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                targetUrl === SHARED_GAME_URL
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {isAr ? 'الرابط المشترك' : 'Shared Game Link'}
            </button>
            <button
              type="button"
              onClick={() => setTargetUrl(currentUrl)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                targetUrl === currentUrl
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {isAr ? 'رابط الصفحة الحالي' : 'Current Page URL'}
            </button>
          </div>

          <input
            type="url"
            dir="ltr"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="w-full rounded-lg border border-white/12 bg-zinc-900 px-3 py-2 font-mono-tabular text-xs text-zinc-200 focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ الرابط' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isAr ? 'تحميل QR' : 'Download PNG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
