(function () {
  const LT = {
    paper: "#f4f5f1",
    paper2: "#eaece5",
    card: "#ffffff",
    ink: "#0d100c",
    ink2: "#494c44",
    ink3: "#86887e",
    line: "rgba(13,16,12,0.09)",
    line2: "rgba(13,16,12,0.14)",
    acid: "#38e07b",
    acidBright: "#5af787",
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
    docs: "https://docs.hookos.fun",
    dev: "https://dev.hookos.fun",
    x: "https://x.com/hookosfun",
    bot: "https://x.com/hookosbot",
    tg: "https://t.me/hookos_alpha",
    ios: "https://hookos.fun",
    android: "https://hookos.fun"
  };
  const API = "https://api.hookos.fun";
  function lopen(u) {
    return function () {
      if (u) window.open(u, "_blank", "noopener,noreferrer");
    };
  }
  function weiToEth(wei, dp) {
    const n = Number(wei || 0) / 1e18;
    if (!isFinite(n)) return "0";
    if (n === 0) return "0";
    if (n < 0.0001) return "<0.0001";
    return n.toFixed(dp == null ? 4 : dp);
  }
  function fmtInt(n) {
    return (Number(n) || 0).toLocaleString();
  }
  function shortAddr(a) {
    return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
  }
  function useApi(path) {
    const [state, setState] = React.useState({
      data: null,
      loading: true,
      error: false
    });
    React.useEffect(() => {
      let alive = true;
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 9000);
      fetch(`${API}${path}`, {
        signal: ctrl.signal
      }).then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(d => {
        if (alive) setState({
          data: d,
          loading: false,
          error: false
        });
      }).catch(() => {
        if (alive) setState({
          data: null,
          loading: false,
          error: true
        });
      }).finally(() => clearTimeout(to));
      return () => {
        alive = false;
        ctrl.abort();
        clearTimeout(to);
      };
    }, [path]);
    return state;
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
      const t1 = setTimeout(check, 320);
      const t2 = setTimeout(show, 2400);
      window.addEventListener("scroll", check, {
        passive: true
      });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("scroll", check);
        ob && ob.disconnect();
      };
    }, []);
    return React.createElement("div", {
      ref: ref,
      style: {
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateY(20px)",
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
          const t = Math.min(1, (now - t0) / 1200);
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
      const t1 = setTimeout(check, 360);
      const t2 = setTimeout(start, 2600);
      window.addEventListener("scroll", check, {
        passive: true
      });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener("scroll", check);
        ob && ob.disconnect();
      };
    }, [to]);
    return React.createElement("span", {
      ref: ref
    }, prefix, decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString(), suffix);
  }
  function Skeleton({
    w = "100%",
    h = 14,
    r = 6,
    style
  }) {
    return React.createElement("span", {
      className: "lnd-sk",
      style: {
        display: "inline-block",
        width: w,
        height: h,
        borderRadius: r,
        ...style
      }
    });
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
  function Btn({
    children,
    href,
    onClick,
    ghost,
    big
  }) {
    const cls = ghost ? "lnd-btn-ghost" : "lnd-btn";
    const st = {
      display: "inline-block",
      textDecoration: "none",
      ...(big ? {
        padding: "15px 28px",
        fontSize: 15.5
      } : null)
    };
    if (href && !onClick) {
      return React.createElement("a", {
        className: cls,
        style: st,
        href: href,
        target: "_blank",
        rel: "noopener noreferrer"
      }, children);
    }
    return React.createElement("button", {
      className: cls,
      style: st,
      onClick: onClick
    }, children);
  }
  function Topbar() {
    const nav = [["Wallet", "#wallet"], ["Live", "#live"], ["Hooks", "#hooks"], ["Docs", HL.docs], ["Community", HL.x]];
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
    }, "WALLET")), React.createElement("nav", {
      className: "lnd-nav",
      style: {
        display: "flex",
        gap: 19,
        marginLeft: "auto",
        fontSize: 13.5,
        color: LT.ink2,
        fontWeight: 500
      }
    }, nav.map(([l, h]) => React.createElement("a", {
      key: l,
      href: h,
      target: h.startsWith("#") ? undefined : "_blank",
      rel: h.startsWith("#") ? undefined : "noopener noreferrer",
      className: "lnd-plain lnd-navlink"
    }, l))), React.createElement("span", {
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
    }), "Base"), React.createElement("a", {
      className: "lnd-btn",
      style: {
        padding: "9px 18px",
        fontSize: 13.5,
        display: "inline-block",
        textDecoration: "none"
      },
      href: HL.ios,
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Get the App"));
  }
  function Hero() {
    const stats = useApi("/stats");
    const d = stats.data || {};
    const cells = [{
      k: "Tokens launched",
      v: d.totalTokens,
      dec: 0
    }, {
      k: "Hooks available",
      v: d.totalHooks,
      dec: 0
    }, {
      k: "Fees distributed",
      v: d.totalFeesDistributed ? Number(d.totalFeesDistributed) / 1e18 : 0,
      dec: 3,
      suf: " ETH"
    }, {
      k: "Season",
      v: d.currentSeason,
      dec: 0,
      pre: "S"
    }];
    return React.createElement("section", {
      style: {
        padding: "0 40px"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "72px 0 34px"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Self-custody wallet \xB7 native client for HookOS \xB7 live on Base"), React.createElement("h1", {
      style: {
        fontSize: 68,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        lineHeight: 1.0,
        margin: "0 auto",
        maxWidth: 900,
        color: LT.ink
      }
    }, "Your keys. Your markets.", React.createElement("br", null), React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "Markets are now software.")), React.createElement("p", {
      style: {
        fontSize: 18,
        color: LT.ink2,
        margin: "20px auto 0",
        maxWidth: 620,
        lineHeight: 1.55
      }
    }, "HookOS Wallet is the self-custody home for the HookOS ecosystem. Hold your own keys, then launch programmable tokens, install AMM hooks, wager in the arena, and go cross-chain \u2014 from one app."), React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        justifyContent: "center",
        marginTop: 28,
        flexWrap: "wrap"
      }
    }, React.createElement(Btn, {
      href: HL.ios
    }, "\uD83D\uDE80 Get the App"), React.createElement(Btn, {
      ghost: true,
      href: HL.app
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
      onClick: lopen(HL.docs)
    }, "Read the docs \u2192")))), React.createElement(Reveal, {
      delay: 100
    }, React.createElement("div", {
      id: "live",
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        border: `1px solid ${LT.line2}`,
        borderRadius: 16,
        background: "#fff",
        overflow: "hidden",
        scrollMarginTop: 80
      }
    }, cells.map((c, i) => React.createElement("div", {
      key: c.k,
      style: {
        padding: "22px 26px",
        borderLeft: i ? `1px solid ${LT.line}` : "none"
      }
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 9.5,
        color: LT.ink3,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        marginBottom: 8
      }
    }, c.k), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 26,
        fontWeight: 700,
        color: LT.ink
      }
    }, stats.loading ? React.createElement(Skeleton, {
      w: 72,
      h: 24
    }) : stats.error ? React.createElement("span", {
      style: {
        color: LT.ink3,
        fontSize: 18
      }
    }, "\u2014") : React.createElement(Counter, {
      to: Number(c.v) || 0,
      prefix: c.pre || "",
      suffix: c.suf || "",
      decimals: c.dec
    }))))), React.createElement("div", {
      style: {
        textAlign: "center",
        marginTop: 12,
        fontFamily: LT.mono,
        fontSize: 10.5,
        color: LT.ink3
      }
    }, stats.error ? "live indexer unavailable — numbers hidden" : stats.loading ? "loading live data…" : "● live from the HookOS indexer · Base mainnet"))));
  }
  function Features() {
    const groups = [{
      icon: "🔑",
      kicker: "Self-custody core",
      items: [["Your keys, always", "Non-custodial — the seed never leaves your device."], ["Smart Wallet OS", "ERC-4337 accounts, gasless onboarding, sponsored gas."], ["Multi-wallet identity", "Many addresses, one signing experience."], ["Hardware wallet", "Ledger support for cold-key signing."], ["Built-in swaps", "Best-route token swaps across chains."], ["Send, receive & NFTs", "Tokens and collectibles, with a dApp browser."]]
    }, {
      icon: "🚀",
      kicker: "Launch & trade",
      items: [["Token launcher", "Print a token on a bonding curve in a few taps."], ["Hook marketplace", "Install up to 8 AMM hooks per token."], ["Cross-chain bridge", "Move value across HookOS chains as they come online."], ["Staking", "Stake to earn a share of protocol fees."], ["Creator fees", "Collect swap/LP fees, routed on-chain automatically."], ["Hook licenses", "License NFTs that pay hook authors per use."]]
    }, {
      icon: "⚔",
      kicker: "Compete & earn",
      items: [["PvP Arena", "Wager on token price battles — no oracle."], ["Launch Wars", "Compete to top the launch leaderboard."], ["Battle Pass", "Seasonal XP with free and Pro tracks."], ["Daily Quests", "Challenges and streaks that pay XP."], ["Clans", "Shared treasuries and team leaderboards."], ["Reputation & events", "On-chain rep and live protocol events."]]
    }];
    return React.createElement("section", {
      id: "wallet",
      style: {
        padding: "92px 40px 0",
        scrollMarginTop: 72
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Everything in one wallet"), React.createElement(H2, null, "The whole protocol, in your pocket."), React.createElement("p", {
      style: {
        fontSize: 16.5,
        color: LT.ink2,
        lineHeight: 1.6,
        maxWidth: 640,
        margin: "0 0 8px"
      }
    }, "Most wallets stop at send and receive. HookOS Wallet is a self-custody client for a programmable market \u2014 launch, trade, hook, bridge, compete and earn, all signed on your device.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginTop: 28
      }
    }, groups.map((g, i) => React.createElement(Reveal, {
      key: g.kicker,
      delay: i % 3 * 90
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 26,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        marginBottom: 18
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
    }, g.icon), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10.5,
        color: LT.acidInk,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: 600
      }
    }, g.kicker)), React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, g.items.map(([t, d], j) => React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 11,
        padding: "12px 0",
        borderTop: j ? `1px solid ${LT.line}` : "none"
      }
    }, React.createElement("span", {
      style: {
        color: LT.acidInk,
        flexShrink: 0,
        marginTop: 1,
        fontSize: 13,
        fontWeight: 700
      }
    }, "\u2713"), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 14.5,
        fontWeight: 600,
        color: LT.ink
      }
    }, t), React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: LT.ink2,
        lineHeight: 1.5,
        marginTop: 2
      }
    }, d)))))))))));
  }
  function TokenGlyph({
    sym
  }) {
    return React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 9,
        background: "linear-gradient(135deg,#5af787,#2fb866)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 10,
        fontWeight: 700,
        color: "#06210f",
        flexShrink: 0
      }
    }, (sym || "?").slice(0, 2).toUpperCase());
  }
  function LiveTokens() {
    const q = useApi("/tokens");
    const rows = React.useMemo(() => {
      if (!Array.isArray(q.data)) return [];
      return q.data.slice().sort((a, b) => (Number(b.totalTrades) || 0) - (Number(a.totalTrades) || 0) || (Number(b.totalVolume) || 0) - (Number(a.totalVolume) || 0)).slice(0, 8);
    }, [q.data]);
    return React.createElement("section", {
      id: "live-tokens",
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-head",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 22
      }
    }, React.createElement("div", null, React.createElement(Kicker, null, "Live on Base"), React.createElement(H2, null, "Real tokens, launched on HookOS.")), React.createElement("a", {
      href: HL.app,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain",
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        paddingBottom: 8
      }
    }, "Trade in the app \u2192"))), React.createElement(Reveal, {
      delay: 90
    }, React.createElement("div", {
      className: "lnd-card lnd-tscroll",
      style: {
        padding: 0
      }
    }, React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "44px 1.6fr 90px 120px 1fr",
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
    }, "TRADES"), React.createElement("span", {
      style: {
        textAlign: "right"
      }
    }, "VOLUME"), React.createElement("span", null, "STATUS")), q.loading && [0, 1, 2, 3, 4].map(i => React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "44px 1.6fr 90px 120px 1fr",
        gap: 12,
        padding: "14px 22px",
        borderBottom: `1px solid ${LT.line}`,
        alignItems: "center"
      }
    }, React.createElement(Skeleton, {
      w: 14
    }), React.createElement(Skeleton, {
      w: 140
    }), React.createElement(Skeleton, {
      w: 40,
      style: {
        marginLeft: "auto"
      }
    }), React.createElement(Skeleton, {
      w: 70,
      style: {
        marginLeft: "auto"
      }
    }), React.createElement(Skeleton, {
      w: "100%"
    }))), !q.loading && rows.length === 0 && React.createElement("div", {
      style: {
        padding: "40px 22px",
        textAlign: "center",
        color: LT.ink3,
        fontSize: 14,
        minWidth: "auto"
      }
    }, q.error ? "Live token data is unavailable right now." : "No tokens indexed yet — be the first to launch."), !q.loading && rows.map((t, i) => {
      const status = t.graduated ? {
        t: "GRADUATED",
        c: LT.gold,
        bg: "rgba(199,146,18,0.12)"
      } : t.hasCurve ? {
        t: "ON CURVE",
        c: LT.acidInk,
        bg: LT.acidBg
      } : {
        t: "PRE-LAUNCH",
        c: LT.ink3,
        bg: "rgba(13,16,12,0.05)"
      };
      return React.createElement("a", {
        key: t.id || i,
        href: HL.app,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "lnd-row lnd-plain",
        style: {
          display: "grid",
          gridTemplateColumns: "44px 1.6fr 90px 120px 1fr",
          gap: 12,
          padding: "14px 22px",
          borderBottom: i < rows.length - 1 ? `1px solid ${LT.line}` : "none",
          alignItems: "center"
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
          gap: 10,
          minWidth: 0
        }
      }, React.createElement(TokenGlyph, {
        sym: t.symbol
      }), React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: LT.ink
        }
      }, "$", t.symbol), React.createElement("span", {
        style: {
          fontSize: 12,
          color: LT.ink3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }
      }, t.name)), React.createElement("span", {
        style: {
          textAlign: "right",
          fontFamily: LT.mono,
          fontSize: 12,
          color: LT.ink2
        }
      }, fmtInt(t.totalTrades)), React.createElement("span", {
        style: {
          textAlign: "right",
          fontFamily: LT.mono,
          fontSize: 12,
          color: LT.ink2
        }
      }, weiToEth(t.totalVolume, 3), " ETH"), React.createElement("span", null, React.createElement("span", {
        style: {
          fontFamily: LT.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          padding: "3px 8px",
          borderRadius: 5,
          color: status.c,
          background: status.bg
        }
      }, status.t)));
    })))));
  }
  function LiveHooks() {
    const q = useApi("/hooks");
    const rows = React.useMemo(() => {
      if (!Array.isArray(q.data)) return [];
      return q.data.slice().sort((a, b) => (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || (Number(b.installs) || 0) - (Number(a.installs) || 0)).slice(0, 8);
    }, [q.data]);
    return React.createElement("section", {
      id: "hooks",
      style: {
        padding: "92px 40px 0",
        scrollMarginTop: 72
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-head",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 22
      }
    }, React.createElement("div", null, React.createElement(Kicker, null, "Hook marketplace"), React.createElement(H2, null, "Programs that run inside your AMM.")), React.createElement("a", {
      href: HL.dev,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-plain",
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: LT.acidInk,
        paddingBottom: 8
      }
    }, "Build a hook \u2192"))), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 12
      }
    }, q.loading && [0, 1, 2, 3, 4, 5, 6, 7].map(i => React.createElement("div", {
      key: i,
      className: "lnd-card",
      style: {
        padding: 18
      }
    }, React.createElement(Skeleton, {
      w: 40,
      h: 40,
      r: 11,
      style: {
        marginBottom: 12
      }
    }), React.createElement(Skeleton, {
      w: "70%",
      h: 15
    }), React.createElement("div", {
      style: {
        height: 8
      }
    }), React.createElement(Skeleton, {
      w: "40%",
      h: 11
    }))), !q.loading && rows.length === 0 && React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: "36px",
        gridColumn: "1 / -1",
        textAlign: "center",
        color: LT.ink3,
        fontSize: 14
      }
    }, q.error ? "Live hook data is unavailable right now." : "No hooks published yet."), !q.loading && rows.map((h, i) => React.createElement(Reveal, {
      key: h.id || i
    }, React.createElement("a", {
      href: HL.app,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "lnd-card lnd-lift lnd-plain",
      style: {
        padding: 18,
        height: "100%",
        display: "block"
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12
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
        color: LT.acidInk,
        fontSize: 16,
        fontWeight: 700
      }
    }, "\u25C6"), h.verified ? React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 8.5,
        fontWeight: 700,
        color: LT.acidInk,
        background: LT.acidBg,
        padding: "3px 7px",
        borderRadius: 5,
        letterSpacing: "0.08em"
      }
    }, "VERIFIED") : null), React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: LT.ink,
        marginBottom: 5
      }
    }, h.name), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10.5,
        color: LT.ink3
      }
    }, fmtInt(h.installs), " installs \xB7 by ", shortAddr(h.author))))))));
  }
  function HowItWorks() {
    const steps = [{
      n: "01",
      t: "Get the wallet",
      d: "Download HookOS Wallet and create a self-custody smart account in seconds — no seed-phrase friction, gasless to start."
    }, {
      n: "02",
      t: "Launch or trade",
      d: "Print a token on a bonding curve, install hooks, or ape into live markets — all signed on your device."
    }, {
      n: "03",
      t: "Earn & rank up",
      d: "Collect creator fees, win arena wagers, complete quests and climb the Battle Pass — paid on-chain."
    }];
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "How it works"), React.createElement(H2, null, "From download to on-chain in minutes.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginTop: 28
      }
    }, steps.map((s, i) => React.createElement(Reveal, {
      key: s.n,
      delay: i * 100
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 28,
        height: "100%"
      }
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 13,
        color: LT.acidInk,
        fontWeight: 700,
        marginBottom: 14
      }
    }, s.n), React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 700,
        color: LT.ink,
        marginBottom: 10
      }
    }, s.t), React.createElement("p", {
      style: {
        fontSize: 14.5,
        color: LT.ink2,
        lineHeight: 1.6,
        margin: 0
      }
    }, s.d)))))));
  }
  function Economics() {
    const splits = [{
      n: "Creator / LP",
      p: 30,
      note: "of swap fees, perpetually"
    }, {
      n: "Protocol",
      p: 70,
      note: "routed to stakers, hook authors, treasury"
    }];
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: "44px 48px",
        background: "linear-gradient(135deg,#ffffff,#f2f8f1)"
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
    }, "On-chain economics"), React.createElement(H2, null, "Fair by default. Verifiable forever."), React.createElement("p", {
      style: {
        fontSize: 16,
        color: LT.ink2,
        lineHeight: 1.6,
        maxWidth: 440,
        margin: "0 0 22px"
      }
    }, "100% of every token's supply starts in the bonding curve \u2014 creators get no pre-mine. At graduation (~$55k) liquidity locks permanently in a Uniswap v4 pool. Fees split on-chain, automatically."), React.createElement(Btn, {
      href: HL.docs
    }, "Read the economics")), React.createElement(Reveal, {
      delay: 120
    }, React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 16
      }
    }, splits.map((s, i) => React.createElement("div", {
      key: s.n
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 6
      }
    }, React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: LT.ink
      }
    }, s.n), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 22,
        fontWeight: 700,
        color: i === 0 ? LT.acidInk : LT.ink
      }
    }, s.p, "%")), React.createElement("div", {
      style: {
        height: 8,
        borderRadius: 99,
        background: "rgba(13,16,12,0.05)",
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "lnd-fill",
      style: {
        width: `${s.p}%`,
        height: "100%",
        borderRadius: 99,
        background: i === 0 ? LT.acidInk : LT.acid
      }
    })), React.createElement("div", {
      style: {
        fontSize: 12,
        color: LT.ink3,
        marginTop: 5
      }
    }, s.note)))))))));
  }
  function ChainLogo({
    c
  }) {
    const [err, setErr] = React.useState(false);
    if (!err) return React.createElement("img", {
      src: `assets/chains/${c.k}.jpg`,
      alt: c.n,
      width: "24",
      height: "24",
      onError: () => setErr(true),
      style: {
        width: 24,
        height: 24,
        borderRadius: 99,
        objectFit: "cover",
        filter: c.live ? "none" : "grayscale(0.3)",
        opacity: c.live ? 1 : 0.85
      }
    });
    return React.createElement("span", {
      style: {
        width: 24,
        height: 24,
        borderRadius: 99,
        background: LT.paper2,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 9.5,
        fontWeight: 700,
        color: LT.ink2
      }
    }, c.n.slice(0, 2));
  }
  function MultiChain() {
    const chains = [{
      n: "Base",
      k: "base",
      live: true
    }, {
      n: "Ethereum",
      k: "ethereum"
    }, {
      n: "Arbitrum",
      k: "arbitrum"
    }, {
      n: "BNB",
      k: "binance"
    }, {
      n: "HyperEVM",
      k: "hyperliquid"
    }, {
      n: "MegaETH",
      k: "megaeth"
    }, {
      n: "Unichain",
      k: "unichain"
    }, {
      n: "Ink",
      k: "ink"
    }, {
      n: "X Layer",
      k: "xlayer"
    }];
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto",
        textAlign: "center"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Multi-chain"), React.createElement(H2, null, "One wallet. Every HookOS chain."), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 30
      }
    }, chains.map(c => React.createElement("div", {
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
      c: c
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
  function BottomCTA() {
    return React.createElement("section", {
      style: {
        padding: "104px 40px"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
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
        fontSize: 54,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        lineHeight: 1.05,
        margin: "0 0 16px",
        color: LT.ink
      }
    }, "Take custody.", React.createElement("br", null), React.createElement("span", {
      style: {
        color: LT.acidInk
      }
    }, "Start launching markets.")), React.createElement("p", {
      style: {
        fontSize: 16.5,
        color: LT.ink2,
        margin: "0 0 30px"
      }
    }, "Your keys, your tokens, your hooks \u2014 in one app. Live on Base."), React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "center",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement(Btn, {
      big: true,
      href: HL.ios
    }, "\uD83D\uDE80 Get the App"), React.createElement(Btn, {
      big: true,
      ghost: true,
      href: HL.app
    }, "Explore HookOS"), React.createElement(Btn, {
      big: true,
      ghost: true,
      href: HL.tg
    }, "Join Community")))));
  }
  function Footer() {
    const cols = [{
      h: "Wallet",
      l: [["Features", "#wallet"], ["Live data", "#live"], ["Hooks", "#hooks"], ["Get the App", HL.ios]]
    }, {
      h: "Protocol",
      l: [["HookOS App", HL.app], ["Docs", HL.docs], ["Developers", HL.dev], ["Indexer", API]]
    }, {
      h: "Community",
      l: [["X @hookosfun", HL.x], ["Bot @hookosbot", HL.bot], ["Telegram", HL.tg], ["hookos.fun", HL.app]]
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
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr repeat(3,1fr)",
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
        maxWidth: 260,
        margin: "0 0 18px"
      }
    }, "The self-custody native client for the HookOS ecosystem. Your keys. Your markets."), React.createElement("div", {
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
        color: LT.ink2
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
      target: href.startsWith("#") ? undefined : "_blank",
      rel: href.startsWith("#") ? undefined : "noopener noreferrer",
      className: "lnd-plain lnd-navlink",
      style: {
        fontSize: 13
      }
    }, label)))))), React.createElement("div", {
      className: "lnd-head",
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
    }, "\xA9 2026 HOOKOS LABS \xB7 hookoswallet.xyz"), React.createElement("span", {
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
  function ProtocolPulse() {
    const fees = useApi("/fees");
    const stats = useApi("/stats");
    const loading = fees.loading;
    const failed = !fees.loading && (fees.error || !Array.isArray(fees.data));
    const rows = Array.isArray(fees.data) ? fees.data : [];
    const empty = !loading && !failed && rows.length === 0;
    let total = 0n;
    const byLabel = {};
    for (const r of rows) {
      let w;
      try {
        w = BigInt(r.amount);
      } catch (e) {
        w = 0n;
      }
      total += w;
      byLabel[r.label] = (byLabel[r.label] || 0n) + w;
    }
    const bars = Object.keys(byLabel).map(label => {
      const wei = byLabel[label];
      const pct = total > 0n ? Number(wei * 10000n / total) / 100 : 0;
      return {
        label,
        wei,
        pct
      };
    }).sort((a, b) => a.wei < b.wei ? 1 : a.wei > b.wei ? -1 : 0);
    const statTotalWei = stats.data && stats.data.totalFeesDistributed ? stats.data.totalFeesDistributed : total.toString();
    const headEth = parseFloat(weiToEth(statTotalWei, 4)) || 0;
    const recent = rows.slice().sort((a, b) => Number(b.timestamp) - Number(a.timestamp)).slice(0, 6);
    const timeAgo = ts => {
      const s = Math.max(0, Math.floor(Date.now() / 1000) - Number(ts));
      if (s < 60) return s + "s";
      if (s < 3600) return Math.floor(s / 60) + "m";
      if (s < 86400) return Math.floor(s / 3600) + "h";
      return Math.floor(s / 86400) + "d";
    };
    const monoNum = {
      fontFamily: LT.mono,
      fontVariantNumeric: "tabular-nums"
    };
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement("div", {
      className: "lnd-head",
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 30
      }
    }, React.createElement("div", null, React.createElement(Kicker, null, "Protocol Pulse"), React.createElement(H2, null, "Every swap fee, split on-chain."), React.createElement("p", {
      style: {
        margin: "10px 0 0",
        color: LT.ink2,
        fontFamily: LT.sans,
        maxWidth: 520,
        lineHeight: 1.5,
        fontSize: 16
      }
    }, "Live fee distribution from the HookOS indexer. No estimates \u2014 these are settled transfers to LPs, hook authors, and the protocol treasury.")), React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: LT.ink3,
        fontFamily: LT.mono,
        marginBottom: 6
      }
    }, "Total distributed"), React.createElement("div", {
      style: {
        ...monoNum,
        fontSize: 30,
        fontWeight: 700,
        color: LT.ink,
        lineHeight: 1
      }
    }, loading || failed ? React.createElement(Skeleton, {
      w: 150,
      h: 30,
      r: 6
    }) : React.createElement(Counter, {
      to: headEth,
      decimals: 4,
      suffix: " ETH"
    }))))), React.createElement(Reveal, {
      delay: 80
    }, React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 20,
        alignItems: "stretch"
      }
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 26
      }
    }, React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: LT.ink3,
        marginBottom: 20
      }
    }, "Distribution by recipient"), loading && React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 22
      }
    }, [0, 1, 2].map(i => React.createElement("div", {
      key: i
    }, React.createElement(Skeleton, {
      w: 140,
      h: 13,
      r: 4,
      style: {
        marginBottom: 10
      }
    }), React.createElement(Skeleton, {
      w: "100%",
      h: 12,
      r: 6
    })))), failed && React.createElement("div", {
      style: {
        padding: "40px 0",
        textAlign: "center",
        color: LT.ink3
      }
    }, "Live fee data unavailable."), empty && React.createElement("div", {
      style: {
        padding: "40px 0",
        textAlign: "center",
        color: LT.ink3
      }
    }, "No fees distributed yet."), !loading && !failed && !empty && React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 22
      }
    }, bars.map(b => React.createElement("div", {
      key: b.label
    }, React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 9
      }
    }, React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 500,
        color: LT.ink
      }
    }, b.label), React.createElement("span", {
      style: {
        ...monoNum,
        fontSize: 13,
        color: LT.ink2
      }
    }, weiToEth(b.wei.toString(), 5), " ETH", React.createElement("span", {
      style: {
        color: LT.ink3,
        marginLeft: 10
      }
    }, b.pct.toFixed(1), "%"))), React.createElement("div", {
      style: {
        height: 12,
        borderRadius: 6,
        background: LT.paper2,
        overflow: "hidden"
      }
    }, React.createElement("div", {
      className: "lnd-fill",
      style: {
        width: b.pct + "%",
        height: "100%",
        borderRadius: 6,
        background: LT.acid,
        minWidth: 4
      }
    })))))), React.createElement("div", {
      className: "lnd-card",
      style: {
        padding: 26,
        display: "flex",
        flexDirection: "column"
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
        fontFamily: LT.mono,
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: LT.ink3
      }
    }, "Recent events"), React.createElement(LHex, {
      size: 16,
      sw: 1.5
    })), loading && React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 14
      }
    }, [0, 1, 2, 3, 4].map(i => React.createElement(Skeleton, {
      key: i,
      w: "100%",
      h: 18,
      r: 4
    }))), (failed || empty) && React.createElement("div", {
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: LT.ink3,
        textAlign: "center",
        minHeight: 120
      }
    }, failed ? "Live fee data unavailable." : "No fees distributed yet."), !loading && !failed && !empty && React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column"
      }
    }, recent.map((r, i) => React.createElement("div", {
      key: r.id,
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 0",
        borderTop: i === 0 ? "none" : `1px solid ${LT.line}`
      }
    }, React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, React.createElement("div", {
      style: {
        fontSize: 14,
        color: LT.ink,
        fontWeight: 500,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, r.label), React.createElement("div", {
      style: {
        ...monoNum,
        fontSize: 12,
        color: LT.ink3
      }
    }, shortAddr(r.recipient))), React.createElement("div", {
      style: {
        textAlign: "right",
        flexShrink: 0,
        marginLeft: 12
      }
    }, React.createElement("div", {
      style: {
        ...monoNum,
        fontSize: 14,
        color: LT.ink
      }
    }, weiToEth(r.amount, 5)), React.createElement("div", {
      style: {
        ...monoNum,
        fontSize: 11,
        color: LT.ink3
      }
    }, timeAgo(r.timestamp), " ago"))))))))));
  }
  function SelfCustody() {
    const checklist = [["Non-custodial by design", "Your seed is generated and encrypted on-device. It never touches our servers — there are none to touch."], ["On-device signing", "Every signature is produced in the app's secure keystore. Keys don't leave the phone to sign."], ["Hardware wallet support", "Pair a Ledger to keep keys in cold storage and confirm on the device screen."], ["Smart accounts (ERC-4337)", "Opt into on-chain spend limits and guards — safety rails the contract enforces, not a promise."], ["Explicit confirmation, always", "Swaps, buys, hook attach, bridge transfers — every write routes through a confirmation sheet. No silent signing."], ["Open-source lineage", "Built on Rainbow's open-source wallet. The signing path is public and inspectable."]];
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, null, "Security \xB7 self-custody"), React.createElement(H2, null, "Your keys. Your markets.")), React.createElement("div", {
      className: "lnd-cols",
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        marginTop: 32,
        alignItems: "start"
      }
    }, React.createElement(Reveal, {
      delay: 60
    }, React.createElement("div", {
      style: {
        maxWidth: 520
      }
    }, React.createElement("p", {
      style: {
        fontSize: 17,
        lineHeight: 1.6,
        color: LT.ink2,
        margin: 0
      }
    }, "HookOS Wallet is self-custody. No account to open, no custodian to trust, and no support desk that can move your funds \u2014 because only your device holds the key."), React.createElement("p", {
      style: {
        fontSize: 15.5,
        lineHeight: 1.65,
        color: LT.ink2,
        marginTop: 18
      }
    }, "The signing core comes from Rainbow's open-source wallet, extended as the native client for HookOS on Base. Trade tokens, attach hooks, bridge assets \u2014 each is an explicit, on-device signature you approve, one sheet at a time."), React.createElement("div", {
      style: {
        marginTop: 28,
        display: "flex",
        gap: 12,
        flexWrap: "wrap"
      }
    }, React.createElement(Btn, {
      href: HL.ios,
      big: true
    }, "Get the wallet"), React.createElement(Btn, {
      href: HL.docs,
      ghost: true
    }, "Read the security model")))), React.createElement(Reveal, {
      delay: 120
    }, React.createElement("div", {
      className: "lnd-card lnd-lift",
      style: {
        padding: 28
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20
      }
    }, React.createElement(LHex, {
      size: 22,
      sw: 2
    }), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: LT.ink3
      }
    }, "What self-custody means here")), React.createElement("div", null, checklist.map(([t, d], i) => React.createElement("div", {
      key: t,
      style: {
        display: "flex",
        gap: 14,
        padding: "14px 0",
        borderTop: i === 0 ? "none" : `1px solid ${LT.line}`
      }
    }, React.createElement("span", {
      "aria-hidden": true,
      style: {
        flex: "0 0 auto",
        width: 22,
        height: 22,
        marginTop: 1,
        borderRadius: 6,
        background: LT.acidBg,
        color: LT.acidInk,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: LT.mono,
        fontSize: 13,
        fontWeight: 700
      }
    }, "\u2713"), React.createElement("div", null, React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        color: LT.ink
      }
    }, t), React.createElement("div", {
      style: {
        fontSize: 13.5,
        lineHeight: 1.55,
        color: LT.ink2,
        marginTop: 3
      }
    }, d))))), React.createElement("div", {
      style: {
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${LT.line2}`,
        fontFamily: LT.mono,
        fontSize: 11,
        lineHeight: 1.6,
        color: LT.ink3
      }
    }, "Open-source lineage (Rainbow fork) \xB7 self-custody \xB7 you sign every write. We make no claim of third-party audit or certification."))))));
  }
  function Gamification() {
    const {
      data,
      loading,
      error
    } = useApi("/stats");
    const surfaces = [["Battle Pass", "Seasonal tiers. Earn XP from real on-chain activity and climb."], ["Daily Quests", "Rotating objectives — trade, launch, attach a hook, show up."], ["Clans", "Squad up. Pool progress and compete for the collective board."], ["PvP Arena", "Head-to-head battles settled on-chain. Winner takes the pot."], ["Launch Wars", "New-token launches race the bonding curve. First to graduate wins."]];
    const num = k => data && typeof data[k] === "number" ? data[k] : null;
    const season = num("currentSeason"),
      battles = num("totalBattles"),
      wagers = num("totalWagers");
    const arenaCold = battles === 0 && wagers === 0;
    const stats = [{
      label: "Tokens launched",
      value: num("totalTokens")
    }, {
      label: "Hooks deployed",
      value: num("totalHooks")
    }, {
      label: "Arena battles",
      value: battles,
      first: battles === 0
    }, {
      label: "Wagers settled",
      value: wagers,
      first: wagers === 0
    }];
    return React.createElement("section", {
      style: {
        padding: "92px 40px 0"
      }
    }, React.createElement("div", {
      style: {
        maxWidth: 1180,
        margin: "0 auto"
      }
    }, React.createElement(Reveal, null, React.createElement(Kicker, {
      color: LT.acidInk
    }, "Earn \xB7 compete"), React.createElement(H2, null, "Markets are the game."), React.createElement("p", {
      style: {
        fontSize: 17,
        lineHeight: 1.6,
        color: LT.ink2,
        maxWidth: 620,
        marginTop: 14
      }
    }, "Every launch, hook, and trade is a move. HookOS turns programmable markets into a season you can play \u2014 and the board is live now.")), React.createElement(Reveal, {
      delay: 60
    }, React.createElement("div", {
      className: "lnd-card",
      style: {
        marginTop: 32,
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap"
      }
    }, loading ? React.createElement(Skeleton, {
      w: 220,
      h: 20,
      r: 6
    }) : error || season === null ? React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 13,
        color: LT.ink3
      }
    }, "Season status unavailable \u2014 the game is still on. Check back shortly.") : React.createElement(React.Fragment, null, React.createElement("span", {
      "aria-hidden": true,
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: LT.acid,
        boxShadow: `0 0 0 4px ${LT.acidBg}`
      }
    }), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 14,
        fontWeight: 700,
        color: LT.ink
      }
    }, "Season ", season), React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 13,
        color: LT.acidInk,
        letterSpacing: "0.04em"
      }
    }, "\xB7 LIVE NOW"), React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: LT.ink2
      }
    }, arenaCold ? "The Arena just opened — zero battles fought. Be the first name on the board." : "The board is warming up. Jump in and climb.")))), React.createElement("div", {
      style: {
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 14
      }
    }, stats.map((s, i) => React.createElement(Reveal, {
      key: s.label,
      delay: 80 + i * 40
    }, React.createElement("div", {
      className: "lnd-card lnd-lift",
      style: {
        padding: 20
      }
    }, loading ? React.createElement(Skeleton, {
      w: 70,
      h: 30,
      r: 6
    }) : error || s.value === null ? React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 26,
        fontWeight: 700,
        color: LT.ink3
      }
    }, "\u2014") : React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 30,
        fontWeight: 700,
        color: LT.ink,
        lineHeight: 1
      }
    }, React.createElement(Counter, {
      to: s.value,
      decimals: 0
    })), React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 10.5,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: LT.ink3,
        marginTop: 10
      }
    }, s.label), !loading && !error && s.first && React.createElement("div", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11,
        color: LT.acidInk,
        marginTop: 6
      }
    }, "be first \u2197"))))), React.createElement("div", {
      style: {
        marginTop: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 14
      }
    }, surfaces.map(([t, d]) => React.createElement("div", {
      className: "lnd-card lnd-lift",
      key: t,
      style: {
        padding: 22
      }
    }, React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 700,
        color: LT.ink
      }
    }, t), React.createElement("div", {
      style: {
        fontSize: 13.5,
        lineHeight: 1.55,
        color: LT.ink2,
        marginTop: 8
      }
    }, d)))), React.createElement(Reveal, {
      delay: 180
    }, React.createElement("div", {
      style: {
        marginTop: 28,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center"
      }
    }, React.createElement(Btn, {
      href: HL.app,
      big: true
    }, "Enter the Arena"), React.createElement(Btn, {
      href: HL.docs,
      ghost: true
    }, "How seasons work"), !loading && !error && data && data.lastUpdatedBlock && React.createElement("span", {
      style: {
        fontFamily: LT.mono,
        fontSize: 11.5,
        color: LT.ink3
      }
    }, "live \xB7 block ", fmtInt(data.lastUpdatedBlock))))));
  }
  function LandingPage() {
    return React.createElement("div", {
      "data-screen-label": "HookOS Wallet"
    }, React.createElement(Topbar, null), React.createElement(Hero, null), React.createElement(Features, null), React.createElement(LiveTokens, null), React.createElement(LiveHooks, null), React.createElement(ProtocolPulse, null), React.createElement(HowItWorks, null), React.createElement(SelfCustody, null), React.createElement(Gamification, null), React.createElement(Economics, null), React.createElement(MultiChain, null), React.createElement(BottomCTA, null), React.createElement(Footer, null));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(LandingPage, null));
})();