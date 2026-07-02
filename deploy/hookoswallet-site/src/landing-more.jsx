/* HookOS Landing — sections 7–15 */

/* ============ 7 · PROTOCOL PULSE ============ */
function ProtocolPulse() {
  const volBars = [4,6,5,8,7,9,8,11,10,13,12,15,14,17];
  const topHooks = [
    { n: "MEV Shield", v: 4218 }, { n: "Reflexive Burn", v: 3184 }, { n: "Sniper Cage", v: 2841 },
    { n: "Loyalty Multiplier", v: 1922 }, { n: "AI Fee Tuner", v: 1484 },
  ];
  const maxH = topHooks[0].v;
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal><Kicker>Protocol pulse</Kicker><H2>The numbers.</H2></Reveal>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 28 }}>
          <Reveal>
            <div className="lnd-card" style={{ padding: 24, height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.16em" }}>VOLUME · 14D</span>
                <span style={{ fontFamily: LT.mono, fontSize: 12, fontWeight: 700, color: LT.acidInk }}>$48.2M</span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 110 }}>
                {volBars.map((v, i) => (
                  <div key={i} style={{ flex: 1, height: `${v / 17 * 100}%`, background: i === volBars.length - 1 ? LT.acidInk : LT.acid, opacity: i === volBars.length - 1 ? 1 : 0.35 + v / 34, borderRadius: 3 }}></div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={110}>
            <div className="lnd-card" style={{ padding: 24, height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.16em" }}>REVENUE · 30D</span>
                <span style={{ fontFamily: LT.mono, fontSize: 12, fontWeight: 700, color: LT.acidInk }}>$1.84M</span>
              </div>
              <LSpark pts={lndSpark(11, true).concat(lndSpark(13, true))} w={340} h={110} sw={2}></LSpark>
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="lnd-card" style={{ padding: 24, height: "100%" }}>
              <div style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.16em", marginBottom: 16 }}>TOP HOOKS · INSTALLS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {topHooks.map(h => (
                  <div key={h.n}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: LT.ink }}>{h.n}</span>
                      <span style={{ fontFamily: LT.mono, color: LT.ink3 }}>{h.v.toLocaleString()}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "rgba(13,16,12,0.05)" }}>
                      <div style={{ width: `${h.v / maxH * 100}%`, height: "100%", borderRadius: 99, background: LT.acid }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============ 8 · REVENUE SPLITS ============ */
function RevenueSplits() {
  const splits = [
    { n: "HOOK Stakers", p: 40 }, { n: "Liquidity", p: 20 }, { n: "Hook Creators", p: 15 }, { n: "Treasury", p: 15 }, { n: "Platform", p: 10 },
  ];
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal><Kicker>Fee routing</Kicker><H2>On-chain revenue splits.</H2></Reveal>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginTop: 28 }}>
          {splits.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="lnd-card" style={{ padding: 22 }}>
                <div style={{ fontFamily: LT.mono, fontSize: 32, fontWeight: 700, color: i === 0 ? LT.acidInk : LT.ink }}>{s.p}%</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: LT.ink2, margin: "6px 0 14px" }}>{s.n}</div>
                <div style={{ height: 6, borderRadius: 99, background: "rgba(13,16,12,0.05)", overflow: "hidden" }}>
                  <div className="lnd-fill" style={{ width: `${s.p * 2.2}%`, height: "100%", borderRadius: 99, background: i === 0 ? LT.acidInk : LT.acid }}></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ 9 · GAMIFICATION ============ */
function Gamification() {
  const ring = 2 * Math.PI * 30;
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal><Kicker>Growth economy</Kicker><H2>Trade. Rank up. Get paid.</H2></Reveal>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
          <Reveal>
            <div className="lnd-card" style={{ padding: 26, height: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 22 }}>
                <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                  <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(13,16,12,0.07)" strokeWidth="5"></circle>
                    <circle cx="36" cy="36" r="30" fill="none" stroke={LT.acidInk} strokeWidth="5" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * 0.3}></circle>
                  </svg>
                  <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: LT.mono, fontSize: 20, fontWeight: 700, color: LT.ink }}>24</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: LT.ink }}>Season 4 Pass</span>
                    <span style={{ fontFamily: LT.mono, fontSize: 11, color: LT.ink3 }}>8,420 / 12,000 XP</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "rgba(13,16,12,0.05)", overflow: "hidden" }}>
                    <div className="lnd-fill" style={{ width: "70%", height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${LT.acid}, ${LT.acidInk})` }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {["T24 · Fee rebate", "T25 · Map aura", "T26 · 🔒 Pro"].map((t, i) => (
                  <span key={t} style={{ fontFamily: LT.mono, fontSize: 10.5, padding: "6px 11px", borderRadius: 8, border: `1px solid ${i === 0 ? "rgba(56,224,123,0.5)" : LT.line2}`, background: i === 0 ? LT.acidBg : "#fff", color: i === 0 ? LT.acidInk : LT.ink3 }}>{t}</span>
                ))}
              </div>
              <span onClick={lopen(HL.app)} style={{ fontSize: 13.5, fontWeight: 600, color: LT.acidInk, cursor: "pointer" }}>View Season Pass →</span>
            </div>
          </Reveal>
          <Reveal delay={130}>
            <div className="lnd-card" style={{ padding: 26, height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: LT.ink }}>Daily quests</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,1,1,1,0,0,0].map((f, i) => (
                    <span key={i} style={{ width: 14, height: 14, borderRadius: 4, background: f ? LT.acid : "rgba(13,16,12,0.06)", border: `1px solid ${f ? "transparent" : LT.line2}` }}></span>
                  ))}
                  <span style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, marginLeft: 6 }}>4d streak</span>
                </div>
              </div>
              {[
                { q: "Make a trade on any curve token", xp: 250, done: true },
                { q: "Install a hook on your token", xp: 400, done: false },
                { q: "Win an arena wager", xp: 600, done: false },
              ].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${LT.line}` : "none" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, background: q.done ? LT.acidInk : "#fff", border: `1.5px solid ${q.done ? LT.acidInk : LT.line2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10 }}>{q.done ? "✓" : ""}</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: q.done ? LT.ink3 : LT.ink, textDecoration: q.done ? "line-through" : "none" }}>{q.q}</span>
                  <span style={{ fontFamily: LT.mono, fontSize: 11, fontWeight: 700, color: LT.acidInk }}>+{q.xp} XP</span>
                </div>
              ))}
              <span onClick={lopen(HL.app)} style={{ fontSize: 13.5, fontWeight: 600, color: LT.acidInk, cursor: "pointer", display: "inline-block", marginTop: 12 }}>View All Quests →</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============ 10 · WALLET OS ============ */
function WalletOS() {
  const feats = [
    { t: "Smart Wallets", d: "ERC-4337 accounts, gasless onboarding" },
    { t: "Extensions", d: "5 plugins: limits, alerts, auto-buy, vesting, guard" },
    { t: "Auto-Split Revenue", d: "Route earnings to N wallets on-chain" },
    { t: "Donation Automation", d: "Pledge % of fees to any address" },
    { t: "Multi-wallet", d: "One identity, many addresses" },
  ];
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div className="lnd-cols" style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 56, alignItems: "center" }}>
        <Reveal>
          <Kicker color={LT.acidInk}>New · Wallet OS</Kicker>
          <H2>Every wallet is a revenue engine.</H2>
          <p style={{ fontSize: 16, color: LT.ink2, lineHeight: 1.6, maxWidth: 420, margin: "0 0 24px" }}>
            Smart accounts with programmable money flows — your trading, creator earnings, and donations route themselves.
          </p>
          <button className="lnd-btn" onClick={lopen(HL.ios)}>Create Smart Wallet</button>
        </Reveal>
        <Reveal delay={130}>
          <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {feats.map((f, i) => (
              <div key={f.t} className="lnd-card lnd-lift" style={{ padding: 20, gridColumn: i === 4 ? "span 2" : "auto" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: LT.ink, marginBottom: 5 }}>{f.t}</div>
                <div style={{ fontSize: 12.5, color: LT.ink2, lineHeight: 1.5 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 11 · CREATOR ECONOMY ============ */
function CreatorEconomy() {
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="lnd-card" style={{ padding: "44px 48px", background: "linear-gradient(135deg, #ffffff, #f2f8f1)" }}>
          <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
            <Reveal>
              <Kicker color={LT.acidInk}>Creator economy</Kicker>
              <H2>Build hooks. Earn forever.</H2>
              <p style={{ fontSize: 16, color: LT.ink2, lineHeight: 1.6, maxWidth: 440, margin: "0 0 22px" }}>
                Publish to the hook marketplace with license NFTs. Every install, every swap through your hook — you get paid, on-chain, automatically.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 26 }}>
                <div>
                  <div style={{ fontFamily: LT.mono, fontSize: 38, fontWeight: 700, color: LT.acidInk }}>70/30</div>
                  <div style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.14em" }}>CREATOR SPLIT</div>
                </div>
                <div style={{ width: 1, height: 44, background: LT.line2 }}></div>
                <div>
                  <div style={{ fontFamily: LT.mono, fontSize: 38, fontWeight: 700, color: LT.ink }}>142</div>
                  <div style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.14em" }}>HOOKS LISTED</div>
                </div>
              </div>
              <button className="lnd-btn" onClick={lopen(HL.app)}>Start Building</button>
            </Reveal>
            <Reveal delay={130}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0 }}>
                {[
                  { t: "Build", d: "AI Studio or Solidity SDK", icon: "✦" },
                  { t: "Deploy", d: "Audited registry, one tx", icon: "◆" },
                  { t: "Earn", d: "Per-install + per-swap fees", icon: "$" },
                ].map((s, i) => (
                  <React.Fragment key={s.t}>
                    {i > 0 && <span style={{ color: LT.acidInk, fontSize: 18, padding: "0 10px" }}>→</span>}
                    <div className="lnd-card" style={{ padding: "20px 18px", flex: 1, textAlign: "center" }}>
                      <span style={{ width: 38, height: 38, borderRadius: 10, background: LT.acidBg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginBottom: 10, color: LT.acidInk, fontWeight: 700 }}>{s.icon}</span>
                      <div style={{ fontSize: 15, fontWeight: 700, color: LT.ink }}>{s.t}</div>
                      <div style={{ fontSize: 11.5, color: LT.ink3, marginTop: 4 }}>{s.d}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ 12 · MULTI-CHAIN ============ */
function ChainLogo({ chain }) {
  const [err, setErr] = React.useState(false);
  if (!err && chain.img) {
    return <img src={chain.img} alt={chain.n} width="24" height="24" onError={() => setErr(true)} style={{ width: 24, height: 24, borderRadius: 99, objectFit: "cover", filter: chain.live ? "none" : "grayscale(0.25)", opacity: chain.live ? 1 : 0.88 }}></img>;
  }
  return (
    <span style={{ width: 24, height: 24, borderRadius: 99, background: chain.c, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LT.mono, fontSize: 9.5, fontWeight: 700, color: chain.fg || "#fff" }}>{chain.n.slice(0, 2)}</span>
  );
}

function MultiChain() {
  const chains = [
    { n: "Base", live: true, img: "assets/chains/base.jpg", c: "#0052ff" },
    { n: "Ethereum", img: "assets/chains/ethereum.jpg", c: "#627eea" },
    { n: "Unichain", img: "assets/chains/unichain.jpg", c: "#f50db4" },
    { n: "Arbitrum", img: "assets/chains/arbitrum.jpg", c: "#28a0f0" },
    { n: "BNB", img: "assets/chains/binance.jpg", c: "#f0b90b", fg: "#1a1500" },
    { n: "HyperEVM", img: "assets/chains/hyperliquid.jpg", c: "#97fce4", fg: "#04312a" },
    { n: "MegaETH", img: "assets/chains/megaeth.jpg", c: "#1a1a1a" },
    { n: "Ink", img: "assets/chains/ink.jpg", c: "#7132f5" },
    { n: "X Layer", img: "assets/chains/xlayer.jpg", c: "#0d100c" },
  ];
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <Kicker>Multi-chain</Kicker>
          <H2>9 chains. One protocol.</H2>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
            {chains.map((c, i) => (
              <div key={c.n} className="lnd-card lnd-lift" style={{ padding: "13px 22px", display: "flex", alignItems: "center", gap: 10, border: c.live ? "1.5px solid rgba(56,224,123,0.55)" : undefined }}>
                <ChainLogo chain={c}></ChainLogo>
                <span style={{ fontSize: 14, fontWeight: 600, color: c.live ? LT.ink : LT.ink2 }}>{c.n}</span>
                {c.live
                  ? <span style={{ fontFamily: LT.mono, fontSize: 9, fontWeight: 700, color: LT.acidInk, background: LT.acidBg, padding: "3px 7px", borderRadius: 5, letterSpacing: "0.1em" }}>LIVE</span>
                  : <span style={{ fontFamily: LT.mono, fontSize: 9, color: LT.ink3, border: `1px solid ${LT.line2}`, padding: "3px 7px", borderRadius: 5, letterSpacing: "0.1em" }}>SOON</span>}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 13 · TRENDING ============ */
function TrendingTokens() {
  return (
    <section style={{ padding: "84px 40px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
            <div><Kicker>Markets</Kicker><H2>Trending now.</H2></div>
            <span onClick={lopen(HL.app)} style={{ fontSize: 13.5, fontWeight: 600, color: LT.acidInk, cursor: "pointer", paddingBottom: 8 }}>All 12,840 tokens →</span>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="lnd-card lnd-tscroll" style={{ padding: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "44px 1.5fr 110px 90px 110px 110px 1fr 90px", gap: 12, padding: "11px 22px", borderBottom: `1px solid ${LT.line}`, fontFamily: LT.mono, fontSize: 9.5, color: LT.ink3, letterSpacing: "0.14em" }}>
              <span>#</span><span>TOKEN</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>24H</span><span style={{ textAlign: "right" }}>MCAP</span><span style={{ textAlign: "right" }}>VOLUME</span><span>CURVE</span><span style={{ textAlign: "right" }}>7D</span>
            </div>
            {LND_TOKENS.map((t, i) => (
              <div key={t.s} className="lnd-row" style={{ display: "grid", gridTemplateColumns: "44px 1.5fr 110px 90px 110px 110px 1fr 90px", gap: 12, padding: "13px 22px", borderBottom: i < 9 ? `1px solid ${LT.line}` : "none", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontFamily: LT.mono, fontSize: 11.5, color: i < 3 ? LT.gold : LT.ink3, fontWeight: i < 3 ? 700 : 400 }}>{i + 1}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, #5af787, #2fb866)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LT.mono, fontSize: 9, fontWeight: 700, color: "#06210f" }}>{t.s.slice(0, 2)}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: LT.ink }}>${t.s}</span>
                  <span style={{ fontSize: 12, color: LT.ink3 }}>{t.n}</span>
                </span>
                <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 12.5, color: LT.ink }}>{t.p}</span>
                <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 12, color: t.ch >= 0 ? LT.acidInk : LT.loss }}>{t.ch >= 0 ? "+" : ""}{t.ch}%</span>
                <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 12, color: LT.ink2 }}>{t.mc}</span>
                <span style={{ textAlign: "right", fontFamily: LT.mono, fontSize: 12, color: LT.ink2 }}>{t.vol}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(13,16,12,0.05)", overflow: "hidden" }}>
                    <span style={{ display: "block", width: `${t.curve}%`, height: "100%", borderRadius: 99, background: t.curve === 100 ? LT.gold : LT.acid }}></span>
                  </span>
                  <span style={{ fontFamily: LT.mono, fontSize: 9.5, color: t.curve === 100 ? LT.gold : LT.ink3, minWidth: 38 }}>{t.curve === 100 ? "GRAD" : `${t.curve}%`}</span>
                </span>
                <span style={{ display: "flex", justifyContent: "flex-end" }}><LSpark pts={lndSpark(i + 4, t.ch >= 0)} w={66} h={20} color={t.ch >= 0 ? LT.acidInk : LT.loss}></LSpark></span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 14 · BOTTOM CTA ============ */
function BottomCTA() {
  return (
    <section style={{ padding: "100px 40px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}><LHex size={56}></LHex></div>
          <h2 style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.04, margin: "0 0 16px", color: LT.ink }}>
            Stop launching tokens.<br></br><span style={{ color: LT.acidInk }}>Start launching markets.</span>
          </h2>
          <p style={{ fontSize: 16.5, color: LT.ink2, margin: "0 0 30px" }}>Deploy in 60 seconds — from the app or a single tweet.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button className="lnd-btn" style={{ padding: "15px 28px", fontSize: 15.5 }} onClick={lopen(HL.ios)}>🚀 Get the App</button>
            <button className="lnd-btn-ghost" style={{ padding: "15px 28px", fontSize: 15.5 }} onClick={lopen(HL.app)}>Explore Hooks</button>
            <button className="lnd-btn-ghost" style={{ padding: "15px 28px", fontSize: 15.5 }} onClick={lopen(HL.tg)}>Join Community</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 15 · FOOTER ============ */
function LFooter() {
  const cols = [
    { h: "Protocol", l: [["Tokens", HL.app], ["Hooks", HL.app], ["Arena", HL.app], ["Terminal", HL.app], ["Launch", HL.app], ["Market Map", HL.app]] },
    { h: "Economy", l: [["Battle Pass", HL.app], ["Quests", HL.app], ["Clans", HL.app], ["Launch Wars", HL.app], ["Staking", HL.app], ["Governance", HL.app]] },
    { h: "Build", l: [["AI Hook Studio", HL.app], ["Creator Hub", HL.app], ["Marketplace", HL.app], ["Docs", HL.app], ["Status", HL.app], ["Get the App", HL.ios]] },
    { h: "Community", l: [["X @hookosfun", HL.x], ["Bot @hookosbot", HL.bot], ["Telegram", HL.tg], ["hookos.fun", HL.app], ["Wallet site", HL.wallet], ["Brand Kit", HL.app]] },
  ];
  const socials = [["𝕏", HL.x], ["✈", HL.tg], ["◆", HL.app]];
  return (
    <footer style={{ borderTop: `1px solid ${LT.line}`, background: "#fff", padding: "52px 40px 36px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="lnd-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 36 }}>
          <div>
            <a href={HL.wallet} className="lnd-plain" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <LHex size={28}></LHex>
              <span style={{ fontWeight: 700, fontSize: 17, color: LT.ink }}>Hook<span style={{ color: LT.acidInk }}>OS</span> Wallet</span>
            </a>
            <p style={{ fontSize: 13, color: LT.ink3, lineHeight: 1.6, maxWidth: 240, margin: "0 0 18px" }}>
              The native client for the HookOS ecosystem. Markets are now software.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map(([s, href], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="lnd-plain" style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${LT.line2}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: LT.ink2, cursor: "pointer" }}>{s}</a>
              ))}
            </div>
          </div>
          {cols.map(c => (
            <div key={c.h}>
              <div style={{ fontFamily: LT.mono, fontSize: 10, color: LT.ink3, letterSpacing: "0.18em", marginBottom: 14 }}>{c.h.toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {c.l.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="lnd-plain lnd-navlink" style={{ fontSize: 13 }}>{label}</a>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 44, paddingTop: 22, borderTop: `1px solid ${LT.line}` }}>
          <span style={{ fontFamily: LT.mono, fontSize: 11, color: LT.ink3 }}>© 2026 HOOKOS LABS · hookos.fun</span>
          <span style={{ fontFamily: LT.mono, fontSize: 11, color: LT.acidInk, display: "flex", alignItems: "center", gap: 7 }}>
            <LHex size={14} sw={4}></LHex> POWERED BY HookOS
          </span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { ProtocolPulse, RevenueSplits, Gamification, WalletOS, CreatorEconomy, MultiChain, TrendingTokens, BottomCTA, LFooter });
