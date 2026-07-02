/* HookOS Wallet — landing core: shared bits + hero + sections 1–6.
   Adapted from the Atlas design prototype into the wallet apex site (hookoswallet.xyz):
   ATLAS branding -> Wallet, and every CTA wired to a real destination via HL. */

const LT = {
  paper: "#f4f5f1", card: "#ffffff", ink: "#0d100c", ink2: "#494c44", ink3: "#86887e",
  line: "rgba(13,16,12,0.09)", line2: "rgba(13,16,12,0.14)",
  acid: "#38e07b", acidInk: "#0c8a42", acidBg: "rgba(56,224,123,0.13)",
  loss: "#c0291f", gold: "#c79212",
  mono: '"JetBrains Mono", monospace', sans: '"Inter", sans-serif',
};

/* Real destinations. app = the live HookOS protocol app where launches/trades happen;
   the wallet is the native client for it. Store links are placeholders until the
   listings go live — see TODO(verify). */
const HL = {
  wallet: "https://hookoswallet.xyz",
  app: "https://hookos.fun",
  x: "https://x.com/hookosfun",
  bot: "https://x.com/hookosbot",
  tg: "https://t.me/hookos_alpha",
  ios: "https://hookos.fun",     // TODO(verify): swap to App Store URL when the listing is live
  android: "https://hookos.fun", // TODO(verify): swap to Play Store URL when the listing is live
};
function lopen(u) {
  return function () { if (u) window.open(u, "_blank", "noopener,noreferrer"); };
}

const LND_TOKENS = [
  { s: "VAULT", n: "Vaultline", p: "$0.0₄218", ch: 24.2, mc: "$4.2M", vol: "$1.8M", curve: 84 },
  { s: "GHOST", n: "Ghostchain", p: "$0.0₅184", ch: 142.0, mc: "$1.7M", vol: "$920K", curve: 100 },
  { s: "RUNE", n: "Runeforge", p: "$0.142", ch: 218.4, mc: "$8.4M", vol: "$3.1M", curve: 100 },
  { s: "FLUX", n: "Fluxfield", p: "$12.84", ch: -6.1, mc: "$12.8M", vol: "$2.2M", curve: 100 },
  { s: "PRISM", n: "Prismatic", p: "$0.821", ch: 84.2, mc: "$2.9M", vol: "$1.1M", curve: 92 },
  { s: "NEON", n: "Neonbase", p: "$0.0₃92", ch: -2.4, mc: "$890K", vol: "$340K", curve: 61 },
  { s: "AXIS", n: "Axisline", p: "$0.048", ch: 12.8, mc: "$1.2M", vol: "$480K", curve: 73 },
  { s: "EMBER", n: "Emberlight", p: "$0.0₄841", ch: 48.1, mc: "$640K", vol: "$210K", curve: 44 },
  { s: "ORBIT", n: "Orbital", p: "$1.24", ch: 8.4, mc: "$5.1M", vol: "$1.4M", curve: 100 },
  { s: "DUNE", n: "Dunework", p: "$0.0₅412", ch: -11.2, mc: "$420K", vol: "$180K", curve: 28 },
];

function lndSpark(seed, up) {
  const out = [];
  let v = 8;
  for (let i = 0; i < 14; i++) {
    const r = Math.abs(Math.sin(seed * 9.17 + i * 1.93));
    v += (r - (up ? 0.42 : 0.58)) * 3;
    v = Math.max(1, v);
    out.push(v);
  }
  return out;
}

function LSpark({ pts, w = 64, h = 18, color = LT.acidInk, sw = 1.4 }) {
  const max = Math.max(...pts), min = Math.min(...pts), r = max - min || 1;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1) * w).toFixed(1)},${(h - (p - min) / r * (h - 3) - 1.5).toFixed(1)}`).join("");
  return <svg width={w} height={h} style={{ display: "block" }}><path d={d} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round"></path></svg>;
}

function LHex({ size = 26, sw = 2.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M30 5 L51 17 L51 43 L30 55 L9 43 L9 17 Z" stroke={LT.acidInk} strokeWidth={sw * 60 / size} fill={LT.acidBg}></path>
      <path d="M22 26 Q22 36 30 36 Q38 36 38 26 Q38 19 32 19" stroke={LT.acidInk} strokeWidth={sw * 60 / size} fill="none" strokeLinecap="round"></path>
    </svg>
  );
}

/* reveal-on-scroll — fails OPEN: if IO never fires, content shows anyway */
function Reveal({ children, delay = 0, style }) {
  const ref = React.useRef(null);
  const [vis, setVis] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const show = () => { if (!done) { done = true; setVis(true); ob && ob.disconnect(); } };
    let ob = null;
    try {
      ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) show(); }, { threshold: 0.12 });
      ob.observe(el);
    } catch (e) { show(); }
    // fail-open: if already in viewport or IO is unreliable, reveal anyway
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 60 && r.bottom > -60) show();
    };
    const t1 = setTimeout(check, 350);
    const t2 = setTimeout(show, 2500); // absolute fallback — never leave content hidden
    const onScroll = () => check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("scroll", onScroll); ob && ob.disconnect(); };
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(22px)", transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function Counter({ to, prefix = "", suffix = "", decimals = 0 }) {
  const ref = React.useRef(null);
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      ob && ob.disconnect();
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / 1300);
        setV(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    let ob = null;
    try {
      ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); }, { threshold: 0.4 });
      ob.observe(el);
    } catch (e) { start(); }
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) start();
    };
    const t1 = setTimeout(check, 400);
    const t2 = setTimeout(start, 2800); // fail-open: numbers must never stay at 0
    const onScroll = () => check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener("scroll", onScroll); ob && ob.disconnect(); };
  }, [to]);
  return <span ref={ref}>{prefix}{decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()}{suffix}</span>;
}

function Kicker({ children, color = LT.ink3 }) {
  return <div style={{ fontFamily: LT.mono, fontSize: 11, color, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 16 }}>{children}</div>;
}

function H2({ children }) {
  return <h2 style={{ fontSize: 44, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 14px", color: LT.ink }}>{children}</h2>;
}

/* ============ TOPBAR ============ */
function LTopbar() {
  return (
    <div className="lnd-topbar" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", gap: 20, padding: "13px 40px", borderBottom: `1px solid ${LT.line}`, background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)" }}>
      <a href={HL.wallet} className="lnd-plain" style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <LHex size={26}></LHex>
        <span style={{ fontWeight: 700, fontSize: 16.5, color: LT.ink }}>Hook<span style={{ color: LT.acidInk }}>OS</span></span>
        <span style={{ fontFamily: LT.mono, fontSize: 9, color: LT.ink3, border: `1px solid ${LT.line2}`, borderRadius: 4, padding: "1px 5px", letterSpacing: "0.08em" }}>WALLET</span>
      </a>
      <a href={HL.app} target="_blank" rel="noopener noreferrer" className="lnd-plain lnd-search" style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 13px", background: "rgba(13,16,12,0.04)", borderRadius: 8, fontSize: 12.5, color: LT.ink3, minWidth: 200, cursor: "pointer" }}>
        <span>⌘K</span><span>Search tokens, hooks…</span>
      </a>
      <nav className="lnd-nav" style={{ display: "flex", gap: 19, marginLeft: "auto", fontSize: 13.5, color: LT.ink2, fontWeight: 500 }}>
        {[
          { l: "Features", h: "#features" }, { l: "Hooks", h: HL.app }, { l: "Ecosystem", h: HL.app },
          { l: "Community", h: HL.x }, { l: "Docs", h: HL.app },
        ].map(n => <a key={n.l} href={n.h} target={n.h.startsWith("#") ? undefined : "_blank"} rel={n.h.startsWith("#") ? undefined : "noopener noreferrer"} className="lnd-plain lnd-navlink">{n.l}</a>)}
      </nav>
      <span style={{ fontFamily: LT.mono, fontSize: 11.5, color: LT.acidInk, display: "flex", alignItems: "center", gap: 5 }}>
        <span className="lnd-pulse" style={{ width: 6, height: 6, borderRadius: 9, background: LT.acid, display: "inline-block" }}></span>Base
      </span>
      <button className="lnd-btn" style={{ padding: "9px 18px", fontSize: 13.5 }} onClick={lopen(HL.ios)}>Get the App</button>
    </div>
  );
}

/* ============ 2 · LIVE TICKER (marquee) ============ */
function LTicker() {
  // Two copies for a seamless marquee loop; namespace keys so siblings stay unique.
  const row = (copy) => LND_TOKENS.map(t => (
    <span key={`${copy}-${t.s}`} style={{ display: "inline-flex", gap: 7, marginRight: 34, cursor: "pointer" }}>
      <span style={{ color: LT.ink2, fontWeight: 600 }}>${t.s}</span>
      <span style={{ color: LT.ink3 }}>{t.p}</span>
      <span style={{ color: t.ch >= 0 ? LT.acidInk : LT.loss }}>{t.ch >= 0 ? "+" : ""}{t.ch}%</span>
    </span>
  ));
  return (
    <div style={{ borderBottom: `1px solid ${LT.line}`, background: "#fff", overflow: "hidden", padding: "8px 0", fontFamily: LT.mono, fontSize: 12 }}>
      <div className="lnd-marquee" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {row("a")}{row("b")}
      </div>
    </div>
  );
}

/* ============ 1 · HERO — C app frame + A density ============ */
function LndHero() {
  const [tab, setTab] = React.useState(0);
  return (
    <section style={{ padding: "0 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "52px 0 30px", gap: 30, flexWrap: "wrap" }}>
          <div>
            <Kicker>The native HookOS wallet · live on Base · keys, signing, launches &amp; hooks</Kicker>
            <h1 style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, margin: 0, color: LT.ink }}>
              Markets are now <span style={{ color: LT.acidInk }}>software.</span>
            </h1>
            <p style={{ fontSize: 17, color: LT.ink2, margin: "18px 0 0", maxWidth: 560, lineHeight: 1.55 }}>
              The native client for the HookOS ecosystem. Hold your own keys and launch programmable tokens with custom AMM hooks — MEV shields, reflexive burns, PvP wagers, AI-tuned fees, and cross-chain — all in one wallet.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0, paddingBottom: 6 }}>
            <button className="lnd-btn" onClick={lopen(HL.ios)}>Get the App</button>
            <button className="lnd-btn-ghost" onClick={lopen(HL.app)}>Explore HookOS</button>
            <button className="lnd-plain" style={{ color: LT.ink2, fontWeight: 500, fontSize: 14.5, background: "none", border: "none", cursor: "pointer" }} onClick={lopen(HL.app)}>View Docs →</button>
          </div>
        </div>

        {/* live app frame */}
        <Reveal>
        <div className="lnd-frame">
          <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "10px 18px", borderBottom: `1px solid ${LT.line}`, background: "#fafbf8" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "rgba(13,16,12,0.12)" }}></span>)}
            </div>
            {["Market Map", "Tokens", "Terminal"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className="lnd-plain" style={{ fontSize: 12.5, fontWeight: 600, padding: "5px 13px", borderRadius: 7, border: "none", cursor: "pointer", background: tab === i ? LT.acidBg : "transparent", color: tab === i ? LT.acidInk : LT.ink3 }}>{t}</button>
            ))}
            <span style={{ marginLeft: "auto", fontFamily: LT.mono, fontSize: 10.5, color: LT.acidInk }}>● Base mainnet · app preview</span>
          </div>
          <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", minHeight: 360 }}>
            <div className="lnd-hero-map" style={{ position: "relative", borderRight: `1px solid ${LT.line}`, background: "radial-gradient(480px 280px at 50% 45%, rgba(56,224,123,0.08), transparent 70%)" }}>
              <svg width="100%" height="100%" viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0 }}>
                {[
                  { x: 320, y: 168, r: 42, t: "VAULT", main: 1 }, { x: 168, y: 96, r: 24, t: "GH" }, { x: 480, y: 86, r: 19, t: "FL" },
                  { x: 528, y: 250, r: 27, t: "RU" }, { x: 132, y: 258, r: 17, t: "PR" }, { x: 376, y: 296, r: 14, t: "NE" }, { x: 236, y: 312, r: 11, t: "AX" },
                ].map((n, i) => (
                  <g key={i} style={{ cursor: "pointer" }}>
                    {i > 0 && <line x1="320" y1="168" x2={n.x} y2={n.y} stroke="rgba(12,138,66,0.22)" strokeDasharray="2 5"></line>}
                    {n.main ? <circle cx={n.x} cy={n.y} r={n.r + 10} fill="none" stroke="rgba(56,224,123,0.5)">
                      <animate attributeName="r" values={`${n.r + 6};${n.r + 14};${n.r + 6}`} dur="2.6s" repeatCount="indefinite"></animate>
                      <animate attributeName="stroke-opacity" values="0.6;0.1;0.6" dur="2.6s" repeatCount="indefinite"></animate>
                    </circle> : null}
                    <circle cx={n.x} cy={n.y} r={n.r} fill={LT.acid} stroke="rgba(13,16,12,0.15)"></circle>
                    <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={n.r > 30 ? 11 : 8.5} fontWeight="700" fill="#06210f">{n.t}</text>
                  </g>
                ))}
              </svg>
              <div style={{ position: "absolute", left: 16, bottom: 12, fontFamily: LT.mono, fontSize: 9.5, color: LT.ink3 }}>size = mcap · pulse = volume · threads = shared hooks</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 64px 72px", gap: 8, padding: "9px 18px", borderBottom: `1px solid ${LT.line}`, fontFamily: LT.mono, fontSize: 9, color: LT.ink3, letterSpacing: "0.14em" }}>
                <span>TOKEN</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>24H</span><span style={{ textAlign: "right" }}>7D</span>
              </div>
              {LND_TOKENS.slice(0, 6).map((t, i) => (
                <div key={t.s} className="lnd-row" style={{ display: "grid", gridTemplateColumns: "1fr 80px 64px 72px", gap: 8, padding: "10px 18px", borderBottom: `1px solid ${LT.line}`, alignItems: "center", cursor: "pointer" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: LT.ink }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #5af787, #2fb866)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LT.mono, fontSize: 8, fontWeight: 700, color: "#06210f" }}>{t.s.slice(0, 2)}</span>
                    ${t.s}
                  </span>
                  <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 11.5, color: LT.ink }}>{t.p}</span>
                  <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 11, color: t.ch >= 0 ? LT.acidInk : LT.loss }}>{t.ch >= 0 ? "+" : ""}{t.ch}%</span>
                  <span style={{ display: "flex", justifyContent: "flex-end" }}><LSpark pts={lndSpark(i + 2, t.ch >= 0)} w={58} h={16} color={t.ch >= 0 ? LT.acidInk : LT.loss}></LSpark></span>
                </div>
              ))}
              <div style={{ marginTop: "auto", padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafbf8" }}>
                <span style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3 }}>12,840 tokens indexed</span>
                <span onClick={lopen(HL.app)} style={{ fontSize: 12.5, fontWeight: 600, color: LT.acidInk, cursor: "pointer" }}>Open full app →</span>
              </div>
            </div>
          </div>
        </div>
        </Reveal>

        {/* 3 · dense stats band */}
        <Reveal delay={120}>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", border: `1px solid ${LT.line2}`, borderRadius: 14, background: "#fff", margin: "18px 0 0", overflow: "hidden" }}>
          {[
            { k: "Total volume", v: 48.2, pre: "$", suf: "M", dec: 1, sp: lndSpark(3, true) },
            { k: "Tokens launched", v: 12840, pre: "", suf: "", dec: 0, sp: lndSpark(5, true) },
            { k: "Hooks active", v: 142, pre: "", suf: "", dec: 0, sp: lndSpark(7, true) },
            { k: "Protocol fees", v: 1.84, pre: "$", suf: "M", dec: 2, sp: lndSpark(9, true) },
          ].map((s, i) => (
            <div key={s.k} style={{ padding: "18px 24px", borderLeft: i ? `1px solid ${LT.line}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontFamily: LT.mono, fontSize: 9.5, color: LT.ink3, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6 }}>{s.k}</div>
                <div style={{ fontFamily: LT.mono, fontSize: 23, fontWeight: 700, color: LT.ink }}><Counter to={s.v} prefix={s.pre} suffix={s.suf} decimals={s.dec}></Counter></div>
              </div>
              <LSpark pts={s.sp} w={74} h={24}></LSpark>
            </div>
          ))}
        </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 4 · LAUNCH ON X ============ */
function LaunchOnX() {
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div className="lnd-cols" style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <Reveal>
          <Kicker color={LT.acidInk}>New · @hookosbot</Kicker>
          <H2>Tweet a token.<br></br>Deployed in seconds.</H2>
          <p style={{ fontSize: 16, color: LT.ink2, lineHeight: 1.6, maxWidth: 460, margin: "0 0 24px" }}>
            Reply to any tweet with a deploy command. The bot mints the token, seeds liquidity, installs your hooks, and replies with the receipt — all on-chain, no app needed.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="lnd-btn" onClick={lopen(HL.bot)}>Try it now</button>
            <a href={HL.bot} target="_blank" rel="noopener noreferrer" className="lnd-plain" style={{ fontFamily: LT.mono, fontSize: 13, color: LT.acidInk, fontWeight: 600 }}>@hookosbot →</a>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div style={{ position: "relative" }}>
            <div className="lnd-card" style={{ padding: 22, maxWidth: 430 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 99, background: LT.acid, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LT.mono, fontSize: 11, fontWeight: 700, color: "#06210f" }}>0x</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: LT.ink }}>anyone</div>
                  <div style={{ fontSize: 11.5, color: LT.ink3 }}>@anyone · now</div>
                </div>
              </div>
              <div style={{ fontFamily: LT.mono, fontSize: 14.5, lineHeight: 1.6 }}>
                <span style={{ color: LT.acidInk, fontWeight: 600 }}>@hookosbot</span> <span style={{ color: LT.ink }}>deploy $MOON</span><br></br>
                <span style={{ color: LT.ink2 }}>1B supply · anti-bot</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0", maxWidth: 430 }}>
              <span style={{ color: LT.acidInk, fontSize: 18 }}>↓</span>
            </div>
            <div className="lnd-card" style={{ padding: 18, maxWidth: 430, border: `1.5px solid rgba(56,224,123,0.5)`, boxShadow: "0 18px 44px -18px rgba(12,138,66,0.35)", display: "flex", alignItems: "center", gap: 13 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #5af787, #2fb866)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LT.mono, fontSize: 12, fontWeight: 700, color: "#06210f" }}>MO</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: LT.ink }}>$MOON deployed</div>
                <div style={{ fontFamily: LT.mono, fontSize: 11, color: LT.acidInk }}>● live · moon.hookos.fun</div>
              </div>
              <span style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3 }}>4.2s</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 5 · HOW IT WORKS ============ */
function HowItWorks() {
  const prims = [
    { t: "Map", d: "A living force-graph of every market. Size is mcap, pulse is volume, threads are shared hooks. Discovery you can feel.", icon: "◈", cta: "Explore Map" },
    { t: "Receipt", d: "Every launch prints an on-chain receipt — supply, hooks, curve, fees. Verifiable, shareable, collectible.", icon: "🧾", cta: "See a launch" },
    { t: "Hooks", d: "Programs that run inside your AMM. Install from the store or build your own — they fire on every swap.", icon: "◆", cta: "Browse Hooks" },
  ];
  return (
    <section id="features" style={{ padding: "84px 40px 0", scrollMarginTop: 72 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal><Kicker>How it works</Kicker><H2>Three primitives. One operating system.</H2></Reveal>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 28 }}>
          {prims.map((p, i) => (
            <Reveal key={p.t} delay={i * 110}>
              <div className="lnd-card lnd-lift" style={{ padding: 28, height: "100%" }}>
                <div style={{ fontSize: 26, marginBottom: 18, color: LT.acidInk }}>{p.icon}</div>
                <div style={{ fontSize: 21, fontWeight: 700, color: LT.ink, marginBottom: 10 }}>{p.t}</div>
                <p style={{ fontSize: 14.5, color: LT.ink2, lineHeight: 1.6, margin: "0 0 18px" }}>{p.d}</p>
                <span onClick={lopen(HL.app)} style={{ fontSize: 13.5, fontWeight: 600, color: LT.acidInk, cursor: "pointer" }}>{p.cta} →</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ 6 · SIX WEAPONS ============ */
function SixWeapons() {
  const weapons = [
    { t: "MEV Shield", d: "Block sandwich attacks at the pool level.", cta: "Install Hook", icon: "🛡" },
    { t: "Reflexive Burn", d: "Supply shrinks when price falls.", cta: "Install Hook", icon: "🔥" },
    { t: "PvP Arena", d: "Bet on the next candle. Winner takes the pot.", cta: "Enter Arena", icon: "⚔" },
    { t: "AI Hook Studio", d: "Describe → generate → deploy custom hooks.", cta: "Build a Hook", icon: "✦" },
    { t: "Market Map", d: "Force-directed token universe, live.", cta: "Explore Map", icon: "◈" },
    { t: "Battle Pass", d: "Trade. Rank up. Get paid.", cta: "View Season", icon: "▲" },
  ];
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal><Kicker>Capabilities</Kicker><H2>Six weapons. One terminal.</H2></Reveal>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 28 }}>
          {weapons.map((w, i) => (
            <Reveal key={w.t} delay={(i % 3) * 110}>
              <div className="lnd-card lnd-lift" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, background: LT.acidBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{w.icon}</span>
                  <span style={{ fontFamily: LT.mono, fontSize: 9.5, color: LT.ink3 }}>0{i + 1}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: LT.ink }}>{w.t}</div>
                <p style={{ fontSize: 13.5, color: LT.ink2, lineHeight: 1.55, margin: 0, flex: 1 }}>{w.d}</p>
                <button className="lnd-btn-ghost" style={{ alignSelf: "flex-start", padding: "8px 15px", fontSize: 12.5 }} onClick={lopen(HL.app)}>{w.cta}</button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LT, HL, lopen, LND_TOKENS, lndSpark, LSpark, LHex, Reveal, Counter, Kicker, H2, LTopbar, LTicker, LndHero, LaunchOnX, HowItWorks, SixWeapons });
