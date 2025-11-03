// ═══════════════════════════════════════════════════════════════════════════════
// 1. 主题初始化模块 - Theme Initialization Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 防止页面加载时的主题闪烁，提前设置主题状态
(function () {
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = savedTheme === "dark" || (savedTheme === null && prefersDark);

  if (shouldUseDark) {
    document.documentElement.setAttribute("data-color-scheme", "dark");
  } else {
    document.documentElement.removeAttribute("data-color-scheme");
  }
})();
// ═══════════════════════════════════════════════════════════════════════════════
// 全局 Loading 效果模块 - Global Loading Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 页面加载完成后隐藏loading遮罩，支持移动端返回
(function () {
  const MIN_LOADING_TIME = 600;
  const MAX_LOADING_TIME = 3000;
  let loadingStartTime = Date.now();
  let maxLoadingTimer = null;

  // 淡出 loading
  function fadeOutLoading(element, delay = 0) {
    if (!element) return;
    setTimeout(() => {
      element.style.opacity = "0";
      element.style.pointerEvents = "none";
      setTimeout(() => element.remove(), 500);
    }, delay);
  }

  // 页面加载完成
  function hideLoading() {
    const loadingElement = document.getElementById("global-loading");
    if (!loadingElement) return;

    const elapsed = Date.now() - loadingStartTime;
    const remain = Math.max(0, MIN_LOADING_TIME - elapsed);
    fadeOutLoading(loadingElement, remain);

    if (maxLoadingTimer) clearTimeout(maxLoadingTimer);
  }

  // 页面离开，准备 loading（移动端返回）
  function handlePageHide(event) {
    if (!event.persisted) return;

    // 已存在就不再创建
    if (document.getElementById("global-loading")) return;

    const loadingHTML = `
      <div class="flex flex-col items-center px-6">
        <div class="relative inline-flex aspect-square min-h-44 min-w-44 items-center justify-center p-12 sm:min-h-52 sm:min-w-52 sm:p-16">
          <div class="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-700"></div>
          <div class="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-gray-700 border-r-gray-500 dark:border-t-gray-300 dark:border-r-gray-400" style="animation-duration: 1.5s"></div>
          <div class="absolute inset-4 animate-spin rounded-full border-[3px] border-transparent border-b-gray-600 border-l-gray-500 dark:border-b-gray-400 dark:border-l-gray-500" style="animation-duration: 2s; animation-direction: reverse"></div>
          <div class="flex flex-col items-center justify-center space-y-4">
            <div class="flex items-end space-x-1.5">
              ${[0, 150, 300, 450, 600]
                .map((d, i) => {
                  // 确保 d 是有效数字并添加单位
                  const delay = isNaN(d) ? 0 : d;
                  const heightClass = [6, 10, 5, 8, 6][i] || 6;
                  return `<div class="h-${heightClass} w-1.5 animate-pulse rounded-full bg-gray-800 dark:bg-gray-200" 
                   style="animation-delay: ${delay}ms; animation-duration: 1s"></div>`;
                })
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    const loadingElement = document.createElement("div");
    loadingElement.id = "global-loading";
    loadingElement.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 transition-opacity duration-500 dark:bg-gray-900";
    loadingElement.innerHTML = loadingHTML;
    loadingElement.style.opacity = "1"; // 直接显示
    document.body.insertBefore(loadingElement, document.body.firstChild);
  }

  // 页面恢复（移动端返回）
  function handlePageShow(event) {
    if (!event.persisted) return;
    const loadingElement = document.getElementById("global-loading");
    if (!loadingElement) return;

    // 保持可见 400ms 后淡出
    fadeOutLoading(loadingElement, 400);

    if (maxLoadingTimer) clearTimeout(maxLoadingTimer);
  }

  window.addEventListener("load", hideLoading);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("pageshow", handlePageShow);

  // 强制最大保护
  maxLoadingTimer = setTimeout(() => {
    const el = document.getElementById("global-loading");
    if (el) fadeOutLoading(el);
  }, MAX_LOADING_TIME);
})();
// ═══════════════════════════════════════════════════════════════════════════════
// 2. 动画效果模块 - Animation Effects Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: Hero区域动画、视差滚动效果
// ┌─────────────────────────────────────────┐
// │ 2.1 视差滚动效果                        │
// └─────────────────────────────────────────┘
document.addEventListener("DOMContentLoaded", function initParallax() {
  // 缓存 DOM 元素
  const shade = document.getElementById("shade");
  const bg = document.getElementById("bg");
  const text = document.getElementById("text");
  if (!shade || !bg || !text) return;

  let ticking = false;

  function updateParallax() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    // 计算视差效果
    const shadeOpacity = Math.min(scrollTop / 500, 1);
    const bgScale = 1 + scrollTop * 0.0004;
    const textOffset = scrollTop * 0.3;

    // 应用效果
    shade.style.opacity = shadeOpacity;
    bg.style.transform = `scale(${bgScale})`;
    text.style.setProperty("--parallax-y", `-${textOffset}px`);

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  // 监听滚动
  window.addEventListener("scroll", requestTick, { passive: true });

  // 初始化一次
  updateParallax();
});
// ═══════════════════════════════════════════════════════════════════════════════
// 3. 主题切换模块 - Theme Toggle Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 深色/浅色主题切换、PC/移动端菜单控制

// ┌─────────────────────────────────────────┐
// │ 3.1 PC端下拉菜单切换                     │
// └─────────────────────────────────────────┘
function toggleMenu(button) {
  const menu = document.getElementById("children-" + button.id);
  if (!menu) return;

  const isHidden = menu.classList.contains("pointer-events-none");

  if (isHidden) {
    // 显示菜单
    menu.classList.remove("pointer-events-none", "opacity-0", "translate-y-1");
    menu.classList.add("pointer-events-auto", "opacity-100", "translate-y-0");

    // 点击其他地方隐藏菜单
    const hideMenu = (event) => {
      if (!button.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.add("pointer-events-none", "opacity-0", "translate-y-1");
        menu.classList.remove("pointer-events-auto", "opacity-100", "translate-y-0");
        document.removeEventListener("click", hideMenu); // 解绑事件
      }
    };
    document.addEventListener("click", hideMenu);
  } else {
    // 隐藏菜单
    menu.classList.add("pointer-events-none", "opacity-0", "translate-y-1");
    menu.classList.remove("pointer-events-auto", "opacity-100", "translate-y-0");
  }
}

// ┌─────────────────────────────────────────┐
// │ 3.2 深色/浅色主题切换                    │
// └─────────────────────────────────────────┘
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const slider = document.getElementById("theme-toggle-slider");
  if (!html || !toggle || !slider) return;

  // 获取当前主题
  const getCurrentTheme = () => html.getAttribute("data-color-scheme") === "dark";

  // 设置主题
  const setTheme = (isDark) => {
    html.setAttribute("data-color-scheme", isDark ? "dark" : "");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    slider.style.transform = isDark ? "translateX(20px)" : "translateX(0)";
  };

  // 初始化滑块
  const savedTheme = localStorage.getItem("theme");
  const initialDark = savedTheme === "dark" || getCurrentTheme();
  slider.style.transition = "none";
  setTheme(initialDark);
  requestAnimationFrame(() => {
    slider.style.transition = ""; // 恢复过渡动画
  });

  // 防抖点击
  let isTransitioning = false;
  toggle.addEventListener("click", () => {
    if (isTransitioning) return;
    isTransitioning = true;

    setTheme(!getCurrentTheme());

    // 使用 transitionend 替代固定延迟
    const onTransitionEnd = () => {
      isTransitioning = false;
      slider.removeEventListener("transitionend", onTransitionEnd);
    };
    slider.addEventListener("transitionend", onTransitionEnd);
  });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 4. 导航菜单模块 - Navigation Menu Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 移动端菜单展开/收起、多级菜单控制

// ┌─────────────────────────────────────────┐
// │ 4.1 移动端主菜单切换                     │
// └─────────────────────────────────────────┘
document.addEventListener("DOMContentLoaded", () => {
  // 主菜单
  const toggleBtn = document.getElementById("mobile-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const panel = document.getElementById("mobile-panel");
  const backdropOverlay = document.getElementById("mobile-backdrop");
  const iconBar = document.getElementById("icon-bar");
  const iconClose = document.getElementById("icon-close");
  const body = document.body;
  const preventScroll = (e) => e.preventDefault();

  const toggleMobileMenu = () => {
    const isOpen = !panel.classList.contains("translate-x-full");

    if (!isOpen) {
      mobileMenu.classList.remove("opacity-0", "pointer-events-none");
      backdropOverlay.classList.remove("opacity-0");
      panel.classList.replace("translate-x-full", "translate-x-0");
      backdropOverlay.addEventListener("touchmove", preventScroll, { passive: false });
      body.classList.add("overflow-hidden");
    } else {
      panel.classList.replace("translate-x-0", "translate-x-full");
      backdropOverlay.classList.add("opacity-0");
      panel.addEventListener(
        "transitionend",
        () => {
          mobileMenu.classList.add("opacity-0", "pointer-events-none");
          body.classList.remove("overflow-hidden");
          backdropOverlay.removeEventListener("touchmove", preventScroll);
        },
        { once: true },
      );
    }

    iconBar.classList.toggle("hidden", !isOpen);
    iconClose.classList.toggle("hidden", isOpen);
  };

  toggleBtn?.addEventListener("click", toggleMobileMenu);
  backdropOverlay?.addEventListener("click", toggleMobileMenu);

  // 二级菜单
  const toggles = document.querySelectorAll('[id^="more-toggle-"]');
  const menus = [];

  toggles.forEach((toggle) => {
    const parent = toggle.closest(".menu-item");
    const ul = parent ? parent.querySelector("ul") : null;
    const arrow = parent ? parent.querySelector('[id^="more-arrow-"]') : null;
    if (!ul) return;

    // 初始化
    ul.style.maxHeight = "0";
    ul.classList.add("opacity-0", "pointer-events-none", "transition-all", "duration-300", "ease-in-out", "overflow-hidden");
    menus.push({ ul, arrow });

    const openMenu = () => {
      menus.forEach((item) => {
        if (item.ul !== ul) closeMenu(item);
      });
      ul.style.maxHeight = ul.scrollHeight + "px";
      ul.classList.remove("opacity-0", "pointer-events-none");
      arrow?.classList.add("rotate-90");
    };

    const closeMenu = (item) => {
      item.ul.style.maxHeight = "0";
      item.ul.classList.add("opacity-0", "pointer-events-none");
      item.arrow?.classList.remove("rotate-90");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = ul.style.maxHeight !== "0px";
      if (isOpen) closeMenu({ ul, arrow });
      else openMenu();
    });
  });

  // 点击其他地方关闭二级菜单
  document.addEventListener("click", () => {
    menus.forEach((item) => {
      item.ul.style.maxHeight = "0";
      item.ul.classList.add("opacity-0", "pointer-events-none");
      item.arrow?.classList.remove("rotate-90");
    });
  });
});
// ═══════════════════════════════════════════════════════════════════════════════
// 5. 数字动画模块 - Number Animation Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 数字滚动动画效果，支持千分位分隔符和百分比

function initNumberAnimation() {
  function animateNumber(element) {
    const target = parseInt(element.getAttribute("data-target"));
    const useCommas = element.hasAttribute("data-use-commas");
    const usePercentage = element.hasAttribute("data-use-percentage");
    const duration = 2000;

    let startTime = null;

    function updateNumber(currentTime) {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);

      let formatted = current.toString();
      if (useCommas) {
        formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
      if (usePercentage) {
        formatted += "%";
      }

      element.textContent = formatted;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    }

    requestAnimationFrame(updateNumber);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          animateNumber(element);
          observer.unobserve(element);
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  document.querySelectorAll("[data-target]").forEach((element) => {
    observer.observe(element);
  });
}

document.addEventListener("DOMContentLoaded", initNumberAnimation);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. 标签布局模块 - Tag Layout Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 自动标签布局，支持单行/多行滚动动画

class AutoTagLayout {
  constructor(options = {}) {
    this.singleRowThreshold = options.singleRowThreshold || 8;
    this.animationSpeed = options.animationSpeed || {
      single: 60,
      multi: [80, 90, 100],
    };
    this.directions = options.directions || ["scroll-left", "scroll-right", "scroll-left"];
    this.containerSelector = options.containerSelector || ".tag-container";
    this.tagSelector = options.tagSelector || ".tag-item";

    this.init();
  }

  init() {
    this.processAllContainers();
    this.addClickListeners();
  }

  processAllContainers() {
    const containers = document.querySelectorAll(this.containerSelector);
    containers.forEach((container) => {
      this.processContainer(container);
    });
  }

  processContainer(container) {
    const tags = Array.from(container.children).filter((child) => child.classList.contains("flex-shrink-0"));

    if (tags.length === 0) return;

    container.innerHTML = "";

    if (tags.length <= this.singleRowThreshold) {
      this.createSingleRowLayout(container, tags);
    } else {
      this.createMultiRowLayout(container, tags);
    }
  }

  createSingleRowLayout(container, tags) {
    const scrollContainer = document.createElement("ul");
    scrollContainer.className = "tag-scroll flex whitespace-nowrap transition-transform duration-100 ease-linear";
    scrollContainer.style.animation = `scroll-left ${this.animationSpeed.single}s linear infinite`;

    // 根据标签数量动态调整复制次数，确保填满容器
    const copyCount = tags.length <= 4 ? 6 : tags.length <= 8 ? 4 : 3;

    for (let i = 0; i < copyCount; i++) {
      tags.forEach((tag) => {
        const clonedTag = tag.cloneNode(true);
        scrollContainer.appendChild(clonedTag);
      });
    }

    container.appendChild(scrollContainer);
  }

  createMultiRowLayout(container, tags) {
    const rowsContainer = document.createElement("div");
    rowsContainer.className = "tag-rows flex flex-col gap-3";

    const tagsPerRow = Math.ceil(tags.length / 3);
    const rowTags = [tags.slice(0, tagsPerRow), tags.slice(tagsPerRow, tagsPerRow * 2), tags.slice(tagsPerRow * 2)];

    rowTags.forEach((rowTagList, rowIndex) => {
      if (rowTagList.length === 0) return;

      const rowContainer = document.createElement("div");
      rowContainer.className = "tag-row overflow-hidden relative";

      const scrollContainer = document.createElement("div");
      scrollContainer.className = "tag-scroll flex whitespace-nowrap transition-transform duration-100 ease-linear";

      const speed = this.animationSpeed.multi[rowIndex] || this.animationSpeed.multi[0];
      const direction = this.directions[rowIndex] || this.directions[0];
      scrollContainer.style.animation = `${direction} ${speed}s linear infinite`;

      // 根据每行标签数量动态调整复制次数，确保填满容器
      const copyCount = rowTagList.length <= 2 ? 8 : rowTagList.length <= 4 ? 6 : 4;

      for (let i = 0; i < copyCount; i++) {
        rowTagList.forEach((tag) => {
          const clonedTag = tag.cloneNode(true);
          scrollContainer.appendChild(clonedTag);
        });
      }

      rowContainer.appendChild(scrollContainer);
      rowsContainer.appendChild(rowContainer);
    });

    container.appendChild(rowsContainer);
  }

  addClickListeners() {
    const containers = document.querySelectorAll(this.containerSelector);
    containers.forEach((container) => {
      this.addContainerClickListener(container);
    });
  }

  addContainerClickListener(container) {
    container.addEventListener("click", (e) => {
      if (e.target === container || e.target.closest(".tag-scroll")) {
        this.togglePause(container);
      }
    });
  }

  togglePause(container) {
    if (container.classList.contains("paused")) {
      container.classList.remove("paused");
    } else {
      container.classList.add("paused");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AutoTagLayout();
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. 图片加载模块 - Image Loading Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 懒加载图片、优化页面性能

// ┌─────────────────────────────────────────┐
// │ 7.1 懒加载图片核心函数                   │
// └─────────────────────────────────────────┘
function lazyLoadImages(targets, attr = "data-src", rootMargin = "100px") {
  if (!targets) return;
  const elements = Array.isArray(targets) || NodeList.prototype.isPrototypeOf(targets) ? targets : [targets];

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const url = el.getAttribute(attr);
          if (url) {
            const liElement = el.closest("li");
            if (liElement) {
              liElement.classList.add("animate-pulse");
            }

            el.onload = () => {
              el.classList.add("opacity-100");
              if (liElement) {
                liElement.classList.remove("animate-pulse");
              }
            };

            if (el.src && !el.src.startsWith("data:image")) {
              el.classList.add("opacity-100");
              if (liElement) {
                liElement.classList.remove("animate-pulse");
              }
            }
          }
          obs.unobserve(el);
        }
      });
    },
    { rootMargin },
  );

  elements.forEach((el) => el && observer.observe(el));
}

// ┌─────────────────────────────────────────┐
// │ 7.2 图片加载辅助函数                     │
// └─────────────────────────────────────────┘
function loadAllImages() {
  const imgs = document.querySelectorAll("img[data-src]");
  lazyLoadImages(imgs);
}
function loadPostImages(postElement) {
  if (!postElement) return;
  const img = postElement.querySelector("img[data-src]");
  if (img) lazyLoadImages(img);
}
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname.includes("/photos")) {
    return;
  }
  loadAllImages();
});
// ┌─────────────────────────────────────────┐
// │ 7.3 图库@图片加载                     │
// └─────────────────────────────────────────┘
function initPhotoLazyLoad() {
  const photoItems = document.querySelectorAll(".photo-item");
  if (photoItems.length === 0) {
    return;
  }
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          element.classList.remove("opacity-0", "translate-y-4");
          element.classList.add("opacity-100", "translate-y-0");
          observer.unobserve(element);
        }
      });
    },
    {
      rootMargin: "100px",
    },
  );
  photoItems.forEach((item) => {
    imageObserver.observe(item);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. 内容加载模块 - Content Loading Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 动态加载更多内容、分页功能

// ┌─────────────────────────────────────────┐
// │ 8.1 加载更多按钮组件                     │
// └─────────────────────────────────────────┘
// ┌─────────────────────────────────────────┐
// │ 8.1 通用加载更多按钮组件                 │
// └─────────────────────────────────────────┘
class LoadMoreButton {
  constructor(options) {
    this.container = options.container;
    this.postsContainer = options.postsContainer;
    this.getNextPageUrl = options.getNextPageUrl;
    this.insertPosition = options.insertPosition || "append";
    this.minPostsThreshold = options.minPostsThreshold || 10;
    this.postSelector = options.postSelector;
    this.onInsert = options.onInsert || null;
    this.skipContentFilter = options.skipContentFilter || false; // 内容过滤（用于照片等场景）
    this.i18n = options.i18n || {
      text: "加载更多",
      loading: "加载中...",
      complete: "已加载全部内容",
      error: "出错啦！请重试~",
    };

    this.currentPage = 1;
    this.emptyPageCount = 0;
    this.isLoading = false;

    if (!this.container || !this.postsContainer) return;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <button id="load-more-btn" class="relative group inline-flex w-auto transform items-center justify-center overflow-hidden rounded-xl inset-ring inset-ring-gray-200 dark:inset-ring-white/10 bg-white dark:bg-white/10 px-6 py-3 text-center text-xs backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:scale-105 hover:bg-white/20 hover:shadow-white/5 sm:rounded-2xl sm:px-8 sm:py-2 sm:text-sm sm:hover:-translate-y-2">
        <span id="load-more-text" class="flex items-center text-gray-900 dark:text-white/70">${this.i18n.text}</span>
      </button>
    `;
    this.btn = this.container.querySelector("#load-more-btn");
    this.btn.addEventListener("click", () => this.handleClick());
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.btn.disabled = loading;
    this.btn.querySelector("#load-more-text").innerHTML = loading ? `<i class="fas fa-spinner fa-spin mr-2"></i>${this.i18n.loading}` : this.i18n.text;
  }

  handleClick() {
    if (this.isLoading) return;
    this.setLoading(true);
    this.loadContent().finally(() => this.setLoading(false));
  }

  showComplete() {
    this.container.innerHTML = `
      <button class="relative group inline-flex w-auto transform items-center justify-center overflow-hidden rounded-xl inset-ring inset-ring-gray-200 dark:inset-ring-white/10 bg-white dark:bg-white/10 px-6 py-3 text-center text-xs backdrop-blur-md sm:rounded-2xl sm:px-8 sm:py-2 sm:text-sm" disabled>
        <span class="flex items-center text-gray-900 dark:text-white/70"><i class="fas fa-check-circle mr-2"></i>${this.i18n.complete}</span>
      </button>
    `;
  }

  showError(retryCallback) {
    this.container.innerHTML = `
      <button class="relative group inline-flex w-auto transform items-center justify-center overflow-hidden rounded-xl bg-red-100 px-6 py-3 text-center text-xs inset-ring inset-ring-gray-200 backdrop-blur-md sm:rounded-2xl sm:px-8 sm:py-2 sm:text-sm">
        <span class="flex items-center text-red-600 dark:text-red-400"><i class="fas fa-redo mr-1"></i>${this.i18n.error}</span>
      </button>
    `;
    this.container.querySelector("button").addEventListener("click", retryCallback);
  }

  async loadContent() {
    try {
      const nextPageUrl = this.getNextPageUrl(this.currentPage + 1);
      const response = await axios.get(nextPageUrl, {
        headers: { "X-Requested-With": "XMLHttpRequest", Accept: "text/html" },
      });

      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, "text/html");
      const newPosts = doc.querySelectorAll(this.postSelector);

      // 根据配置决定是否过滤内容（照片等场景不需要过滤）
      const filteredPosts = this.skipContentFilter
        ? Array.from(newPosts)
        : Array.from(newPosts).filter((post) => {
            const hasTitle = post.querySelector("h2");
            const hasContent = post.querySelector("p");
            return hasTitle && hasContent;
          });

      this.currentPage++;

      if (filteredPosts.length > 0) {
        this.emptyPageCount = 0;
        this.insertPosts(filteredPosts);

        if (filteredPosts.length < this.minPostsThreshold) {
          this.showComplete();
        }
      } else {
        this.emptyPageCount++;
        if (this.emptyPageCount >= 1) this.showComplete();
      }
    } catch (e) {
      this.showError(() => this.handleClick());
    }
  }

  insertPosts(filteredPosts) {
    const fragment = document.createDocumentFragment();
    const newNodes = [];

    filteredPosts.forEach((post) => {
      const clonedPost = post.cloneNode(true);
      const innerDiv = clonedPost.querySelector(".overflow-hidden.rounded-2xl");
      if (innerDiv) {
        innerDiv.classList.add("opacity-0", "translate-y-4", "transition-all", "duration-300", "ease-out");
      }
      fragment.appendChild(clonedPost);
      newNodes.push(clonedPost);
    });

    if (this.insertPosition === "before") {
      this.postsContainer.insertBefore(fragment, this.container);
    } else {
      this.postsContainer.appendChild(fragment);
    }

    if (this.onInsert) this.onInsert(newNodes);

    this.loadImagesAndAnimate(newNodes);
  }

  loadImagesAndAnimate(nodes) {
    nodes.forEach((node) => loadPostImages(node));
    setTimeout(() => {
      nodes.forEach((node) => {
        const innerDiv = node.querySelector(".overflow-hidden.rounded-2xl");
        if (innerDiv) {
          innerDiv.classList.remove("opacity-0", "translate-y-4");
        }
      });
    }, 50);
  }
}

// ┌─────────────────────────────────────────┐
// │ 8.2 单一通用初始化方法                   │
// └─────────────────────────────────────────┘
function initLoadMoreForPage(options) {
  const container = options.container || document.getElementById("load-more-container");
  const postsContainer = document.querySelector(options.postsContainerSelector);

  if (!container || !postsContainer) return null;

  return new LoadMoreButton({
    container: container,
    postsContainer: postsContainer,
    getNextPageUrl: options.getNextPageUrl,
    postSelector: options.postSelector,
    insertPosition: options.insertPosition,
    minPostsThreshold: options.minPostsThreshold,
    onInsert: options.onInsert,
    skipContentFilter: options.skipContentFilter,
    i18n: options.i18n,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. 文章功能模块 - Post Features Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 文章阅读时间统计、点赞功能、目录生成

// ┌─────────────────────────────────────────┐
// │ 9.1 阅读时间和字数统计                   │
// └─────────────────────────────────────────┘
const readingTime = {
  i18n: {
    read: "分钟阅读",
    words: "字",
  },

  setI18n(i18nObj) {
    this.i18n = { ...this.i18n, ...i18nObj };
  },

  calculate() {
    const contentEl = document.querySelector(".prose");
    if (!contentEl) return;

    const text = contentEl.textContent || contentEl.innerText || "";

    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = text.replace(/[\u4e00-\u9fff]/g, "").match(/[a-zA-Z]+/g)?.length || 0;
    const totalWords = chineseChars + englishWords;
    const readingSpeed = 225;
    const minutes = Math.ceil(totalWords / readingSpeed);
    this.updateDisplay(totalWords, minutes);
  },

  updateDisplay(wordCount, minutes) {
    const readingTimeEl = document.getElementById("number");
    if (!readingTimeEl) return;
    readingTimeEl.textContent = `${minutes} ${this.i18n.read} · ${wordCount.toLocaleString()} ${this.i18n.words}`;
  },
};

// ┌─────────────────────────────────────────┐
// │ 9.2 文章点赞功能                        │
// └─────────────────────────────────────────┘
class Upvote {
  constructor(storageKey, plural, apiEndpoint = "/apis/api.halo.run/v1alpha1/trackers/upvote", i18n = {}, group = "content.halo.run", selectors = {}) {
    this.storageKey = storageKey;
    this.plural = plural;
    this.apiEndpoint = apiEndpoint;
    this.group = group;
    this.i18n = Object.assign(
      {
        likedTitle: "人已点赞",
        subtitle1: "点个赞支持一下呗~",
        subtitle2: "感谢您的支持",
      },
      i18n,
    );

    // 自定义选择器配置
    this.selectors = Object.assign(
      {
        btnClass: ".upvote-btn",
        headerBtnClass: ".header-upvote-btn",
        btnAttr: '[data-article-name="{name}"]',
        headerBtnAttr: '[data-article-name="{name}"]',
        count: '[data-upvote-post-name="{name}"]',
        header: '[data-upvote-header-name="{name}"]',
        sidebar: '[data-upvote-sidebar-name="{name}"]',
      },
      selectors,
    );

    this.liked = [];
    this.processing = false;
    this.elementsCache = new Map();
  }

  init() {
    this.liked = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
    document.addEventListener("click", this.handleClick.bind(this));
    this.liked.forEach((articleName) => this.setLikedState(articleName));
  }

  handleClick(e) {
    const btn = e.target.closest(".upvote-btn, .header-upvote-btn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    // 从按钮的 data 属性中查找名称（支持 data-article-name, data-moment-name 等）
    const articleName = btn.dataset.articleName || btn.dataset.momentName;
    if (articleName) this.click(articleName);
  }

  async click(articleName) {
    if (this.liked.includes(articleName) || this.processing) return;

    this.processing = true;

    try {
      await axios.post(this.apiEndpoint, {
        group: this.group,
        plural: this.plural,
        name: articleName,
      });

      this.liked.push(articleName);
      localStorage.setItem(this.storageKey, JSON.stringify(this.liked));

      const elements = this.getElements(articleName);
      const newCount = this.getCurrentCount(elements) + 1;

      // 保留原有计数逻辑
      this.updateCounts(elements, newCount);
      this.updateButtons(elements, newCount);
    } catch (err) {
      console.error("点赞失败，请重试");
    } finally {
      this.processing = false;
    }
  }

  setLikedState(articleName) {
    const elements = this.getElements(articleName);
    const currentCount = this.getCurrentCount(elements);
    this.updateButtons(elements, currentCount);
  }

  getElements(articleName) {
    if (!this.elementsCache.has(articleName)) {
      const btnSelector = this.selectors.btnClass + this.selectors.btnAttr.replace("{name}", articleName);
      const headerBtnSelector = this.selectors.headerBtnClass + this.selectors.headerBtnAttr.replace("{name}", articleName);

      this.elementsCache.set(articleName, {
        btn: document.querySelector(btnSelector),
        headerBtn: document.querySelector(headerBtnSelector),
        count: document.querySelector(this.selectors.count.replace("{name}", articleName)),
        header: document.querySelector(this.selectors.header.replace("{name}", articleName)),
        sidebar: document.querySelector(this.selectors.sidebar.replace("{name}", articleName)),
      });
    }
    return this.elementsCache.get(articleName);
  }

  getCurrentCount(elements) {
    for (const el of [elements.count, elements.header, elements.sidebar]) {
      if (el?.textContent) return parseInt(el.textContent);
    }
    return 0;
  }

  updateCounts(elements, newCount) {
    [elements.count, elements.header, elements.sidebar].forEach((el) => {
      if (el) el.textContent = newCount;
    });
    if (elements.sidebar) {
      elements.sidebar.style.transform = "scale(1.2)";
      elements.sidebar.style.color = "#ef4444";
      setTimeout(() => (elements.sidebar.style.cssText = ""), 300);
    }
  }

  updateButtons(elements, newCount) {
    const { likedTitle, subtitle1, subtitle2 } = this.i18n;

    if (elements.btn) {
      elements.btn.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <i class="fas fa-heart text-red-500"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">${newCount} ${likedTitle}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">${subtitle2}</p>
          </div>
        </div>`;
      elements.btn.disabled = true;
      elements.btn.classList.add("cursor-not-allowed");
      elements.btn.classList.remove("hover:scale-105", "group");
    }

    if (elements.headerBtn) {
      elements.headerBtn.disabled = true;
      elements.headerBtn.classList.add("cursor-not-allowed");
      elements.headerBtn.classList.remove("hover:scale-105", "hover:text-red-500");

      const heart = elements.headerBtn.querySelector("i.fas.fa-heart");
      if (heart) heart.className = "fas fa-heart text-red-500 transition-transform";
    }
  }
}
// ┌─────────────────────────────────────────┐
// │ 9.3 文章目录功能                        │
// └─────────────────────────────────────────┘
function Tocbot() {
  const content = document.querySelector(".prose");
  const titles = content?.querySelectorAll("h1, h2, h3, h4, h5");
  const tocContainer = document.getElementById("tocbot");

  if (!titles?.length) {
    tocContainer?.classList.add("hidden");
    return;
  }
  tocbot.init({
    tocSelector: ".toc",
    contentSelector: ".prose",
    headingSelector: "h1, h2, h3, h4, h5",
    collapseDepth: 4,
    headingsOffset: 100,
    scrollSmooth: true,
    scrollSmoothOffset: 0,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. 分类阅读量统计模块 - Category View Count Module
// ═══════════════════════════════════════════════════════════════════════════════

// ┌─────────────────────────────────────────┐
// │ 10.1 分类阅读量统计功能                  │
// └─────────────────────────────────────────┘
class CategoryViewCount {
  constructor(i18n = {}) {
    this.i18n = Object.assign(
      {
        readLabel: "阅读",
      },
      i18n,
    );
  }
  // 获取分类阅读量
  async getCategoryViews(categoryName) {
    try {
      const { data } = await axios.get(`/apis/api.content.halo.run/v1alpha1/categories/${categoryName}/posts`);
      return data?.items?.reduce((sum, post) => sum + (post.stats?.visit ?? 0), 0) ?? 0;
    } catch (error) {
      console.error("获取分类阅读量失败:", error);
      return 0;
    }
  }
  // 格式化阅读量
  formatViews(views) {
    if (views >= 10000) return (views / 10000).toFixed(1) + "w";
    if (views >= 1000) return (views / 1000).toFixed(1) + "k";
    return views.toString();
  }
  // 更新显示
  async updateDisplay(categoryName) {
    const element = document.getElementById("category-visit");
    if (!element) return;

    const totalViews = await this.getCategoryViews(categoryName);
    element.textContent = `${this.formatViews(totalViews)} ${this.i18n.readLabel}`;
  }
  // 初始化
  init() {
    const id = document.querySelector('[id^="items-"]')?.id;
    if (!id) return;
    this.updateDisplay(id.replace("items-", ""));
  }
}
// ┌─────────────────────────────────────────┐
// │ 10.2 标签阅读量统计功能                  │
// └─────────────────────────────────────────┘
class TagViewCount {
  constructor(i18n = {}) {
    this.i18n = Object.assign(
      {
        readLabel: "阅读", // 默认中文
      },
      i18n,
    );
  }
  // 获取标签阅读量
  async getTagViews(tagName) {
    try {
      const { data } = await axios.get(`/apis/api.content.halo.run/v1alpha1/tags/${tagName}/posts`);
      return data?.items?.reduce((sum, post) => sum + (post.stats?.visit ?? 0), 0) ?? 0;
    } catch (error) {
      console.error("获取标签阅读量失败:", error);
      return 0;
    }
  }
  // 格式化阅读量
  formatViews(views) {
    if (views >= 10000) return (views / 10000).toFixed(1) + "w";
    if (views >= 1000) return (views / 1000).toFixed(1) + "k";
    return views.toString();
  }
  // 更新显示
  async updateDisplay(tagName) {
    const element = document.getElementById("tag-visit");
    if (!element) return;

    const totalViews = await this.getTagViews(tagName);
    element.textContent = `${this.formatViews(totalViews)} ${this.i18n.readLabel}`;
  }
  // 初始化
  init() {
    const id = document.querySelector('[id^="items-"]')?.id;
    if (!id) return;
    this.updateDisplay(id.replace("items-", ""));
  }
}
// ┌─────────────────────────────────────────┐
// │ 10.3 分享模块                 │
// └─────────────────────────────────────────┘
function shareModalInstance() {
  const shareModal = document.getElementById("shareModal");
  const modalContent = document.getElementById("shareContent");
  const closeBtn = document.getElementById("shareClose");
  const shareInput = document.getElementById("shareUrlInput");
  const copyBtn = document.getElementById("copyBtn");
  const copySuccess = document.getElementById("copySuccess");

  if (!shareModal || !modalContent || !closeBtn || !shareInput || !copyBtn || !copySuccess) {
    return;
  }

  function preventScroll(e) {
    e.preventDefault();
  }
  function openModal(url) {
    shareInput.value = url;
    document.body.style.overflow = "hidden";
    document.body.addEventListener("touchmove", preventScroll, { passive: false });
    shareModal.classList.remove("hidden");
    modalContent.classList.add("scale-97");
    shareModal.classList.add("opacity-0");
    requestAnimationFrame(() => {
      shareModal.classList.add("flex");
      shareModal.classList.remove("opacity-0");
      modalContent.classList.remove("scale-97");
    });
    copySuccess.classList.add("hidden");
  }
  closeBtn.onclick = () => {
    document.body.style.overflow = "";
    document.body.removeEventListener("touchmove", preventScroll);
    shareModal.classList.add("opacity-0");
    modalContent.classList.add("scale-97");
    setTimeout(() => {
      shareModal.classList.add("hidden");
      shareModal.classList.remove("flex");
    }, 200);
  };
  function copyLink() {
    shareInput.select();
    shareInput.setSelectionRange(0, 99999);
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareInput.value);
      } else {
        document.execCommand("copy");
      }
      copySuccess.classList.remove("hidden");
      setTimeout(() => copySuccess.classList.add("hidden"), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  }

  shareInput.onclick = copyBtn.onclick = copyLink;

  document.addEventListener("click", function (e) {
    const shareBtn = e.target.closest(".moment-share-btn");
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();
      const url = window.location.origin + shareBtn.dataset.shareUrl;
      openModal(url);
    }
  });
  document.addEventListener(
    "touchend",
    function (e) {
      const shareBtn = e.target.closest(".moment-share-btn");
      if (shareBtn) {
        e.preventDefault();
        e.stopPropagation();
        const url = window.location.origin + shareBtn.dataset.shareUrl;
        openModal(url);
      }
    },
    { passive: false },
  );
}
// ═══════════════════════════════════════════════════════════════════════════════
// 11. 工具函数模块 - Utility Functions Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 通用工具函数、页面初始化
// ┌─────────────────────────────────────────┐
// │ Follow Card 样式与国际化初始化          │
// └─────────────────────────────────────────┘
function styleFollowCard() {
  const host = document.querySelector("follow-card");
  if (!host || !host.shadowRoot) return;

  const shadow = host.shadowRoot;

  // 注入样式（防止重复添加）
  if (!shadow.querySelector("style[data-follow-style]")) {
    const style = document.createElement("style");
    style.setAttribute("data-follow-style", "true");
    style.textContent = `
      form {
        max-width: 28rem !important;
        margin: 0 auto;
      }
      .subscribe-card {
        margin-top: 1rem;
      }
      .flex-col {
        flex-direction: row !important;
      }
      .input-wrapper {
        display: flex;
        align-items: center;
      }
      input {
        padding: 10px 2rem !important;
        font-size: 14px !important;
        text-align: center;
      }
      button {
        padding: 0px 1rem !important;
        font-size: 14px !important;
        box-shadow: none !important;
        width: fit-content !important;
      }
      button:hover {
        transform: none !important;
      }
      @media (min-width: 640px) {
        button {
          padding: 0px 2rem !important;
          width: fit-content !important;
        }
        input {
          padding: 10px 3rem !important;
          font-size: 14px !important;
        }
      }
    `;
    shadow.appendChild(style);
  }

  // 移除按钮图标
  shadow.querySelectorAll("button svg").forEach((el) => el.remove());

  // 应用国际化文本
  const input = shadow.querySelector("input");
  const button = shadow.querySelector("button");
  const placeholder = window.i18nPlaceholder || "";
  const buttonText = window.i18nButtonText || "";

  if (input) input.placeholder = placeholder;
  if (button) button.textContent = buttonText;
}

// ┌─────────────────────────────────────────┐
// │ 初始化 Follow Card（公共入口）          │
// └─────────────────────────────────────────┘
function initFollowCard() {
  document.addEventListener("DOMContentLoaded", () => {
    styleFollowCard();
    const observer = new MutationObserver(() => {
      const card = document.querySelector("follow-card");
      if (card && card.shadowRoot) {
        styleFollowCard();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
// ═══════════════════════════════════════════════════════════════════════════════
// 12. 回到顶部模块 - Back to Top Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 平滑滚动到页面顶部，仅在滚动时显示
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;
    let hideTimer = null;
    const SCROLL_THRESHOLD = 300;
    const HIDE_DELAY = 2000;
    const show = () => btn.classList.replace("opacity-0", "opacity-100") && btn.classList.replace("pointer-events-none", "pointer-events-auto");
    const hide = () => btn.classList.replace("opacity-100", "opacity-0") && btn.classList.replace("pointer-events-auto", "pointer-events-none");
    const onScroll = () => {
      clearTimeout(hideTimer);
      if ((window.pageYOffset || document.documentElement.scrollTop) > SCROLL_THRESHOLD) {
        show();
        hideTimer = setTimeout(hide, HIDE_DELAY);
      } else {
        hide();
      }
    };
    const scrollToTop = () => {
      clearTimeout(hideTimer);
      hide();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", scrollToTop);
  });
})();
// ═══════════════════════════════════════════════════════════════════════════════
// 13. 赞赏模块 - Donate Module
// ═══════════════════════════════════════════════════════════════════════════════
// 功能: 赞赏模态框控制，支持打开、关闭、背景点击关闭
function initDonateModal() {
  const donateModal = document.getElementById("donateModal");
  const donateContent = document.getElementById("donateContent");
  const showDonateBtn = document.getElementById("showDonateBtn");
  const donateClose = document.getElementById("donateClose");

  if (!donateModal || !donateContent || !showDonateBtn || !donateClose) return;

  let scrollPosition = 0;
  const ANIMATION_DURATION = 200;

  const lockBodyScroll = () => {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    document.body.style.cssText = `position: fixed; top: -${scrollPosition}px; width: 100%`;
  };

  const unlockBodyScroll = () => {
    document.body.style.cssText = "";
    window.scrollTo(0, scrollPosition);
  };

  const showModal = () => {
    donateModal.classList.remove("hidden");
    donateContent.classList.add("scale-97");
    donateModal.classList.add("opacity-0");
    requestAnimationFrame(() => {
      donateModal.classList.remove("opacity-0");
      donateContent.classList.remove("scale-97");
    });
  };

  const hideModal = () => {
    donateModal.classList.add("opacity-0");
    donateContent.classList.add("scale-97");
    setTimeout(() => donateModal.classList.add("hidden"), ANIMATION_DURATION);
  };

  const openModal = () => {
    if (!donateModal.classList.contains("hidden")) return;
    lockBodyScroll();
    showModal();
  };

  const closeModal = () => {
    hideModal();
    setTimeout(unlockBodyScroll, ANIMATION_DURATION);
  };

  showDonateBtn.addEventListener("click", openModal);
  donateClose.addEventListener("click", closeModal);
  donateModal.addEventListener("click", (e) => e.target === donateModal && closeModal());
}
