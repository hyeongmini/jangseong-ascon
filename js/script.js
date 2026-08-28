const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");

navToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// 전체 화면 스크롤 스냅 (천천히, 속도 조절 가능) - PC에서만, 홈 화면(히어로+미리보기 섹션)에만 적용
(function () {
  const sections = Array.from(document.querySelectorAll(".hero, .preview-section"));
  if (sections.length < 2) return;
  if (window.matchMedia("(max-width: 640px)").matches) return;

  const DURATION = 1100; // ms - 숫자를 키우면 더 천천히, 줄이면 더 빠르게 이동
  let isAnimating = false;
  let touchStartY = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function currentIndex() {
    const y = window.scrollY;
    let closest = 0;
    let minDist = Infinity;
    sections.forEach((sec, i) => {
      const dist = Math.abs(sec.offsetTop - y);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  }

  function scrollToIndex(i) {
    i = Math.max(0, Math.min(sections.length - 1, i));
    const target = sections[i].offsetTop;
    const start = window.scrollY;
    const distance = target - start;
    if (distance === 0) return;
    isAnimating = true;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      window.scrollTo(0, start + distance * easeInOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        isAnimating = false;
      }
    }
    requestAnimationFrame(step);
  }

  window.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (isAnimating) return;
    const idx = currentIndex();
    if (e.deltaY > 0) scrollToIndex(idx + 1);
    else if (e.deltaY < 0) scrollToIndex(idx - 1);
  }, { passive: false });

  window.addEventListener("keydown", (e) => {
    if (isAnimating) return;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      scrollToIndex(currentIndex() + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      scrollToIndex(currentIndex() - 1);
    }
  });

  window.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (touchStartY === null || isAnimating) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      const idx = currentIndex();
      if (diff > 0) scrollToIndex(idx + 1);
      else scrollToIndex(idx - 1);
    }
    touchStartY = null;
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const targetEl = document.querySelector(link.getAttribute("href"));
    const idx = sections.indexOf(targetEl);
    if (idx === -1) return;
    link.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToIndex(idx);
    });
  });
})();
