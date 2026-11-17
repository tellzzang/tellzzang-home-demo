(() => {
  const html = document.documentElement;
  const themeButtons = document.querySelectorAll("[data-theme-choice]");
  const cycleThemeBtn = document.getElementById("cycleThemeBtn");
  const progressBar = document.getElementById("progressBar");
  const spotlight = document.getElementById("cursorSpotlight");

  const themes = ["dramatic", "minimal", "editorial"];
  const themeNames = {
    dramatic: "🌌 드라마틱 스튜디오",
    minimal: "📄 Super.so 미니멀",
    editorial: "📜 웜 매거진"
  };

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem("tellzzang-class-theme", theme);
    themeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });
  }

  const savedTheme = localStorage.getItem("tellzzang-class-theme");
  if (savedTheme && themes.includes(savedTheme)) {
    applyTheme(savedTheme);
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.themeChoice));
  });

  if (cycleThemeBtn) {
    cycleThemeBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme") || "dramatic";
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      applyTheme(next);
      cycleThemeBtn.textContent = `✨ 현재: ${themeNames[next]} (클릭해 전환)`;
    });
  }

  // Cursor spotlight in dramatic mode
  window.addEventListener("mousemove", (e) => {
    if (!spotlight || html.getAttribute("data-theme") !== "dramatic") return;
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  });

  // Reading progress bar
  window.addEventListener("scroll", () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  });

  // Scroll Reveal Observer
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".section-reveal").forEach((el) => revealObserver.observe(el));

  // Active TOC highlight
  const sections = document.querySelectorAll("section[id]");
  const tocLinks = document.querySelectorAll(".toc-link");

  const tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          tocLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-25% 0px -60% 0px" }
  );

  sections.forEach((sec) => tocObserver.observe(sec));

  // Worksheets Filter & Search
  const filterPills = document.querySelectorAll(".filter-pill");
  const notesSearch = document.getElementById("notesSearch");
  const noteRows = document.querySelectorAll(".note-row");
  let activeFilter = "all";

  function filterNotes() {
    const query = (notesSearch?.value || "").trim().toLowerCase();
    noteRows.forEach((row) => {
      const cat = row.dataset.category || "";
      const text = row.textContent.toLowerCase();
      const matchCat = activeFilter === "all" || cat === activeFilter;
      const matchText = !query || text.includes(query);
      row.hidden = !(matchCat && matchText);
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      activeFilter = pill.dataset.filter || "all";
      filterPills.forEach((p) => p.classList.toggle("active", p === pill));
      filterNotes();
    });
  });

  if (notesSearch) {
    notesSearch.addEventListener("input", filterNotes);
  }

  // Interactive Student Checklist with LocalStorage persistence
  const checklist = document.getElementById("roadmapChecklist");
  const roadmapPercent = document.getElementById("roadmapPercent");
  const roadmapCount = document.getElementById("roadmapCount");
  const roadmapFill = document.getElementById("roadmapFill");
  const CHECK_KEY = "tellzzang-class-checks-v1";

  function loadChecklistState() {
    if (!checklist) return;
    try {
      const saved = JSON.parse(localStorage.getItem(CHECK_KEY) || "null");
      if (Array.isArray(saved)) {
        const boxes = checklist.querySelectorAll('input[type="checkbox"]');
        boxes.forEach((box, idx) => {
          if (typeof saved[idx] === "boolean") box.checked = saved[idx];
        });
      }
    } catch {
      // Ignore storage error
    }
  }

  function updateRoadmap() {
    if (!checklist) return;
    const boxes = checklist.querySelectorAll('input[type="checkbox"]');
    const states = Array.from(boxes).map((b) => b.checked);
    localStorage.setItem(CHECK_KEY, JSON.stringify(states));
    const done = states.filter(Boolean).length;
    const total = boxes.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (roadmapPercent) roadmapPercent.textContent = `${pct}%`;
    if (roadmapCount) roadmapCount.textContent = `${done} / ${total} 완료`;
    if (roadmapFill) roadmapFill.style.width = `${pct}%`;
  }

  if (checklist) {
    loadChecklistState();
    checklist.addEventListener("change", updateRoadmap);
    updateRoadmap();
  }

  // Detail Modal Data (Tasks & Worksheets)
  const detailData = {
    report: {
      tag: "수행평가 01 · 금요일 17:00 마감",
      title: "거시경제 지표 분석 미니 보고서",
      desc: "최근 3년간 한국의 GDP 성장률, 소비자물가상승률, 실업률 추이를 직접 조사해 해석하는 탐구 과제입니다.",
      details:
        "<ul><li><strong>분량 및 형식:</strong> A4 1장 내외 (그래프 1개 + 300자 이상 분석 코멘트)</li><li><strong>필수 출처:</strong> 한국은행 경제통계시스템(ECOS) 또는 통계청(KOSIS)</li><li><strong>감점 유의사항:</strong> 지표 단위(%, %p) 혼동 주의 및 출처 누락 금지</li></ul>",
      link: "https://app.notion.com/p/41b973637abb810aa1b2c44e9bddc621"
    },
    gdplab: {
      tag: "수업 활동 02 · 온라인 시뮬레이터",
      title: "GDP 인터랙티브 랩 온라인 실습",
      desc: "명목 GDP와 실질 GDP가 기준연도에 따라 어떻게 달라지는지 직접 수치를 조정하며 익히는 실습입니다.",
      details:
        "<ul><li><strong>접속 주소:</strong> <code>gdp.tellzzang.com</code> (스마트폰·태블릿 모두 가능)</li><li><strong>실습 미션:</strong> 가격 상승 시나리오와 산출량 증가 시나리오 각각 비교 후 학습지 2쪽 기록</li></ul>",
      link: "https://gdp.tellzzang.com/"
    },
    clinic: {
      tag: "학습 지원 03 · 1:1 개념 클리닉",
      title: "2학기 지필평가 대비 핵심 개념 클리닉",
      desc: "경제 지필평가 고난도 자료 해석 문항에서 자주 틀리는 함정을 집중 점검하는 방과 후 클리닉입니다.",
      details:
        "<ul><li><strong>주요 주제:</strong> 고용률·실업률 계산 함정, 환율 상승/하락의 수출입 효과, 기회비용 비교</li><li><strong>신청 방법:</strong> 수업 종료 후 교탁 앞 희망 시간표에 이름 기재</li></ul>",
      link: "https://tellzzang.com"
    },
    ws03: {
      tag: "학습지 03호 · 이번 주 수업 자료 (샘플)",
      title: "[03호] 실업률 통계의 착시와 고용지표",
      desc: "15세 이상 인구, 경제활동인구, 비경제활동인구 구분부터 실망실업자·구직단념자가 실업률에 미치는 영향까지 다룹니다.",
      details:
        "<ul><li><strong>핵심 공식:</strong> 실업률 = (실업자 ÷ 경제활동인구) × 100 / 고용률 = (취업자 ÷ 15세 이상 인구) × 100</li><li><strong>수업 준비:</strong> 실제 Google Drive / 노션 첨부파일 링크가 연결되는 자리입니다 (샘플).</li></ul>",
      link: "https://app.notion.com/p/41b973637abb810aa1b2c44e9bddc621"
    },
    ws02: {
      tag: "학습지 02호 · 배포 완료 (샘플)",
      title: "[02호] 인플레이션과 물가지수 계산",
      desc: "소비자물가지수(CPI)의 가중치 개념과 체감물가가 공식 물가상승률과 다르게 느껴지는 이유를 분석합니다.",
      details:
        "<ul><li><strong>핵심 개념:</strong> 수요견인 인플레이션 vs 비용인상 인플레이션, 채권자·채무자 유불리</li><li><strong>참고:</strong> 정식 운영 시 학생용 PDF 다운로드 링크가 바로 연결됩니다.</li></ul>",
      link: "https://app.notion.com/p/41b973637abb810aa1b2c44e9bddc621"
    },
    ws01: {
      tag: "학습지 01호 · 배포 완료 (샘플)",
      title: "[01호] 명목 GDP vs 실질 GDP 완전 정복",
      desc: "GDP에 포함되는 항목과 제외되는 항목(중고 거래, 가사노동 등)을 구별하고 GDP 디플레이터를 계산합니다.",
      details:
        "<ul><li><strong>연계 실습:</strong> <code>gdp.tellzzang.com</code> 시뮬레이터와 함께 복습 추천</li></ul>",
      link: "https://gdp.tellzzang.com/"
    },
    ws04: {
      tag: "학습지 04호 · 다음 주 업로드 예정",
      title: "[04호] 기준금리 변동과 환율 시나리오",
      desc: "한국은행 금융통화위원회의 기준금리 결정이 시중 금리, 환율, 물가에 미치는 연쇄 효과를 정리합니다.",
      details:
        "<ul><li><strong>업로드 예정일:</strong> 2026-11-23 오전 08:30</li></ul>",
      link: "https://app.notion.com/p/41b973637abb810aa1b2c44e9bddc621"
    },
    ws05: {
      tag: "특강 자료 · 시험 대비 준비 중",
      title: "[특강] 2학기 지필평가 고난도 기출 모음",
      desc: "한국교육과정평가원 기출 유형의 표·그래프 분석 문항 10선과 해설 노트를 제공합니다.",
      details:
        "<ul><li><strong>업로드 예정일:</strong> 2026-11-30</li></ul>",
      link: "https://app.notion.com/p/41b973637abb810aa1b2c44e9bddc621"
    }
  };

  const projectModal = document.getElementById("projectModal");
  const modalTag = document.getElementById("modalTag");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDetails = document.getElementById("modalDetails");
  const modalLink = document.getElementById("modalLink");

  function openDetailModal(key) {
    const item = detailData[key];
    if (!item || !projectModal) return;
    modalTag.textContent = item.tag;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalDetails.innerHTML = item.details;
    modalLink.href = item.link;
    projectModal.hidden = false;
  }

  document.querySelectorAll("[data-project], [data-worksheet]").forEach((card) => {
    const key = card.dataset.project || card.dataset.worksheet;
    card.addEventListener("click", () => openDetailModal(key));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDetailModal(key);
      }
    });
  });

  ["closeProjectModal", "closeProjectModalBtn"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      if (projectModal) projectModal.hidden = true;
    });
  });

  // Notion Source Inspector Modal
  const sourceModal = document.getElementById("sourceModal");
  const openSourceBtn = document.getElementById("openSourceBtn");
  const closeSourceModal = document.getElementById("closeSourceModal");
  const notionSourceCode = document.getElementById("notionSourceCode");

  openSourceBtn?.addEventListener("click", async () => {
    if (!sourceModal) return;
    sourceModal.hidden = false;
    if (notionSourceCode && notionSourceCode.dataset.loaded !== "true") {
      try {
        const res = await fetch("./notion-source.md");
        const text = await res.text();
        notionSourceCode.textContent = text;
        notionSourceCode.dataset.loaded = "true";
      } catch {
        notionSourceCode.textContent = "notion-source.md 파일을 불러오지 못했습니다.";
      }
    }
  });

  closeSourceModal?.addEventListener("click", () => {
    if (sourceModal) sourceModal.hidden = true;
  });

  [projectModal, sourceModal].forEach((modal) => {
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) modal.hidden = true;
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (projectModal) projectModal.hidden = true;
      if (sourceModal) sourceModal.hidden = true;
    }
  });
})();
