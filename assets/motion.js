(() => {
  const html = document.documentElement;
  const themes = ["apple", "dark", "warm"];
  const themeLabels = {
    apple: "🍏 애플 클린",
    dark: "🌌 프로 다크",
    warm: "📜 웜 매거진"
  };

  // 1. Theme Persistence & Cycling
  const themeBtn = document.getElementById("themeCycleBtn");
  function applyTheme(t) {
    html.setAttribute("data-theme", t);
    localStorage.setItem("tellzzang-apple-theme", t);
    if (themeBtn) themeBtn.textContent = themeLabels[t] || "🎨 테마";
  }

  const savedTheme = localStorage.getItem("tellzzang-apple-theme");
  applyTheme(savedTheme && themes.includes(savedTheme) ? savedTheme : "apple");

  themeBtn?.addEventListener("click", () => {
    const cur = html.getAttribute("data-theme") || "apple";
    const next = themes[(themes.indexOf(cur) + 1) % themes.length];
    applyTheme(next);
  });

  // 2. Smooth Page Transition Curtain for internal sub-page links
  const curtain = document.getElementById("pageCurtain");
  document.querySelectorAll("a[data-transition]").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;
      e.preventDefault();
      if (curtain) {
        curtain.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = href;
        }, 210);
      } else {
        window.location.href = href;
      }
    });
  });

  // 3. Scroll Progress Bar
  const progressBar = document.getElementById("progressBar");
  window.addEventListener(
    "scroll",
    () => {
      if (!progressBar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    },
    { passive: true }
  );

  // 4. Scroll Reveal + Animated Counter
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count-to]").forEach((el) => {
          if (el.dataset.counted) return;
          el.dataset.counted = "1";
          const target = parseFloat(el.dataset.countTo || "0");
          const suffix = el.dataset.suffix || "";
          const duration = 900;
          const start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  // 5. 60fps Interactive Hero Motion Canvas (Fluid Economic Waves + Particles)
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let time = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    window.addEventListener(
      "pointermove",
      (e) => {
        const rect = canvas.getBoundingClientRect();
        if (rect.width && rect.height) {
          pointerX = (e.clientX - rect.left) / rect.width;
          pointerY = (e.clientY - rect.top) / rect.height;
        }
      },
      { passive: true }
    );

    const dots = Array.from({ length: 26 }, (_, i) => ({
      x: (i / 25) * 1.1 - 0.05,
      phase: i * 0.42,
      radius: 2 + (i % 3)
    }));

    function draw() {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const mode = html.getAttribute("data-theme") || "apple";
      const colors =
        mode === "dark"
          ? ["rgba(41,151,255,0.34)", "rgba(124,140,255,0.28)", "rgba(50,215,75,0.22)"]
          : mode === "warm"
          ? ["rgba(180,83,9,0.22)", "rgba(15,118,110,0.18)", "rgba(190,18,60,0.14)"]
          : ["rgba(0,113,227,0.18)", "rgba(94,92,230,0.15)", "rgba(0,199,190,0.14)"];

      // Draw 3 layered fluid waves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const baseY = height * (0.48 + w * 0.12) + (pointerY - 0.5) * 28;
        const amp = 22 + w * 10;
        const freq = 0.0045 + w * 0.0014;
        for (let x = 0; x <= width; x += 12) {
          const y =
            baseY +
            Math.sin(x * freq + time * (0.85 + w * 0.25) + pointerX * 2) * amp +
            Math.cos(x * freq * 0.5 - time * 0.6) * (amp * 0.45);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colors[w];
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }

      // Floating kinetic data nodes
      dots.forEach((d, idx) => {
        const x = d.x * width;
        const y =
          height * 0.52 +
          Math.sin(x * 0.005 + time * 1.1 + d.phase) * 34 +
          (pointerY - 0.5) * 22;
        ctx.beginPath();
        ctx.arc(x, y, d.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors[idx % colors.length];
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }

  // 6. Worksheets Filter & Search (Main Page)
  const filterBtns = document.querySelectorAll("[data-ws-filter]");
  const wsSearch = document.getElementById("wsSearch");
  const wsRows = document.querySelectorAll(".ws-row");
  let activeFilter = "all";

  function applyWsFilter() {
    const q = (wsSearch?.value || "").trim().toLowerCase();
    wsRows.forEach((row) => {
      const cat = row.dataset.category || "";
      const txt = row.textContent.toLowerCase();
      const okCat = activeFilter === "all" || cat === activeFilter;
      const okTxt = !q || txt.includes(q);
      row.hidden = !(okCat && okTxt);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.wsFilter || "all";
      filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
      applyWsFilter();
    });
  });

  wsSearch?.addEventListener("input", applyWsFilter);

  // 7. Interactive Checklist with LocalStorage (per page key)
  document.querySelectorAll("[data-checklist-key]").forEach((listEl) => {
    const key = listEl.dataset.checklistKey;
    const pctEl = document.getElementById(listEl.dataset.pctId || "");
    const countEl = document.getElementById(listEl.dataset.countId || "");
    const fillEl = document.getElementById(listEl.dataset.fillId || "");
    const boxes = listEl.querySelectorAll('input[type="checkbox"]');

    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (Array.isArray(saved)) {
        boxes.forEach((b, i) => {
          if (typeof saved[i] === "boolean") b.checked = saved[i];
        });
      }
    } catch {}

    function sync() {
      const states = Array.from(boxes).map((b) => b.checked);
      localStorage.setItem(key, JSON.stringify(states));
      const done = states.filter(Boolean).length;
      const pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      if (pctEl) pctEl.textContent = `${pct}%`;
      if (countEl) countEl.textContent = `${done} / ${boxes.length} 완료`;
      if (fillEl) fillEl.style.width = `${pct}%`;
    }

    listEl.addEventListener("change", sync);
    sync();
  });

  // 8. Notion Source Modal
  const sourceModal = document.getElementById("sourceModal");
  const openSourceBtn = document.getElementById("openSourceBtn");
  const closeSourceBtn = document.getElementById("closeSourceModal");
  const sourcePre = document.getElementById("notionSourceCode");

  openSourceBtn?.addEventListener("click", async () => {
    if (!sourceModal) return;
    sourceModal.hidden = false;
    if (sourcePre && !sourcePre.dataset.loaded) {
      const srcPath = openSourceBtn.dataset.sourcePath || "./notion-source.md";
      try {
        const res = await fetch(srcPath);
        sourcePre.textContent = await res.text();
        sourcePre.dataset.loaded = "1";
      } catch {
        sourcePre.textContent = "노션 원본 마크다운을 불러오지 못했습니다.";
      }
    }
  });

  closeSourceBtn?.addEventListener("click", () => {
    if (sourceModal) sourceModal.hidden = true;
  });

  sourceModal?.addEventListener("click", (e) => {
    if (e.target === sourceModal) sourceModal.hidden = true;
  });

  // 9. 3D Flip Cards (/clinic/)
  document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("is-flipped"));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });

  // 10. Real-time Cloudflare Worker Notion Sync Hook
  const DEFAULT_WORKER_URL = "https://tellzzang-notion-proxy.tellzzang.workers.dev";
  const params = new URLSearchParams(window.location.search);
  if (params.get("worker")) {
    localStorage.setItem("tellzzang-worker-url", params.get("worker"));
  }
  const workerUrl =
    window.TELLZZANG_WORKER_URL ||
    localStorage.getItem("tellzzang-worker-url") ||
    DEFAULT_WORKER_URL;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mapUnitKey(unitText) {
    if (unitText.startsWith("III")) return "III";
    if (unitText.startsWith("II")) return "II";
    if (unitText.startsWith("I")) return "I";
    return "exam";
  }

  function mapStatusClass(status) {
    if (status.includes("이번") || status.includes("마감")) return "chip-hot";
    if (status.includes("완료") || status.includes("가능")) return "chip-done";
    return "chip-soon";
  }

  function mapRowHref(title) {
    if (title.includes("03호") || title.includes("실업률")) return "./ws-03/index.html";
    if (title.includes("보고서") || title.includes("수행")) return "./report/index.html";
    if (title.includes("클리닉") || title.includes("지필") || title.includes("특강")) return "./clinic/index.html";
    if (title.includes("01호") || title.includes("GDP")) return "https://gdp.tellzzang.com";
    return "";
  }

  const pageIdMeta = document.querySelector('meta[name="notion-page-id"]')?.content;
  const fetchUrl = pageIdMeta
    ? `${workerUrl}?pageId=${encodeURIComponent(pageIdMeta)}&_t=${Math.floor(Date.now() / 10000)}`
    : `${workerUrl}?_t=${Math.floor(Date.now() / 10000)}`;

  if (fetchUrl) {
    fetch(fetchUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || !data.ok) return;
        window.__NOTION_LIVE_DATA = data;
        window.dispatchEvent(new CustomEvent("notion:synced", { detail: data }));

        const callout = (data.blocks || []).find((b) => b.type === "callout");
        const ribbonEl = document.getElementById("liveRibbonText");
        if (callout && ribbonEl) {
          ribbonEl.textContent = `${callout.icon || "📢"} ${callout.text} `;
        }

        const liveBadge = document.getElementById("liveSyncBadge");
        if (liveBadge) {
          liveBadge.textContent = `🟢 Notion 실시간 동기화 (${new Date(data.lastEditedTime).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })})`;
        }

        // Sub-page live title & description update
        const subTitleEl = document.getElementById("liveSubTitle");
        if (subTitleEl && data.title) {
          subTitleEl.textContent = data.title;
        }
        const subDescEl = document.getElementById("liveSubDesc");
        if (subDescEl && callout?.text) {
          subDescEl.textContent = callout.text;
        }

        // Main page live table sync (#liveWsList)
        const liveWsList = document.getElementById("liveWsList");
        const tableRows = data.tables?.[0]?.rows;
        if (liveWsList && Array.isArray(tableRows) && tableRows.length > 1) {
          liveWsList.innerHTML = tableRows
            .slice(1)
            .map((cols) => {
              const [unit = "", title = "", desc = "", date = "", status = ""] = cols;
              const cat = mapUnitKey(unit);
              const chip = mapStatusClass(status);
              const href = mapRowHref(title);
              const inner = `
                <div>
                  <div class="ws-meta">${escapeHtml(unit)} · ${escapeHtml(date)} · Notion Live</div>
                  <h3>${escapeHtml(title)}</h3>
                  <p>${escapeHtml(desc)}</p>
                </div>
                <span class="status-chip ${chip}">${escapeHtml(status || "안내")}</span>
              `;
              if (!href) {
                return `<div class="ws-row" data-category="${cat}">${inner}</div>`;
              }
              const ext = href.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : "data-transition";
              return `<a href="${href}" class="ws-row" data-category="${cat}" ${ext}>${inner}</a>`;
            })
            .join("");
          applyWsFilter();
        }
      })
      .catch(() => {});
  }
})();
