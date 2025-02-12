if (history.scrollRestoration) {
  window.history.scrollRestoration = "manual";
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function smoothScrollTo(element, target, duration) {
  const start = element.scrollLeft;
  const change = target - start;
  let startTime = null;

  function animateScroll(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);  // 0 ~ 1 사이의 값

    element.scrollLeft = start + change * easeInOutQuad(progress);

    if (elapsed < duration) {
      window.requestAnimationFrame(animateScroll);
    }
  }

  window.requestAnimationFrame(animateScroll);
}

const ratioMap = {
  h60: 0.4,
  h66: 0.145,
  h85: 0.26,
  h100: 0.31,
};

// 초기 스크롤 위치 설정 함수
function setInitialScroll() {
  const scrollSection = document.querySelector("#scroll-section");
  const figureContainers = document.querySelectorAll(".figure-container");
  const firstContainer = figureContainers[0];

  // iPad Safari에서의 window.innerWidth 문제 해결
  const viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  scrollSection.scrollLeft = viewportWidth / 2 - 70;

  const footerIndex = document.querySelector("#footer-index");
  const isMobile = window.innerWidth <= 768;
  footerIndex.scrollLeft = viewportWidth / 2 - (isMobile ? 10 : 22);
  footerIndex.style.opacity = 1;
}

// 컨테이너 마진 설정을 위한 ResizeObserver 설정
function setupResizeObserver() {
  const scrollSection = document.querySelector("#scroll-section");
  const figureContainers = document.querySelectorAll(".figure-container");

  const ro = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const container = entry.target;
      const hClass = Array.from(container.classList).find((cls) =>
        /^h\d+$/.test(cls)
      );
      if (!hClass || !ratioMap[hClass]) return;

      const actualWidth = container.offsetWidth;
      const marginLeftPx = actualWidth * ratioMap[hClass];
      container.style.marginLeft = `-${marginLeftPx}px`;
    });
    scrollSection.style.opacity = 1;
  });

  figureContainers.forEach((container) => {
    ro.observe(container);
  });
}

// z-index 관리
const containers = document.querySelectorAll(".figure-container");
const originalZIndexes = new Map();
containers.forEach((container) => {
  const currentZIndex = parseInt(container.style.zIndex) || 7;
  originalZIndexes.set(container, currentZIndex);
});

// 스크롤 이벤트 핸들러
function handleScroll(e) {
  const detailView = document.querySelector("#detail-view");
  if (detailView.classList.contains("flex")) return;
  e.preventDefault();

  const horizontalSection = document.querySelector("#scroll-section");
  const multiplier = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1;

  // 스크롤 위치 계산
  const currentScrollLeft = horizontalSection.scrollLeft;
  const viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const firstContainer = containers[0];
  const lastContainer = containers[containers.length - 1];

  const firstContainerCenter =
    firstContainer.offsetLeft + firstContainer.offsetWidth / 2;
  const lastContainerCenter =
    lastContainer.offsetLeft + lastContainer.offsetWidth / 2;

  const minScroll = firstContainerCenter - viewportWidth / 2;
  const maxScroll = lastContainerCenter - viewportWidth / 2;

  // 새로운 스크롤 위치 계산 및 적용
  let newScrollLeft = currentScrollLeft;
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
    newScrollLeft += e.deltaX * multiplier;
  } else {
    newScrollLeft += e.deltaY * multiplier;
  }
  newScrollLeft = Math.max(minScroll, Math.min(maxScroll, newScrollLeft));
  horizontalSection.scrollLeft = newScrollLeft;

  updateCenteredImage(horizontalSection);
}
function handleTouch(e) {
  const detailView = document.querySelector("#detail-view");
  if (detailView.classList.contains("flex")) return;

  const horizontalSection = document.querySelector("#scroll-section");

  // 터치 이벤트에서도 스크롤 제한을 적용
  const viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  const firstContainer = containers[0];
  const lastContainer = containers[containers.length - 1];

  const firstContainerCenter =
    firstContainer.offsetLeft + firstContainer.offsetWidth / 2;
  const lastContainerCenter =
    lastContainer.offsetLeft + lastContainer.offsetWidth / 2;

  const minScroll = firstContainerCenter - viewportWidth / 2;
  const maxScroll = lastContainerCenter - viewportWidth / 2;

  // 현재 스크롤 위치를 제한 범위 내로 조정
  horizontalSection.scrollLeft = Math.max(
    minScroll,
    Math.min(maxScroll, horizontalSection.scrollLeft)
  );

  // iPad에서의 터치 이벤트 처리 지연
  requestAnimationFrame(() => {
    updateCenteredImage(horizontalSection);
  });
}

function updateCenteredImage(horizontalSection) {
  // 중앙 이미지 체크 및 처리
  const centerX =
    horizontalSection.scrollLeft + horizontalSection.clientWidth / 2;
  const footerIndex = document.querySelector(".footer-index");
  let isCentered = false;

  containers.forEach((container) => {
    const rect = container.getBoundingClientRect();
    const containerCenterX = container.offsetLeft + rect.width / 2;

    if (Math.abs(containerCenterX - centerX) < 50) {
      isCentered = true;
      container.style.zIndex =
        Math.max(...Array.from(originalZIndexes.values())) + 1;
      const figureNumber =
        container.querySelector(".figure-number").textContent;

      const footerNumber = Array.from(
        footerIndex.querySelectorAll("span")
      ).find((span) => span.textContent === figureNumber);

      if (footerNumber) {
        const prevCentered = footerIndex.querySelector("span.centered");
        if (prevCentered) {
          prevCentered.classList.remove("centered");
        }

        footerNumber.classList.add("centered");
        const footerScrollLeft =
          footerNumber.offsetLeft -
          footerIndex.clientWidth / 2 +
          footerNumber.offsetWidth / 2;

          smoothScrollTo(footerIndex, footerScrollLeft, 600);
      }
    } else {
      container.style.zIndex = originalZIndexes.get(container);
    }
  });

  if (!isCentered) {
    const prevCentered = footerIndex.querySelector("span.centered");
    if (prevCentered) {
      prevCentered.classList.remove("centered");
    }
  }
}

// 이벤트 리스너 설정
window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    setInitialScroll();
    setupResizeObserver();
  });
});

const scrollSection = document.querySelector("#scroll-section");
scrollSection.addEventListener("wheel", handleScroll, { passive: false });
scrollSection.addEventListener("scroll", handleTouch, { passive: true });
scrollSection.addEventListener("touchmove", handleTouch, { passive: false }); // passive를 false로 변경
