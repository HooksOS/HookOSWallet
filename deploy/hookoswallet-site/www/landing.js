(function () {
  const LT = {
    paper: "#f4f5f1",
    card: "#ffffff",
    ink: "#0d100c",
    ink2: "#494c44",
    ink3: "#86887e",
    line: "rgba(13,16,12,0.09)",
    line2: "rgba(13,16,12,0.14)",
    acid: "#38e07b",
    acidInk: "#0c8a42",
    acidBg: "rgba(56,224,123,0.13)",
    loss: "#c0291f",
    gold: "#c79212",
    mono: '"JetBrains Mono", monospace',
    sans: '"Inter", sans-serif'
  };
  const HL = {
    wallet: "https://hookoswallet.xyz",
    app: "https://hookos.fun",
    x: "https://x.com/hookosfun",
    bot: "https://x.com/hookosbot",
    tg: "https://t.me/hookos_alpha",
    ios: "https://hookos.fun",
    android: "https://hookos.fun"
  };
  function lopen(u) {
    return function () {
      if (u) window.open(u, "_blank", "noopener,noreferrer");
    };
  }
  const LND_TOKENS = [{
    s: "VAULT",
    n: "Vaultline",
    p: "$0.0₄218",
    ch: 24.2,
    mc: "$4.2M",
    vol: "$1.8M",
    curve: 84
  }, {
    s: "GHOST",
    n: "Ghostchain",
    p: "$0.0₅184",
    ch: 142.0,
    mc: "$1.7M",
    vol: "$920K",
    curve: 100
  }, {
    s: "RUNE",
    n: "Runeforge",
    p: "$0.142",
    ch: 218.4,
    mc: "$8.4M",
    vol: "$3.1M",
    curve: 100
  }, {
    s: "FLUX",
    n: "Fluxfield",
    p: "$12.84",
    ch: -6.1,
    mc: "$12.8M",
    vol: "$2.2M",
    curve: 100
  }, {
    s: "PRISM",
    n: "Prismatic",
    p: "$0.821",
    ch: 84.2,
    mc: "$2.9M",
    vol: "$1.1M",
    curve: 92
  }, {
    s: "NEON",
    n: "Neonbase",
    p: "$0.0₃92",
    ch: -2.4,
    mc: "$890K",
    vol: "$340K",
    curve: 61
  }, {
    s: "AXIS",
    n: "Axisline",
    p: "$0.048",
    ch: 12.8,
    mc: "$1.2M",
    vol: "$480K",
    curve: 73
  }, {
    s: "EMBER",
    n: "Emberlight",
    p: "$0.0₄841",
    ch: 48.1,
    mc: "$640K",
    vol: "$210K",
    curve: 44
  }, {
    s: "ORBIT",
    n: "Orbital",
    p: "$1.24",
    ch: 8.4,
    mc: "$5.1M",
    vol: "$1.4M",
    curve: 100
  }, {
    s: "DUNE",
    n: "Dunework",
    p: "$0.0₅412",
    ch: -11.2,
    mc: "$420K",
    vol: "$180K",
    curve: 28
  }];
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
  function LSpark({
    pts,
    w = 64,
    h = 18,
    color = LT.acidInk,
    sw = 1.4
  }) {
    const max = Math.max(...pts),
      min = Math.min(...pts),
      r = max - min || 1;
    const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1) * w).toFixed(1)},${(h - (p - min) / r * (h - 3) - 1.5).toFixed(1)}`).join("");
    return React.createElement("svg", {
      width: w,
      height: h,
      style: {
        display: "block"
      }
    }, React.createElement("path", {
      d: d,
      stroke: color,
      strokeWidth: sw,
      fill: "none",
      strokeLinecap: "round"
    }));
  }
  function LHex({
    size = 26,
    sw = 2.6
  }) {
    return React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 60 60",
      fill: "none"
    }, React.createElement("path", {
      d: "M30 5 L51 17 L51 43 L30 55 L9 43 L9 17 Z",
      stroke: LT.acidInk,
      strokeWidth: sw * 60 / size,
      fill: LT.acidBg
    }), React.createElement("path", {
      d: "M22 26 Q22 36 30 36 Q38 36 38 26 Q38 19 32 19",
      stroke: LT.acidInk,
      strokeWidth: sw * 60 / size,
      fill: "none",
      strokeLinecap: "round"
    }));
  }
  function Reveal({
    children,
    delay = 0,
    style
  }) {
    const ref = React.useRef(null);
    const [vis, setVis] = React.useState(false);
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      let done = false;
      const show = () => {
        if (!done) {
          done = true;
          setVis(true);
          ob && ob.disconnect();
        }
      };
      let ob = null;
      try {
        ob = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) show();
        }, {
          threshold: 0.12
        });
        ob.observe(el);
      } catch (e) {
        show();
      }
      const check = () => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 60 && r.bottom > -60) show();
      };
      const t1 = setTimeout(check, 350);
      const t2 = setTimeout(show, 2500);
      const onScroll = () => check();
      window.addEventListener("scroll", onScroll, {
        passive: true
      });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("scroll", onScroll);
        ob && ob.disconnect();
      };
    }, []);
    return React.createElement("div", {
      ref: ref,
      style: {
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(22px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style
      }
    }, children);
  }
  function Counter({
    to,
    prefix = "",
    suffix = "",
    decimals = 0
  }) {
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
        const tick = now => {
          const t = Math.min(1, (now - t0) / 1300);
          setV(to * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      let ob = null;
      try {
        ob = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) start();
        }, {
          threshold: 0.4
        });
        ob.observe(el);
      } catch (e) {
        start();
      }
      const check = () => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) start();
      };
      const t1 = setTimeout(check, 400);
      const t2 = setTimeout(start, 2800);
      const onScroll = () => check();
      window.addEventListener("scroll", onScroll, {
        passive: true
      });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("scroll", onScroll);
        ob && ob.disconnect();
      };
    }, [to]);
    return React.createElement("span", {
      ref: ref
    }, prefix, decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString(), suffix);
  }
  function Kicker({
    children,
    color = LT.ink3
  }) {
    return React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color,
        letterSpacing: "0.24em",
        textTransform: "uppercase",
        marginBottom: 16
      }
    }, children);
  }
  function H2({
    children
  }) {
    return React.createElement("h2", {
      style: {
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        margin: "0 0 14px",
        color: LT.ink
      }
    }, children);
  }
  function LTopbar() {
    return React.createElement("div", {
      className: "lnd-topbar",
      style: {
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "13px 40px",
        borderBottom: `1px solid ${LT.line}`,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)"
      }
    }, React.createElement("a", {
      href: HL.wallet,
      className: "lnd-plain",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, React.createElement(LHex, {
      size: 26
    }), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 16.5,
        color: LT.ink
      }
    }, "Hook", React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "OS")), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9,
        color: LT.ink3,
        border: `1px solid ${LT.line2}`,
        borderRadius: 4,
        padding: "1px 5px",
        letterSpacing: "0.08em"
      }
    }, "WALLET")), React.createElement("a", {
      href: HL.app,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain lnd-search",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 13px",
        background: "rgba(13,16,12,0.04)",
        borderRadius: 8,
        fontSize: 12.5,
        color: LT.ink3,
        minWidth: 200,
        cursor: "pointer"
      }
    }, React.createElement("span", null, "\u2318K"), React.createElement("span", null, "Search tokens, hooks\u2026")), React.createElement("nav", {
      className: "lnd-nav",
      style: {
        display: "flex",
        gap: 19,
        marginLeft: "auto",
        fontSize: 13.5,
        color: LT.ink2,
        fontWeight: 500
      }
    }, [{
      l: "Features",
      h: "#features"
    }, {
      l: "Hooks",
      h: HL.app
    }, {
      l: "Ecosystem",
      h: HL.app
    }, {
      l: "Community",
      h: HL.x
    }, {
      l: "Docs",
      h: HL.app
    }].map(n => React.createElement("a", {
      key: n.l,
      href: n.h,
      target: n.h.startsWith("#") ? undefined : "_blank",
      rel: n.h.startsWith("#") ? undefined : "noopener noreferrer",
      className: "lnd-plain lnd-navlink"
    }, n.l))), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11.5,
        color: LT.acidInk,
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, React.createElement("span", {
      className: "lnd-pulse",
      style: {
        width: 6,
        height: 6,
        borderRadius: 9,
        background: LT.acid,
        display: "inline-block"
      }
    }), "Base"), React.createElement("button", {
      className: "lnd-btn",
      style: {
        padding: "9px 18px",
        fontSize: 13.5
      },
      onClick: lopen(HL.ios)
    }, "Get the App"));
  }
  function LTicker() {
    const row = copy => LND_TOKENS.map(t => React.createElement("span", {
      key: `${copy}-${t.s}`,
      style: {
        display: "inline-flex",
        gap: 7,
        marginRight: 34,
        cursor: "pointer"
      }
    }, React.createElement("span", {
      style: {
        color: LT.ink2,
        fontWeight: 600
      }
    }, "$", t.s), React.createElement("span", {
      style: {
        color: LT.ink3
      }
    }, t.p), React.createElement("span", {
      style: {
        color: t.ch >= 0 ? LT.acidInk : LT.loss
      }
    }, t.ch >= 0 ? "+" : "", t.ch, "%")));
    return React.createElement("div", {
      style: {
        borderBottom: `1px solid ${LT.line}`,
        background: "#fff",
        overflow: "hidden",
        padding: "8px 0",
        fontFamily: LT.mono,
        fontSize: 12
      }
    }, React.createElement("div", {
      className: "lnd-marquee",
      style: {
        display: "inline-block",
        whiteSpace: "nowrap"
      }
    }, row("a"), row("b")));
  }
  function LndHero() {
    const [tab, setTab] = React.useState(0);
    return React.createElement("section", {
      style: {
        padding: "0 40px"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "52px 0 30px",
        gap: 30,
        flexWrap: "wrap"
      }
    }, React.createElement("div", null, React.createElement(Kicker, null, "The native HookOS wallet \xB7 live on Base \xB7 keys, signing, launches & hooks"), React.createElement("h1", {
      style: {
        fontSize: 64,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        lineHeight: 1.0,
        margin: 0,
        color: LT.ink
      }
    }, "Markets are now ", React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "software.")), React.createElement("p", {
      style: {
        fontSize: 17,
        color: LT.ink2,
        margin: "18px 0 0",
        maxWidth: 560,
        lineHeight: 1.55
      }
    }, "The native client for the HookOS ecosystem. Hold your own keys and launch programmable tokens with custom AMM hooks \u2014 MEV shields, reflexive burns, PvP wagers, AI-tuned fees, and cross-chain \u2014 all in one wallet.")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        flexShrink: 0,
        paddingBottom: 6
      }
    }, React.createElement("button", {
      className: "lnd-btn",
      onClick: lopen(HL.ios)
    }, "Get the App"), React.createElement("button", {
      className: "lnd-btn-ghost",
      onClick: lopen(HL.app)
    }, "Explore HookOS"), React.createElement("button", {
      className: "lnd-plain",
      style: {
        color: LT.ink2,
        fontWeight: 500,
        fontSize: 14.5,
        background: "none",
        border: "none",
        cursor: "pointer"
      },
      onClick: lopen(HL.app)
    }, "View Docs \u2192"))), React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-frame"
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "10px 18px",
        borderBottom: `1px solid ${LT.line}`,
        background: "#fafbf8"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        gap: 5
      }
    }, [0, 1, 2].map(i => React.createElement("span", {
      key: i,
      style: {
        width: 9,
        height: 9,
        borderRadius: 9,
        background: "rgba(13,16,12,0.12)"
      }
    }))), ["Market Map", "Tokens", "Terminal"].map((t, i) => React.createElement("button", {
      key: t,
      onClick: () => setTab(i),
      className: "lnd-plain",
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        padding: "5px 13px",
        borderRadius: 7,
        border: "none",
        cursor: "pointer",
        background: tab === i ? LT.acidBg : "transparent",
        color: tab === i ? LT.acidInk : LT.ink3
      }
    }, t)), React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontFamily: LT.mono,
        fontSize: 10.5,
        color: LT.acidInk
      }
    }, "\u25CF Base mainnet \xB7 app preview")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1.3fr 1fr",
        minHeight: 360
      }
    }, React.createElement("div", {
      className: "lnd-hero-map",
      style: {
        position: "relative",
        borderRight: `1px solid ${LT.line}`,
        background: "radial-gradient(480px 280px at 50% 45%, rgba(56,224,123,0.08), transparent 70%)"
      }
    }, React.createElement("svg", {
      width: "100%",
      height: "100%",
      viewBox: "0 0 640 360",
      preserveAspectRatio: "xMidYMid meet",
      style: {
        position: "absolute",
        inset: 0
      }
    }, [{
      x: 320,
      y: 168,
      r: 42,
      t: "VAULT",
      main: 1
    }, {
      x: 168,
      y: 96,
      r: 24,
      t: "GH"
    }, {
      x: 480,
      y: 86,
      r: 19,
      t: "FL"
    }, {
      x: 528,
      y: 250,
      r: 27,
      t: "RU"
    }, {
      x: 132,
      y: 258,
      r: 17,
      t: "PR"
    }, {
      x: 376,
      y: 296,
      r: 14,
      t: "NE"
    }, {
      x: 236,
      y: 312,
      r: 11,
      t: "AX"
    }].map((n, i) => React.createElement("g", {
      key: i,
      style: {
        cursor: "pointer"
      }
    }, i > 0 && React.createElement("line", {
      x1: "320",
      y1: "168",
      x2: n.x,
      y2: n.y,
      stroke: "rgba(12,138,66,0.22)",
      strokeDasharray: "2 5"
    }), n.main ? React.createElement("circle", {
      cx: n.x,
      cy: n.y,
      r: n.r + 10,
      fill: "none",
      stroke: "rgba(56,224,123,0.5)"
    }, React.createElement("animate", {
      attributeName: "r",
      values: `${n.r + 6};${n.r + 14};${n.r + 6}`,
      dur: "2.6s",
      repeatCount: "indefinite"
    }), React.createElement("animate", {
      attributeName: "stroke-opacity",
      values: "0.6;0.1;0.6",
      dur: "2.6s",
      repeatCount: "indefinite"
    })) : null, React.createElement("circle", {
      cx: n.x,
      cy: n.y,
      r: n.r,
      fill: LT.acid,
      stroke: "rgba(13,16,12,0.15)"
    }), React.createElement("text", {
      x: n.x,
      y: n.y + 3.5,
      textAnchor: "middle",
      fontFamily: "JetBrains Mono",
      fontSize: n.r > 30 ? 11 : 8.5,
      fontWeight: "700",
      fill: "#06210f"
    }, n.t)))), React.createElement("div", {
      style: {
        position: "absolute",
        left: 16,
        bottom: 12,
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: LT.ink3
      }
    }, "size = mcap \xB7 pulse = volume \xB7 threads = shared hooks")), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 80px 64px 72px",
        gap: 8,
        padding: "9px 18px",
        borderBottom: `1px solid ${LT.line}`,
        fontFamily: LT.mono,
        fontSize: 9,
        color: LT.ink3,
        letterSpacing: "0.14em"
      }
    }, React.createElement("span", null, "TOKEN"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "PRICE"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "24H"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "7D")), LND_TOKENS.slice(0, 6).map((t, i) => React.createElement("div", {
      key: t.s,
      className: "lnd-row",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 80px 64px 72px",
        gap: 8,
        padding: "10px 18px",
        borderBottom: `1px solid ${LT.line}`,
        alignItems: "center",
        cursor: "pointer"
      }
    }, React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: LT.ink
      }
    }, React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        background: "linear-gradient(135deg, #5af787, #2fb866)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 8,
        fontWeight: 700,
        color: "#06210f"
      }
    }, t.s.slice(0, 2)), "$", t.s), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 11.5,
        color: LT.ink
      }
    }, t.p), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 11,
        color: t.ch >= 0 ? LT.acidInk : LT.loss
      }
    }, t.ch >= 0 ? "+" : "", t.ch, "%"), React.createElement("span", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, React.createElement(LSpark, {
      pts: lndSpark(i + 2, t.ch >= 0),
      w: 58,
      h: 16,
      color: t.ch >= 0 ? LT.acidInk : LT.loss
    })))), React.createElement("div", {
      style: {
        marginTop: "auto",
        padding: "11px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fafbf8"
      }
    }, React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3
      }
    }, "12,840 tokens indexed"), React.createElement("span", {
      onClick: lopen(HL.app),
      style: {
        fontSize: 12.5,
        fontWeight: 600,
        color: LT.acidInk,
        cursor: "pointer"
      }
    }, "Open full app \u2192")))))), React.createElement(Reveal, {
      delay: 120
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        border: `1px solid ${LT.line2}`,
        borderRadius: 14,
        background: "#fff",
        margin: "18px 0 0",
        overflow: "hidden"
      }
    }, [{
      k: "Total volume",
      v: 48.2,
      pre: "$",
      suf: "M",
      dec: 1,
      sp: lndSpark(3, true)
    }, {
      k: "Tokens launched",
      v: 12840,
      pre: "",
      suf: "",
      dec: 0,
      sp: lndSpark(5, true)
    }, {
      k: "Hooks active",
      v: 142,
      pre: "",
      suf: "",
      dec: 0,
      sp: lndSpark(7, true)
    }, {
      k: "Protocol fees",
      v: 1.84,
      pre: "$",
      suf: "M",
      dec: 2,
      sp: lndSpark(9, true)
    }].map((s, i) => React.createElement("div", {
      key: s.k,
      style: {
        padding: "18px 24px",
        borderLeft: i ? `1px solid ${LT.line}` : "none",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: LT.ink3,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        marginBottom: 6
      }
    }, s.k), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 23,
        fontWeight: 700,
        color: LT.ink
      }
    }, React.createElement(Counter, {
      to: s.v,
      prefix: s.pre,
      suffix: s.suf,
      decimals: s.dec
    }))), React.createElement(LSpark, {
      pts: s.sp,
      w: 74,
      h: 24
    })))))));
  }
  function LaunchOnX() {
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 56,
        alignItems: "center"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, {
      color: LT.acidInk
    }, "New \xB7 @hookosbot"), React.createElement(H2, null, "Tweet a token.", React.createElement("br", null), "Deployed in seconds."), React.createElement("p", {
      style: {
        fontSize: 16,
        color: LT.ink2,
        lineHeight: 1.6,
        maxWidth: 460,
        margin: "0 0 24px"
      }
    }, "Reply to any tweet with a deploy command. The bot mints the token, seeds liquidity, installs your hooks, and replies with the receipt \u2014 all on-chain, no app needed."), React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center"
      }
    }, React.createElement("button", {
      className: "lnd-btn",
      onClick: lopen(HL.bot)
    }, "Try it now"), React.createElement("a", {
      href: HL.bot,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain",
      style: {
        fontFamily: LT.mono,
        fontSize: 13,
        color: LT.acidInk,
        fontWeight: 600
      }
    }, "@hookosbot \u2192"))), React.createElement(Reveal, {
      delay: 140
    }, React.createElement("div", {
      style: {
        position: "relative"
      }
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 22,
        maxWidth: 430
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 12
      }
    }, React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        borderRadius: 99,
        background: LT.acid,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 11,
        fontWeight: 700,
        color: "#06210f"
      }
    }, "0x"), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.ink
      }
    }, "anyone"), React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LT.ink3
      }
    }, "@anyone \xB7 now"))), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 14.5,
        lineHeight: 1.6
      }
    }, React.createElement("span", {
      style: {
        color: LT.acidInk,
        fontWeight: 600
      }
    }, "@hookosbot"), " ", React.createElement("span", {
      style: {
        color: LT.ink
      }
    }, "deploy $MOON"), React.createElement("br", null), React.createElement("span", {
      style: {
        color: LT.ink2
      }
    }, "1B supply \xB7 anti-bot"))), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        padding: "8px 0",
        maxWidth: 430
      }
    }, React.createElement("span", {
      style: {
        color: LT.acidInk,
        fontSize: 18
      }
    }, "\u2193")), React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 18,
        maxWidth: 430,
        border: `1.5px solid rgba(56,224,123,0.5)`,
        boxShadow: "0 18px 44px -18px rgba(12,138,66,0.35)",
        display: "flex",
        alignItems: "center",
        gap: 13
      }
    }, React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        background: "linear-gradient(135deg, #5af787, #2fb866)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 12,
        fontWeight: 700,
        color: "#06210f"
      }
    }, "MO"), React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: LT.ink
      }
    }, "$MOON deployed"), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color: LT.acidInk
      }
    }, "\u25CF live \xB7 moon.hookos.fun")), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3
      }
    }, "4.2s"))))));
  }
  function HowItWorks() {
    const prims = [{
      t: "Map",
      d: "A living force-graph of every market. Size is mcap, pulse is volume, threads are shared hooks. Discovery you can feel.",
      icon: "◈",
      cta: "Explore Map"
    }, {
      t: "Receipt",
      d: "Every launch prints an on-chain receipt — supply, hooks, curve, fees. Verifiable, shareable, collectible.",
      icon: "🧾",
      cta: "See a launch"
    }, {
      t: "Hooks",
      d: "Programs that run inside your AMM. Install from the store or build your own — they fire on every swap.",
      icon: "◆",
      cta: "Browse Hooks"
    }];
    return React.createElement("section", {
      id: "features",
      style: {
        padding: "84px 40px 0",
        scrollMarginTop: 72
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "How it works"), React.createElement(H2, null, "Three primitives. One operating system.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginTop: 28
      }
    }, prims.map((p, i) => React.createElement(Reveal, {
      key: p.t,
      delay: i * 110
    }, React.createElement("div", {
      className: "lnd-card lnd-lift",
      style: {
        padding: 28,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 26,
        marginBottom: 18,
        color: LT.acidInk
      }
    }, p.icon), React.createElement("div", {
      style: {
        fontSize: 21,
        fontWeight: 700,
        color: LT.ink,
        marginBottom: 10
      }
    }, p.t), React.createElement("p", {
      style: {
        fontSize: 14.5,
        color: LT.ink2,
        lineHeight: 1.6,
        margin: "0 0 18px"
      }
    }, p.d), React.createElement("span", {
      onClick: lopen(HL.app),
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        cursor: "pointer"
      }
    }, p.cta, " \u2192")))))));
  }
  function SixWeapons() {
    const weapons = [{
      t: "MEV Shield",
      d: "Block sandwich attacks at the pool level.",
      cta: "Install Hook",
      icon: "🛡"
    }, {
      t: "Reflexive Burn",
      d: "Supply shrinks when price falls.",
      cta: "Install Hook",
      icon: "🔥"
    }, {
      t: "PvP Arena",
      d: "Bet on the next candle. Winner takes the pot.",
      cta: "Enter Arena",
      icon: "⚔"
    }, {
      t: "AI Hook Studio",
      d: "Describe → generate → deploy custom hooks.",
      cta: "Build a Hook",
      icon: "✦"
    }, {
      t: "Market Map",
      d: "Force-directed token universe, live.",
      cta: "Explore Map",
      icon: "◈"
    }, {
      t: "Battle Pass",
      d: "Trade. Rank up. Get paid.",
      cta: "View Season",
      icon: "▲"
    }];
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Capabilities"), React.createElement(H2, null, "Six weapons. One terminal.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginTop: 28
      }
    }, weapons.map((w, i) => React.createElement(Reveal, {
      key: w.t,
      delay: i % 3 * 110
    }, React.createElement("div", {
      className: "lnd-card lnd-lift",
      style: {
        padding: 26,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, React.createElement("span", {
      style: {
        width: 40,
        height: 40,
        borderRadius: 11,
        background: LT.acidBg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 17
      }
    }, w.icon), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: LT.ink3
      }
    }, "0", i + 1)), React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 700,
        color: LT.ink
      }
    }, w.t), React.createElement("p", {
      style: {
        fontSize: 13.5,
        color: LT.ink2,
        lineHeight: 1.55,
        margin: 0,
        flex: 1
      }
    }, w.d), React.createElement("button", {
      className: "lnd-btn-ghost",
      style: {
        alignSelf: "flex-start",
        padding: "8px 15px",
        fontSize: 12.5
      },
      onClick: lopen(HL.app)
    }, w.cta)))))));
  }
  Object.assign(window, {
    LT,
    HL,
    lopen,
    LND_TOKENS,
    lndSpark,
    LSpark,
    LHex,
    Reveal,
    Counter,
    Kicker,
    H2,
    LTopbar,
    LTicker,
    LndHero,
    LaunchOnX,
    HowItWorks,
    SixWeapons
  });
  function ProtocolPulse() {
    const volBars = [4, 6, 5, 8, 7, 9, 8, 11, 10, 13, 12, 15, 14, 17];
    const topHooks = [{
      n: "MEV Shield",
      v: 4218
    }, {
      n: "Reflexive Burn",
      v: 3184
    }, {
      n: "Sniper Cage",
      v: 2841
    }, {
      n: "Loyalty Multiplier",
      v: 1922
    }, {
      n: "AI Fee Tuner",
      v: 1484
    }];
    const maxH = topHooks[0].v;
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Protocol pulse"), React.createElement(H2, null, "The numbers.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginTop: 28
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 24,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16
      }
    }, React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.16em"
      }
    }, "VOLUME \xB7 14D"), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 12,
        fontWeight: 700,
        color: LT.acidInk
      }
    }, "$48.2M")), React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        alignItems: "flex-end",
        height: 110
      }
    }, volBars.map((v, i) => React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        height: `${v / 17 * 100}%`,
        background: i === volBars.length - 1 ? LT.acidInk : LT.acid,
        opacity: i === volBars.length - 1 ? 1 : 0.35 + v / 34,
        borderRadius: 3
      }
    }))))), React.createElement(Reveal, {
      delay: 110
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 24,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16
      }
    }, React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.16em"
      }
    }, "REVENUE \xB7 30D"), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 12,
        fontWeight: 700,
        color: LT.acidInk
      }
    }, "$1.84M")), React.createElement(LSpark, {
      pts: lndSpark(11, true).concat(lndSpark(13, true)),
      w: 340,
      h: 110,
      sw: 2
    }))), React.createElement(Reveal, {
      delay: 220
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 24,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.16em",
        marginBottom: 16
      }
    }, "TOP HOOKS \xB7 INSTALLS"), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 11
      }
    }, topHooks.map(h => React.createElement("div", {
      key: h.n
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        marginBottom: 4
      }
    }, React.createElement("span", {
      style: {
        fontWeight: 600,
        color: LT.ink
      }
    }, h.n), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        color: LT.ink3
      }
    }, h.v.toLocaleString())), React.createElement("div", {
      style: {
        height: 5,
        borderRadius: 99,
        background: "rgba(13,16,12,0.05)"
      }
    }, React.createElement("div", {
      style: {
        width: `${h.v / maxH * 100}%`,
        height: "100%",
        borderRadius: 99,
        background: LT.acid
      }
    }))))))))));
  }
  function RevenueSplits() {
    const splits = [{
      n: "HOOK Stakers",
      p: 40
    }, {
      n: "Liquidity",
      p: 20
    }, {
      n: "Hook Creators",
      p: 15
    }, {
      n: "Treasury",
      p: 15
    }, {
      n: "Platform",
      p: 10
    }];
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Fee routing"), React.createElement(H2, null, "On-chain revenue splits.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 14,
        marginTop: 28
      }
    }, splits.map((s, i) => React.createElement(Reveal, {
      key: s.n,
      delay: i * 90
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 22
      }
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 32,
        fontWeight: 700,
        color: i === 0 ? LT.acidInk : LT.ink
      }
    }, s.p, "%"), React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: LT.ink2,
        margin: "6px 0 14px"
      }
    }, s.n), React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 99,
        background: "rgba(13,16,12,0.05)",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "lnd-fill",
      style: {
        width: `${s.p * 2.2}%`,
        height: "100%",
        borderRadius: 99,
        background: i === 0 ? LT.acidInk : LT.acid
      }
    }))))))));
  }
  function Gamification() {
    const ring = 2 * Math.PI * 30;
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Growth economy"), React.createElement(H2, null, "Trade. Rank up. Get paid.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginTop: 28
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 26,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 22
      }
    }, React.createElement("div", {
      style: {
        position: "relative",
        width: 72,
        height: 72,
        flexShrink: 0
      }
    }, React.createElement("svg", {
      width: "72",
      height: "72",
      viewBox: "0 0 72 72",
      style: {
        transform: "rotate(-90deg)"
      }
    }, React.createElement("circle", {
      cx: "36",
      cy: "36",
      r: "30",
      fill: "none",
      stroke: "rgba(13,16,12,0.07)",
      strokeWidth: "5"
    }), React.createElement("circle", {
      cx: "36",
      cy: "36",
      r: "30",
      fill: "none",
      stroke: LT.acidInk,
      strokeWidth: "5",
      strokeLinecap: "round",
      strokeDasharray: ring,
      strokeDashoffset: ring * 0.3
    })), React.createElement("span", {
      style: {
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        fontFamily: LT.mono,
        fontSize: 20,
        fontWeight: 700,
        color: LT.ink
      }
    }, "24")), React.createElement("div", {
      style: {
        flex: 1
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 7
      }
    }, React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: LT.ink
      }
    }, "Season 4 Pass"), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color: LT.ink3
      }
    }, "8,420 / 12,000 XP")), React.createElement("div", {
      style: {
        height: 8,
        borderRadius: 99,
        background: "rgba(13,16,12,0.05)",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "lnd-fill",
      style: {
        width: "70%",
        height: "100%",
        borderRadius: 99,
        background: `linear-gradient(90deg, ${LT.acid}, ${LT.acidInk})`
      }
    })))), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginBottom: 20
      }
    }, ["T24 · Fee rebate", "T25 · Map aura", "T26 · 🔒 Pro"].map((t, i) => React.createElement("span", {
      key: t,
      style: {
        fontFamily: LT.mono,
        fontSize: 10.5,
        padding: "6px 11px",
        borderRadius: 8,
        border: `1px solid ${i === 0 ? "rgba(56,224,123,0.5)" : LT.line2}`,
        background: i === 0 ? LT.acidBg : "#fff",
        color: i === 0 ? LT.acidInk : LT.ink3
      }
    }, t))), React.createElement("span", {
      onClick: lopen(HL.app),
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        cursor: "pointer"
      }
    }, "View Season Pass \u2192"))), React.createElement(Reveal, {
      delay: 130
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 26,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
      }
    }, React.createElement("span", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: LT.ink
      }
    }, "Daily quests"), React.createElement("div", {
      style: {
        display: "flex",
        gap: 4
      }
    }, [1, 1, 1, 1, 0, 0, 0].map((f, i) => React.createElement("span", {
      key: i,
      style: {
        width: 14,
        height: 14,
        borderRadius: 4,
        background: f ? LT.acid : "rgba(13,16,12,0.06)",
        border: `1px solid ${f ? "transparent" : LT.line2}`
      }
    })), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        marginLeft: 6
      }
    }, "4d streak"))), [{
      q: "Make a trade on any curve token",
      xp: 250,
      done: true
    }, {
      q: "Install a hook on your token",
      xp: 400,
      done: false
    }, {
      q: "Win an arena wager",
      xp: 600,
      done: false
    }].map((q, i) => React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderTop: i ? `1px solid ${LT.line}` : "none"
      }
    }, React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        borderRadius: 6,
        flexShrink: 0,
        background: q.done ? LT.acidInk : "#fff",
        border: `1.5px solid ${q.done ? LT.acidInk : LT.line2}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 10
      }
    }, q.done ? "✓" : ""), React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 13.5,
        color: q.done ? LT.ink3 : LT.ink,
        textDecoration: q.done ? "line-through" : "none"
      }
    }, q.q), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        fontWeight: 700,
        color: LT.acidInk
      }
    }, "+", q.xp, " XP"))), React.createElement("span", {
      onClick: lopen(HL.app),
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        cursor: "pointer",
        display: "inline-block",
        marginTop: 12
      }
    }, "View All Quests \u2192"))))));
  }
  function WalletOS() {
    const feats = [{
      t: "Smart Wallets",
      d: "ERC-4337 accounts, gasless onboarding"
    }, {
      t: "Extensions",
      d: "5 plugins: limits, alerts, auto-buy, vesting, guard"
    }, {
      t: "Auto-Split Revenue",
      d: "Route earnings to N wallets on-chain"
    }, {
      t: "Donation Automation",
      d: "Pledge % of fees to any address"
    }, {
      t: "Multi-wallet",
      d: "One identity, many addresses"
    }];
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "0.9fr 1.1fr",
        gap: 56,
        alignItems: "center"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, {
      color: LT.acidInk
    }, "New \xB7 Wallet OS"), React.createElement(H2, null, "Every wallet is a revenue engine."), React.createElement("p", {
      style: {
        fontSize: 16,
        color: LT.ink2,
        lineHeight: 1.6,
        maxWidth: 420,
        margin: "0 0 24px"
      }
    }, "Smart accounts with programmable money flows \u2014 your trading, creator earnings, and donations route themselves."), React.createElement("button", {
      className: "lnd-btn",
      onClick: lopen(HL.ios)
    }, "Create Smart Wallet")), React.createElement(Reveal, {
      delay: 130
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
      }
    }, feats.map((f, i) => React.createElement("div", {
      key: f.t,
      className: "lnd-card lnd-lift",
      style: {
        padding: 20,
        gridColumn: i === 4 ? "span 2" : "auto"
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14.5,
        fontWeight: 700,
        color: LT.ink,
        marginBottom: 5
      }
    }, f.t), React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: LT.ink2,
        lineHeight: 1.5
      }
    }, f.d)))))));
  }
  function CreatorEconomy() {
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: "44px 48px",
        background: "linear-gradient(135deg, #ffffff, #f2f8f1)"
      }
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 56,
        alignItems: "center"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, {
      color: LT.acidInk
    }, "Creator economy"), React.createElement(H2, null, "Build hooks. Earn forever."), React.createElement("p", {
      style: {
        fontSize: 16,
        color: LT.ink2,
        lineHeight: 1.6,
        maxWidth: 440,
        margin: "0 0 22px"
      }
    }, "Publish to the hook marketplace with license NFTs. Every install, every swap through your hook \u2014 you get paid, on-chain, automatically."), React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 22,
        marginBottom: 26
      }
    }, React.createElement("div", null, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 38,
        fontWeight: 700,
        color: LT.acidInk
      }
    }, "70/30"), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.14em"
      }
    }, "CREATOR SPLIT")), React.createElement("div", {
      style: {
        width: 1,
        height: 44,
        background: LT.line2
      }
    }), React.createElement("div", null, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 38,
        fontWeight: 700,
        color: LT.ink
      }
    }, "142"), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.14em"
      }
    }, "HOOKS LISTED"))), React.createElement("button", {
      className: "lnd-btn",
      onClick: lopen(HL.app)
    }, "Start Building")), React.createElement(Reveal, {
      delay: 130
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 0
      }
    }, [{
      t: "Build",
      d: "AI Studio or Solidity SDK",
      icon: "✦"
    }, {
      t: "Deploy",
      d: "Audited registry, one tx",
      icon: "◆"
    }, {
      t: "Earn",
      d: "Per-install + per-swap fees",
      icon: "$"
    }].map((s, i) => React.createElement(React.Fragment, {
      key: s.t
    }, i > 0 && React.createElement("span", {
      style: {
        color: LT.acidInk,
        fontSize: 18,
        padding: "0 10px"
      }
    }, "\u2192"), React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: "20px 18px",
        flex: 1,
        textAlign: "center"
      }
    }, React.createElement("span", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        background: LT.acidBg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        marginBottom: 10,
        color: LT.acidInk,
        fontWeight: 700
      }
    }, s.icon), React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: LT.ink
      }
    }, s.t), React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LT.ink3,
        marginTop: 4
      }
    }, s.d))))))))));
  }
  function ChainLogo({
    chain
  }) {
    const [err, setErr] = React.useState(false);
    if (!err && chain.img) {
      return React.createElement("img", {
        src: chain.img,
        alt: chain.n,
        width: "24",
        height: "24",
        onError: () => setErr(true),
        style: {
          width: 24,
          height: 24,
          borderRadius: 99,
          objectFit: "cover",
          filter: chain.live ? "none" : "grayscale(0.25)",
          opacity: chain.live ? 1 : 0.88
        }
      });
    }
    return React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 99,
        background: chain.c,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 9.5,
        fontWeight: 700,
        color: chain.fg || "#fff"
      }
    }, chain.n.slice(0, 2));
  }
  function MultiChain() {
    const chains = [{
      n: "Base",
      live: true,
      img: "assets/chains/base.jpg",
      c: "#0052ff"
    }, {
      n: "Ethereum",
      img: "assets/chains/ethereum.jpg",
      c: "#627eea"
    }, {
      n: "Unichain",
      img: "assets/chains/unichain.jpg",
      c: "#f50db4"
    }, {
      n: "Arbitrum",
      img: "assets/chains/arbitrum.jpg",
      c: "#28a0f0"
    }, {
      n: "BNB",
      img: "assets/chains/binance.jpg",
      c: "#f0b90b",
      fg: "#1a1500"
    }, {
      n: "HyperEVM",
      img: "assets/chains/hyperliquid.jpg",
      c: "#97fce4",
      fg: "#04312a"
    }, {
      n: "MegaETH",
      img: "assets/chains/megaeth.jpg",
      c: "#1a1a1a"
    }, {
      n: "Ink",
      img: "assets/chains/ink.jpg",
      c: "#7132f5"
    }, {
      n: "X Layer",
      img: "assets/chains/xlayer.jpg",
      c: "#0d100c"
    }];
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        textAlign: "center"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Multi-chain"), React.createElement(H2, null, "9 chains. One protocol."), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 30
      }
    }, chains.map((c, i) => React.createElement("div", {
      key: c.n,
      className: "lnd-card lnd-lift",
      style: {
        padding: "13px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: c.live ? "1.5px solid rgba(56,224,123,0.55)" : undefined
      }
    }, React.createElement(ChainLogo, {
      chain: c
    }), React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: c.live ? LT.ink : LT.ink2
      }
    }, c.n), c.live ? React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9,
        fontWeight: 700,
        color: LT.acidInk,
        background: LT.acidBg,
        padding: "3px 7px",
        borderRadius: 5,
        letterSpacing: "0.1em"
      }
    }, "LIVE") : React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9,
        color: LT.ink3,
        border: `1px solid ${LT.line2}`,
        padding: "3px 7px",
        borderRadius: 5,
        letterSpacing: "0.1em"
      }
    }, "SOON")))))));
  }
  function TrendingTokens() {
    return React.createElement("section", {
      style: {
        padding: "84px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 24
      }
    }, React.createElement("div", null, React.createElement(Kicker, null, "Markets"), React.createElement(H2, null, "Trending now.")), React.createElement("span", {
      onClick: lopen(HL.app),
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        cursor: "pointer",
        paddingBottom: 8
      }
    }, "All 12,840 tokens \u2192"))), React.createElement(Reveal, {
      delay: 100
    }, React.createElement("div", {
      className: "lnd-card lnd-tscroll",
      style: {
        padding: 0
      }
    }, React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "44px 1.5fr 110px 90px 110px 110px 1fr 90px",
        gap: 12,
        padding: "11px 22px",
        borderBottom: `1px solid ${LT.line}`,
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: LT.ink3,
        letterSpacing: "0.14em"
      }
    }, React.createElement("span", null, "#"), React.createElement("span", null, "TOKEN"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "PRICE"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "24H"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "MCAP"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "VOLUME"), React.createElement("span", null, "CURVE"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "7D")), LND_TOKENS.map((t, i) => React.createElement("div", {
      key: t.s,
      className: "lnd-row",
      style: {
        display: "grid",
        gridTemplateColumns: "44px 1.5fr 110px 90px 110px 110px 1fr 90px",
        gap: 12,
        padding: "13px 22px",
        borderBottom: i < 9 ? `1px solid ${LT.line}` : "none",
        alignItems: "center",
        cursor: "pointer"
      }
    }, React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11.5,
        color: i < 3 ? LT.gold : LT.ink3,
        fontWeight: i < 3 ? 700 : 400
      }
    }, i + 1), React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 8,
        background: "linear-gradient(135deg, #5af787, #2fb866)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 9,
        fontWeight: 700,
        color: "#06210f"
      }
    }, t.s.slice(0, 2)), React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: LT.ink
      }
    }, "$", t.s), React.createElement("span", {
      style: {
        fontSize: 12,
        color: LT.ink3
      }
    }, t.n)), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 12.5,
        color: LT.ink
      }
    }, t.p), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 12,
        color: t.ch >= 0 ? LT.acidInk : LT.loss
      }
    }, t.ch >= 0 ? "+" : "", t.ch, "%"), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 12,
        color: LT.ink2
      }
    }, t.mc), React.createElement("span", {
      style: {
        textAlign: "right",
        fontFamily: LT.mono,
        fontSize: 12,
        color: LT.ink2
      }
    }, t.vol), React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, React.createElement("span", {
      style: {
        flex: 1,
        height: 5,
        borderRadius: 99,
        background: "rgba(13,16,12,0.05)",
        overflow: "hidden"
      }
    }, React.createElement("span", {
      style: {
        display: "block",
        width: `${t.curve}%`,
        height: "100%",
        borderRadius: 99,
        background: t.curve === 100 ? LT.gold : LT.acid
      }
    })), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: t.curve === 100 ? LT.gold : LT.ink3,
        minWidth: 38
      }
    }, t.curve === 100 ? "GRAD" : `${t.curve}%`)), React.createElement("span", {
      style: {
        display: "flex",
        justifyContent: "flex-end"
      }
    }, React.createElement(LSpark, {
      pts: lndSpark(i + 4, t.ch >= 0),
      w: 66,
      h: 20,
      color: t.ch >= 0 ? LT.acidInk : LT.loss
    }))))))));
  }
  function BottomCTA() {
    return React.createElement("section", {
      style: {
        padding: "100px 40px"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        textAlign: "center"
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        marginBottom: 26
      }
    }, React.createElement(LHex, {
      size: 56
    })), React.createElement("h2", {
      style: {
        fontSize: 56,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        lineHeight: 1.04,
        margin: "0 0 16px",
        color: LT.ink
      }
    }, "Stop launching tokens.", React.createElement("br", null), React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "Start launching markets.")), React.createElement("p", {
      style: {
        fontSize: 16.5,
        color: LT.ink2,
        margin: "0 0 30px"
      }
    }, "Deploy in 60 seconds \u2014 from the app or a single tweet."), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        gap: 12
      }
    }, React.createElement("button", {
      className: "lnd-btn",
      style: {
        padding: "15px 28px",
        fontSize: 15.5
      },
      onClick: lopen(HL.ios)
    }, "\uD83D\uDE80 Get the App"), React.createElement("button", {
      className: "lnd-btn-ghost",
      style: {
        padding: "15px 28px",
        fontSize: 15.5
      },
      onClick: lopen(HL.app)
    }, "Explore Hooks"), React.createElement("button", {
      className: "lnd-btn-ghost",
      style: {
        padding: "15px 28px",
        fontSize: 15.5
      },
      onClick: lopen(HL.tg)
    }, "Join Community")))));
  }
  function LFooter() {
    const cols = [{
      h: "Protocol",
      l: [["Tokens", HL.app], ["Hooks", HL.app], ["Arena", HL.app], ["Terminal", HL.app], ["Launch", HL.app], ["Market Map", HL.app]]
    }, {
      h: "Economy",
      l: [["Battle Pass", HL.app], ["Quests", HL.app], ["Clans", HL.app], ["Launch Wars", HL.app], ["Staking", HL.app], ["Governance", HL.app]]
    }, {
      h: "Build",
      l: [["AI Hook Studio", HL.app], ["Creator Hub", HL.app], ["Marketplace", HL.app], ["Docs", HL.app], ["Status", HL.app], ["Get the App", HL.ios]]
    }, {
      h: "Community",
      l: [["X @hookosfun", HL.x], ["Bot @hookosbot", HL.bot], ["Telegram", HL.tg], ["hookos.fun", HL.app], ["Wallet site", HL.wallet], ["Brand Kit", HL.app]]
    }];
    const socials = [["𝕏", HL.x], ["✈", HL.tg], ["◆", HL.app]];
    return React.createElement("footer", {
      style: {
        borderTop: `1px solid ${LT.line}`,
        background: "#fff",
        padding: "52px 40px 36px"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1.4fr repeat(4, 1fr)",
        gap: 36
      }
    }, React.createElement("div", null, React.createElement("a", {
      href: HL.wallet,
      className: "lnd-plain",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 14
      }
    }, React.createElement(LHex, {
      size: 28
    }), React.createElement("span", {
      style: {
        fontWeight: 700,
        fontSize: 17,
        color: LT.ink
      }
    }, "Hook", React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "OS"), " Wallet")), React.createElement("p", {
      style: {
        fontSize: 13,
        color: LT.ink3,
        lineHeight: 1.6,
        maxWidth: 240,
        margin: "0 0 18px"
      }
    }, "The native client for the HookOS ecosystem. Markets are now software."), React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, socials.map(([s, href], i) => React.createElement("a", {
      key: i,
      href: href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain",
      style: {
        width: 32,
        height: 32,
        borderRadius: 9,
        border: `1px solid ${LT.line2}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        color: LT.ink2,
        cursor: "pointer"
      }
    }, s)))), cols.map(c => React.createElement("div", {
      key: c.h
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10,
        color: LT.ink3,
        letterSpacing: "0.18em",
        marginBottom: 14
      }
    }, c.h.toUpperCase()), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, c.l.map(([label, href]) => React.createElement("a", {
      key: label,
      href: href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain lnd-navlink",
      style: {
        fontSize: 13
      }
    }, label)))))), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 44,
        paddingTop: 22,
        borderTop: `1px solid ${LT.line}`
      }
    }, React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color: LT.ink3
      }
    }, "\xA9 2026 HOOKOS LABS \xB7 hookos.fun"), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color: LT.acidInk,
        display: "flex",
        alignItems: "center",
        gap: 7
      }
    }, React.createElement(LHex, {
      size: 14,
      sw: 4
    }), " POWERED BY HookOS"))));
  }
  Object.assign(window, {
    ProtocolPulse,
    RevenueSplits,
    Gamification,
    WalletOS,
    CreatorEconomy,
    MultiChain,
    TrendingTokens,
    BottomCTA,
    LFooter
  });
  function LandingPage() {
    return React.createElement("div", {
      "data-screen-label": "HookOS Wallet"
    }, React.createElement(LTopbar, null), React.createElement(LTicker, null), React.createElement(LndHero, null), React.createElement(LaunchOnX, null), React.createElement(HowItWorks, null), React.createElement(SixWeapons, null), React.createElement(ProtocolPulse, null), React.createElement(RevenueSplits, null), React.createElement(Gamification, null), React.createElement(WalletOS, null), React.createElement(CreatorEconomy, null), React.createElement(MultiChain, null), React.createElement(TrendingTokens, null), React.createElement(BottomCTA, null), React.createElement(LFooter, null));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(LandingPage, null));
})();