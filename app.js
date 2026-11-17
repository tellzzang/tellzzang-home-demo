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
    localStorage.setItem("tellzzang-demo-theme", theme);
    themeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.themeChoice === theme);
    });
  }

  const savedTheme = localStorage.getItem("tellzzang-demo-theme");
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

  // Notes Filter & Search
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

  // Interactive Roadmap Progress
  const checklist = document.getElementById("roadmapChecklist");
  const roadmapPercent = document.getElementById("roadmapPercent");
  const roadmapCount = document.getElementById("roadmapCount");
  const roadmapFill = document.getElementById("roadmapFill");

  function updateRoadmap() {
    if (!checklist) return;
    const boxes = checklist.querySelectorAll('input[type="checkbox"]');
    const done = Array.from(boxes).filter((b) => b.checked).length;
    const total = boxes.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    if (roadmapPercent) roadmapPercent.textContent = `${pct}%`;
    if (roadmapCount) roadmapCount.textContent = `${done} / ${total} 완료`;
    if (roadmapFill) roadmapFill.style.width = `${pct}%`;
  }

  if (checklist) {
    checklist.addEventListener("change", updateRoadmap);
    updateRoadmap();
  }

  // Project Detail Modal
  const projectData = {
    gdp: {
      tag: "PROJECT 01 · INTERACTIVE WEB",
      title: "GDP & 거시경제 인터랙티브 랩",
      desc: "학생들이 교과서 속 명목 GDP·실질 GDP·물가지수 개념을 직접 조작하며 이해하는 수업용 시뮬레이터입니다.",
      details:
        "<ul><li><strong>연동 도메인:</strong> <code>gdp.tellzzang.com</code> (GitHub Pages 운영)</li><li><strong>활용 방식:</strong> 수업 중 태블릿/스마트폰으로 즉시 접속해 변수 변화에 따른 그래프 이동 실습</li><li><strong>노션 연결:</strong> 수업 활동지 및 해설 노션 페이지와 상호 연결 가능</li></ul>",
      link: "https://gdp.tellzzang.com/"
    },
    club: {
      tag: "PROJECT 02 · STUDENT ARCHIVE",
      title: "경제·사회참여 동아리 아카이브",
      desc: "운양고 경제·사회참여 동아리 학생들의 1년간 탐구 보고서, 캠페인, 발표 자료를 전시하는 디지털 아카이브입니다.",
      details:
        "<ul><li><strong>노션 확장:</strong> 노션 데이터베이스에 학생 결과물을 누적하고 홈페이지 카드 그리드로 자동 노출</li><li><strong>기대 효과:</strong> 생기부 연계 포트폴리오 및 학부모·신입생 홍보 페이지로 활용</li></ul>",
      link: "https://tellzzang.github.io/club2025.html"
    },
    hub: {
      tag: "PROJECT 03 · AI WORKFLOW",
      title: "교사 생산성 AI 에이전트 허브",
      desc: "노션 메인 DB 일정 관리, .hwpx 평가원 수준 문항 출제, 구글 드라이브·GitHub Pages 배포를 통합한 자동화 시스템입니다.",
      details:
        "<ul><li><strong>핵심 스택:</strong> Notion MCP + GitHub Pages + Python 자동화</li><li><strong>특징:</strong> 메인 도메인(<code>tellzzang.com</code>)을 보존하면서 목적별 서브도메인 웹앱을 수 초 내 배포</li></ul>",
      link: "https://tellzzang.com"
    }
  };

  const projectModal = document.getElementById("projectModal");
  const modalTag = document.getElementById("modalTag");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalDetails = document.getElementById("modalDetails");
  const modalLink = document.getElementById("modalLink");

  function openProjectModal(key) {
    const item = projectData[key];
    if (!item || !projectModal) return;
    modalTag.textContent = item.tag;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalDetails.innerHTML = item.details;
    modalLink.href = item.link;
    projectModal.hidden = false;
  }

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => openProjectModal(card.dataset.project));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProjectModal(card.dataset.project);
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

  // Close modals on backdrop click or Escape
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
