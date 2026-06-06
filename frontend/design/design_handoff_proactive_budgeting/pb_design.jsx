
// ─── pb_design.jsx ───────────────────────────────────────────────
// Design tokens, global CSS injection, and atomic components

(function injectStyles() {
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --c-brand:        oklch(52% 0.22 270);
      --c-brand-mid:    oklch(62% 0.20 270);
      --c-brand-light:  oklch(94% 0.06 270);
      --c-brand-dim:    oklch(52% 0.22 270 / 10%);
      --c-safe:         oklch(52% 0.16 155);
      --c-safe-light:   oklch(94% 0.06 155);
      --c-warn:         oklch(65% 0.15 72);
      --c-warn-light:   oklch(95% 0.06 72);
      --c-danger:       oklch(52% 0.18 22);
      --c-danger-light: oklch(95% 0.06 22);
      --c-bg:           oklch(97.5% 0.008 270);
      --c-surface:      oklch(100% 0 0);
      --c-surface-2:    oklch(96.5% 0.01 270);
      --c-border:       oklch(91% 0.012 270);
      --c-text:         oklch(22% 0.025 270);
      --c-muted:        oklch(58% 0.02 270);
      --c-muted-2:      oklch(76% 0.015 270);

      --r-sm:  8px;
      --r-md:  12px;
      --r-lg:  16px;
      --r-xl:  24px;
      --r-2xl: 32px;
      --r-full: 999px;

      --shadow-sm: 0 1px 3px oklch(0% 0 0 / 6%), 0 1px 2px oklch(0% 0 0 / 4%);
      --shadow-md: 0 4px 12px oklch(0% 0 0 / 8%), 0 2px 4px oklch(0% 0 0 / 4%);
      --shadow-lg: 0 12px 32px oklch(0% 0 0 / 12%), 0 4px 8px oklch(0% 0 0 / 6%);
    }

    html, body {
      font-family: 'DM Sans', sans-serif;
      background: var(--c-bg);
      color: var(--c-text);
      -webkit-font-smoothing: antialiased;
      height: 100%;
    }

    #root {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px 16px;
      background: var(--c-bg);
    }

    /* Phone shell */
    .phone-shell {
      width: 390px;
      height: 844px;
      background: var(--c-surface);
      border-radius: 44px;
      box-shadow: 0 0 0 1px oklch(0% 0 0 / 8%), var(--shadow-lg),
                  0 0 0 10px oklch(0% 0 0 / 4%), 0 0 0 11px oklch(0% 0 0 / 3%);
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
    }

    /* Status bar */
    .status-bar {
      height: 52px;
      padding: 16px 24px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      background: var(--c-surface);
    }
    .status-bar .time {
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }
    .status-icons {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .status-icons svg { display: block; }

    /* Screen area */
    .screen-area {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* Home indicator */
    .home-indicator {
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--c-surface);
    }
    .home-indicator div {
      width: 120px;
      height: 5px;
      background: var(--c-text);
      opacity: 0.18;
      border-radius: var(--r-full);
    }

    /* Scroll container */
    .scroll-view {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .scroll-view::-webkit-scrollbar { display: none; }

    /* Bottom nav */
    .bottom-nav {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 72px;
      background: var(--c-surface);
      border-top: 1px solid var(--c-border);
      display: flex;
      align-items: stretch;
      z-index: 100;
    }
    .nav-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      border: none;
      background: none;
      cursor: pointer;
      padding: 8px 0;
      color: var(--c-muted);
      font-family: inherit;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-tab.active { color: var(--c-brand); }
    .nav-tab svg { display: block; }
    .nav-tab span { font-size: 10px; font-weight: 500; letter-spacing: 0.3px; }

    /* FAB center nav button */
    .nav-fab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 4px;
    }
    .nav-fab button {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--c-brand);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px var(--c-brand-dim), 0 2px 4px oklch(0% 0 0 / 8%);
      transition: transform 0.12s, box-shadow 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .nav-fab button:active { transform: scale(0.94); }
    .nav-fab button svg { display: block; }

    /* Overlay / Bottom sheet */
    .overlay {
      position: absolute;
      inset: 0;
      background: oklch(0% 0 0 / 40%);
      z-index: 200;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      backdrop-filter: blur(2px);
    }
    .bottom-sheet {
      background: var(--c-surface);
      border-radius: var(--r-2xl) var(--r-2xl) 0 0;
      padding: 0 0 32px;
      max-height: 90%;
      overflow-y: auto;
    }
    .sheet-handle {
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sheet-handle div {
      width: 36px;
      height: 4px;
      background: var(--c-border);
      border-radius: var(--r-full);
    }
    .sheet-title {
      font-size: 17px;
      font-weight: 600;
      padding: 0 20px 16px;
      letter-spacing: -0.3px;
    }

    /* Typography utilities */
    .text-xs   { font-size: 11px; }
    .text-sm   { font-size: 13px; }
    .text-base { font-size: 15px; }
    .text-md   { font-size: 17px; }
    .text-lg   { font-size: 20px; }
    .text-xl   { font-size: 24px; }
    .text-2xl  { font-size: 32px; }
    .text-hero { font-size: 48px; }

    .font-normal  { font-weight: 400; }
    .font-medium  { font-weight: 500; }
    .font-semibold{ font-weight: 600; }
    .font-bold    { font-weight: 700; }

    .text-muted   { color: var(--c-muted); }
    .text-muted-2 { color: var(--c-muted-2); }
    .text-brand   { color: var(--c-brand); }
    .text-safe    { color: var(--c-safe); }
    .text-warn    { color: var(--c-warn); }
    .text-danger  { color: var(--c-danger); }
    .tracking-tight { letter-spacing: -0.5px; }
    .tracking-tighter { letter-spacing: -1px; }

    /* Animation */
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);   opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to   { transform: translateX(0); }
    }
    .anim-slide-up    { animation: slideUp 0.3s cubic-bezier(0.34, 1.2, 0.64, 1); }
    .anim-fade-in     { animation: fadeIn 0.2s ease; }
    .anim-slide-right { animation: slideInRight 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
    .anim-slide-left  { animation: slideInLeft 0.28s cubic-bezier(0.4, 0, 0.2, 1); }

    /* Tap feedback */
    .pressable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.1s;
      user-select: none;
    }
    .pressable:active { opacity: 0.7; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

// ── Atom components ───────────────────────────────────────────────

const { useState, useEffect, useRef } = React;

function Btn({ children, variant = 'primary', size = 'md', onClick, disabled, style: s }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit', fontWeight: 600, letterSpacing: '-0.2px',
    transition: 'opacity 0.12s, transform 0.1s', opacity: disabled ? 0.45 : 1,
    WebkitTapHighlightColor: 'transparent', userSelect: 'none',
  };
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13, borderRadius: 10 },
    md: { padding: '13px 20px', fontSize: 15, borderRadius: 14 },
    lg: { padding: '16px 24px', fontSize: 17, borderRadius: 16 },
    full: { padding: '16px 24px', fontSize: 17, borderRadius: 16, width: '100%' },
  };
  const variants = {
    primary: { background: 'var(--c-brand)', color: '#fff', boxShadow: '0 4px 14px var(--c-brand-dim)' },
    secondary: { background: 'var(--c-brand-light)', color: 'var(--c-brand)' },
    ghost: { background: 'transparent', color: 'var(--c-muted)' },
    danger: { background: 'var(--c-danger-light)', color: 'var(--c-danger)' },
    surface: { background: 'var(--c-surface-2)', color: 'var(--c-text)' },
  };
  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
      onClick={disabled ? undefined : onClick}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onTouchStart={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

function Badge({ children, tone = 'brand' }) {
  const tones = {
    brand:  { bg: 'var(--c-brand-light)',  color: 'var(--c-brand)' },
    safe:   { bg: 'var(--c-safe-light)',   color: 'var(--c-safe)' },
    warn:   { bg: 'var(--c-warn-light)',   color: 'var(--c-warn)' },
    danger: { bg: 'var(--c-danger-light)', color: 'var(--c-danger)' },
    neutral:{ bg: 'var(--c-surface-2)',    color: 'var(--c-muted)' },
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 8px', borderRadius: 'var(--r-full)',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.2px',
      ...tones[tone],
    }}>
      {children}
    </span>
  );
}

function ProgressBar({ value, max = 100, tone = 'brand', height = 8, animated = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    brand:  'var(--c-brand)',
    safe:   'var(--c-safe)',
    warn:   'var(--c-warn)',
    danger: 'var(--c-danger)',
  };
  return (
    <div style={{
      width: '100%', height, background: 'var(--c-surface-2)',
      borderRadius: 'var(--r-full)', overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: colors[tone] || colors.brand,
        borderRadius: 'var(--r-full)',
        transition: animated ? 'width 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)' : 'none',
      }} />
    </div>
  );
}

function Divider({ style: s }) {
  return <div style={{ height: 1, background: 'var(--c-border)', ...s }} />;
}

function Spacer({ h = 0, w = 0 }) {
  return <div style={{ height: h, width: w, flexShrink: 0 }} />;
}

Object.assign(window, { Btn, Badge, ProgressBar, Divider, Spacer });
