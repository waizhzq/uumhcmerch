import React, { useEffect, useRef, useState, useCallback } from "react";
import { CONFIG, PRODUCTS, START, SIZES } from "./data.js";
import { track } from "./firebase.js";

const N = PRODUCTS.length;
const wrap = (i) => (i + N) % N;
const hoverable =
  typeof window !== "undefined" && window.matchMedia("(hover:hover) and (pointer:fine)").matches;

function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / CONFIG.loadingMs);
      setPct(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setDone(true); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);
  return (
    <div className={"loader" + (done ? " done" : "")} role="status" aria-label="Loading">
      <img src={CONFIG.logo} alt={CONFIG.brand} />
      <div className="l-name">{CONFIG.brand}</div>
      <div className="l-bar"><i style={{ width: pct * 100 + "%" }} /></div>
      <div className="l-pct">{Math.round(pct * 100)}%</div>
    </div>
  );
}

export default function App() {
  const [idx, setIdx] = useState(START);
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [side, setSide] = useState("front");
  const [shown, setShown] = useState({ idx: START, side: "front" }); // what the big figure shows
  const [flip, setFlip] = useState(false);
  const [swing, setSwing] = useState(null);
  const [loading, setLoading] = useState(true);
  const touch = useRef(null);
  const sheetTouch = useRef(null);

  const p = PRODUCTS[idx];
  const finishLoading = useCallback(() => { setTimeout(() => setLoading(false), 700); }, []);

  // body classes drive the CSS transitions
  useEffect(() => {
    const b = document.body.classList;
    b.toggle("open", open);
    b.toggle("sheet-on", sheet);
    b.toggle("loading", loading);
  }, [open, sheet, loading]);

  useEffect(() => {
    document.title = CONFIG.brand;
    let icon = document.querySelector("link[rel=icon]");
    if (!icon) { icon = document.createElement("link"); icon.rel = "icon"; document.head.appendChild(icon); }
    icon.href = CONFIG.logo;
    PRODUCTS.forEach((q) => { new Image().src = q.front; new Image().src = q.back; });
  }, []);

  // flip animation when the figure changes while open
  useEffect(() => {
    if (shown.idx === idx && shown.side === side) return;
    if (!open) { setShown({ idx, side }); return; }
    setFlip(true);
    const t = setTimeout(() => { setShown({ idx, side }); setFlip(false); }, 160);
    return () => clearTimeout(t);
  }, [idx, side, open, shown]);

  const openDetail = useCallback((i) => {
    setIdx(i); setSide("front"); setShown({ idx: i, side: "front" }); setOpen(true);
    track("view_item", { item_id: PRODUCTS[i].id, item_name: PRODUCTS[i].name });
  }, []);
  const closeDetail = () => setOpen(false);
  const step = useCallback((d) => {
    setIdx((i) => wrap(i + d));
    setSide("front");
  }, []);
  const openSheet = () => {
    setSheet(true);
    track("view_sizes", { item_id: p.id });
  };

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { sheet ? setSheet(false) : setOpen(false); return; }
      if (sheet) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheet, step]);

  const onSlotClick = (i) => {
    if (i === idx || hoverable) openDetail(i);
    else setIdx(i);
  };

  const onTag = (k) => {
    setSwing(k);
    setTimeout(() => setSwing(null), 700);
    if (k !== idx) { setIdx(k); setSide("front"); }
  };

  const figP = PRODUCTS[shown.idx];
  const tags = PRODUCTS.map((q, k) => [q, k]).filter(([q]) => q.group === PRODUCTS[shown.idx].group);

  return (
    <>
      {loading && <Loader onDone={finishLoading} />}

      <header>
        <div className="logo">
          <img src={CONFIG.logo} alt="" />
          <span>{CONFIG.brand}</span>
        </div>
      </header>

      <main
        id="stage"
        onTouchStart={(e) => { touch.current = [e.touches[0].clientX, e.touches[0].clientY]; }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current[0];
          const dy = e.changedTouches[0].clientY - touch.current[1];
          touch.current = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        }}
      >
        <div className="rack-wrap">
          <div className="bar" />
          <div className="items" role="listbox" aria-label="Products">
            {PRODUCTS.map((q, i) => (
              <button
                key={q.id}
                className={"slot" + (i === idx ? " active" : "")}
                role="option"
                aria-selected={i === idx}
                aria-label={q.name}
                onClick={() => onSlotClick(i)}
                onPointerEnter={hoverable ? () => setIdx(i) : undefined}
              >
                <div className="g"><img src={q.front} alt={q.name} draggable="false" /></div>
              </button>
            ))}
          </div>
        </div>

        <div className="caption">
          <div className="cap-name">{p.name}</div>
          <div className="cap-meta">{p.kind} · {CONFIG.currency}{p.price}</div>
          <button className="pill" onClick={() => { openDetail(idx); openSheet(); }}>Sizes &amp; order</button>
          <div className="hint">{hoverable ? "Hover to browse · Click to view" : "Swipe or tap to browse · Tap again to view"}</div>
        </div>

        <section className="detail" aria-hidden={!open}>
          <button className="close" aria-label="Close" onClick={closeDetail}>✕</button>
          <button className="nav prev" aria-label="Previous" onClick={() => step(-1)}>‹</button>
          <button className="nav next" aria-label="Next" onClick={() => step(1)}>›</button>
          <div className="d-row">
            <div className={"fig" + (flip ? " flip" : "")}>
              <img src={figP[shown.side]} alt={`${figP.name} — ${shown.side}`} draggable="false" />
            </div>
            <div className="tags">
              {tags.map(([q, k]) => (
                <button
                  key={q.id}
                  className={"tag" + (k === idx ? " on" : "") + (swing === k ? " swing" : "")}
                  style={{ "--c": q.tagColor, "--t": q.tagText }}
                  aria-label={q.name}
                  onClick={() => onTag(k)}
                >
                  <span>{q.tag}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="d-name">{p.name}</div>
          <div className="d-price">{CONFIG.currency}{p.price}</div>
          <div className="toggle" role="group" aria-label="View side">
            <button className={side === "front" ? "on" : ""} onClick={() => setSide("front")}>Front</button>
            <button className={side === "back" ? "on" : ""} onClick={() => setSide("back")}>Back</button>
          </div>
          <button className="link" onClick={openSheet}>Sizes &amp; order ↓</button>
        </section>
      </main>

      <footer>© {new Date().getFullYear()} {CONFIG.brand}</footer>

      <div className="scrim" onClick={() => setSheet(false)} />
      <aside
        className="sheet"
        aria-label="Sizes and order"
        onTouchStart={(e) => { sheetTouch.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (sheetTouch.current !== null && e.changedTouches[0].clientY - sheetTouch.current > 60) setSheet(false);
          sheetTouch.current = null;
        }}
      >
        <div className="grab" />
        <div className="s-head">
          <div>
            <div className="s-title">{p.name}</div>
            <div className="s-sub">{p.kind} · {CONFIG.currency}{p.price}</div>
          </div>
          <button className="s-close" aria-label="Close" onClick={() => setSheet(false)}>✕</button>
        </div>
        <div className="s-sizes-h">Sizes available</div>
        <div className="sizes">
          {SIZES.map((s) => <div className="size" key={s}><b>{s}</b></div>)}
        </div>
        <div className="order">
          <img src={CONFIG.qr} alt="QR code to order" />
          <div className="order-txt">Orders are taken through our form only. Scan the QR code or tap the button below.</div>
        </div>
        <a
          className="ask"
          href={CONFIG.orderUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("click_order", { item_id: p.id, item_name: p.name })}
        >
          Click here to order
        </a>
      </aside>
    </>
  );
}
