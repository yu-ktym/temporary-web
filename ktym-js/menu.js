(() => {
  const initSectionTabs = () => {
    const main = document.querySelector("#main");
    const topicsSection = document.querySelector("#topics");
    const calendarSection = document.querySelector("#calendar");

    if (!main || !topicsSection || !calendarSection) {
      return;
    }

    const sections = [
      { id: "topics", label: "トピックス", element: topicsSection },
      { id: "calendar", label: "行事カレンダー", element: calendarSection }
    ];

    const tabRoot = document.createElement("div");
    tabRoot.className = "section-tabs";
    tabRoot.setAttribute("role", "tablist");
    tabRoot.setAttribute("aria-label", "トピックスと行事カレンダー");

    const buttons = new Map();

    const activateTab = (targetId, options = {}) => {
      const { syncHash = false } = options;

      sections.forEach(({ id, element }) => {
        const isActive = id === targetId;
        const button = buttons.get(id);

        if (button) {
          button.setAttribute("aria-selected", isActive ? "true" : "false");
          button.tabIndex = isActive ? 0 : -1;
        }

        element.hidden = !isActive;
      });

      if (syncHash) {
        history.replaceState(null, "", `#${targetId}`);
      }
    };

    sections.forEach(({ id, label }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "section-tabs__button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", id);
      button.setAttribute("aria-selected", "false");
      button.textContent = label;
      button.addEventListener("click", () => {
        activateTab(id, { syncHash: true });
      });
      buttons.set(id, button);
      tabRoot.appendChild(button);
    });

    main.insertBefore(tabRoot, topicsSection);

    const syncFromHash = () => {
      const targetId = location.hash === "#calendar" ? "calendar" : "topics";
      activateTab(targetId);
    };

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href="#topics"], a[href="#calendar"]');
      if (!anchor) {
        return;
      }

      const targetId = anchor.getAttribute("href").slice(1);
      activateTab(targetId);
    });

    window.addEventListener("hashchange", syncFromHash);
    syncFromHash();
  };

  initSectionTabs();

  const initAboutPreviewToggle = () => {
    const trigger = document.querySelector(".search-shortcut__trigger");
    const preview = document.querySelector("#about-preview");

    if (!trigger || !preview) {
      return;
    }

    const setPreviewState = (open) => {
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      preview.hidden = !open;
    };

    trigger.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      setPreviewState(willOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setPreviewState(false);
      }
    });

    setPreviewState(false);
  };

  initAboutPreviewToggle();

  const body = document.body;
  const toggleButton = document.querySelector(".menu-toggle");
  const closeButton = document.querySelector(".menu-close");
  const nav = document.querySelector("#global-nav-panel");

  if (!body || !toggleButton || !closeButton || !nav) {
    return;
  }

  const mobileMedia = window.matchMedia("(max-width: 47.999rem)");
  let menuButtonAnimation = null;
  let menuCloseTimer = null;

  const animateMenuButton = (open) => {
    if (!mobileMedia.matches || typeof toggleButton.animate !== "function") {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      return;
    }

    if (menuButtonAnimation) {
      menuButtonAnimation.cancel();
    }

    const keyframes = open
      ? [
          { transform: "translateX(0.35rem)", offset: 0 },
          { transform: "translateX(0)", offset: 1 }
        ]
      : [
          { transform: "translateX(-0.35rem)", offset: 0 },
          { transform: "translateX(0)", offset: 1 }
        ];

    menuButtonAnimation = toggleButton.animate(keyframes, {
      duration: 700,
      easing: "cubic-bezier(0.19, 1, 0.22, 1)"
    });

    menuButtonAnimation.addEventListener("finish", () => {
      menuButtonAnimation = null;
    }, { once: true });
  };

  const setMenuState = (open, options = {}) => {
    const { animate = true } = options;

    if (menuCloseTimer) {
      window.clearTimeout(menuCloseTimer);
      menuCloseTimer = null;
    }

    if (!mobileMedia.matches) {
      body.classList.remove("menu-open");
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.setAttribute("aria-label", "メニューを開く");
      nav.hidden = false;
      return;
    }

    const wasOpen = body.classList.contains("menu-open");

    toggleButton.setAttribute("aria-expanded", open ? "true" : "false");
    toggleButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");

    if (open) {
      nav.hidden = false;
      nav.offsetHeight;
      body.classList.add("menu-open");
    } else {
      body.classList.remove("menu-open");

      if (animate && wasOpen) {
        menuCloseTimer = window.setTimeout(() => {
          if (!body.classList.contains("menu-open")) {
            nav.hidden = true;
          }
          menuCloseTimer = null;
        }, 430);
      } else {
        nav.hidden = true;
      }
    }

    if (animate && wasOpen !== open) {
      animateMenuButton(open);
    }
  };

  toggleButton.addEventListener("click", () => {
    const willOpen = toggleButton.getAttribute("aria-expanded") !== "true";
    setMenuState(willOpen);
  });

  closeButton.addEventListener("click", () => {
    setMenuState(false);
  });

  nav.addEventListener("click", (event) => {
    if (!mobileMedia.matches) {
      return;
    }

    if (event.target === nav) {
      setMenuState(false);
      return;
    }

    const anchor = event.target.closest("a");
    if (anchor) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("menu-open")) {
      setMenuState(false);
    }
  });

  const syncViewport = () => {
    setMenuState(false, { animate: false });
  };

  if (typeof mobileMedia.addEventListener === "function") {
    mobileMedia.addEventListener("change", syncViewport);
  } else {
    mobileMedia.addListener(syncViewport);
  }

  syncViewport();
})();
