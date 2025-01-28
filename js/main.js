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
  scrollSection.scrollLeft = window.innerWidth / 2 - 70;

  const footerIndex = document.querySelector("#footer-index");
  footerIndex.scrollLeft = window.innerWidth / 2 - 22;
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

    // 모든 컨테이너의 마진 설정이 완료된 후 opacity 설정
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
  const viewportWidth = horizontalSection.clientWidth;
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
  updateCenteredImage(horizontalSection);
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
        // 이전 centered 클래스 제거
        const prevCentered = footerIndex.querySelector("span.centered");
        if (prevCentered) {
          prevCentered.classList.remove("centered");
        }

        footerNumber.classList.add("centered");
        const footerScrollLeft =
          footerNumber.offsetLeft -
          footerIndex.clientWidth / 2 +
          footerNumber.offsetWidth / 2;
        footerIndex.scrollTo({
          left: footerScrollLeft,
          behavior: "smooth",
        });
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
window.addEventListener("DOMContentLoaded", () => {
  setInitialScroll();
  setupResizeObserver();
});

const scrollSection = document.querySelector("#scroll-section");
window.addEventListener("load", setInitialScroll);
scrollSection.addEventListener("wheel", handleScroll, { passive: false });
scrollSection.addEventListener("scroll", handleTouch, { passive: true });
scrollSection.addEventListener("touchmove", handleTouch, { passive: true });
