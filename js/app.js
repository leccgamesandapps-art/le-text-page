// Shared UI helpers

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function setupTopbar({ isDashboard = false } = {}) {
  const user = getCurrentUser();
  const accountBtn = document.getElementById("accountBtn");
  const plusBtn = document.getElementById("plusBtn");
  const plusMenu = document.getElementById("plusMenu");
  const plusClose = document.getElementById("plusClose");
  const menuUser = document.getElementById("menuUser");

  if (accountBtn) {
    if (user) {
      accountBtn.textContent = user.username;
      accountBtn.onclick = () => {
        if (isDashboard) {
          // stay or go settings
        } else {
          window.location.href = "dashboard.html";
        }
      };
    } else {
      accountBtn.textContent = "Start";
      accountBtn.onclick = () => (window.location.href = "start.html");
    }
  }

  if (plusBtn && plusMenu) {
    plusBtn.onclick = (e) => {
      e.stopPropagation();
      if (!user && !isDashboard) {
        // Guest cannot open create menu
        alert("Please login or register to create pages.");
        return;
      }
      plusMenu.classList.toggle("open");
    };

    if (plusClose) {
      plusClose.onclick = () => plusMenu.classList.remove("open");
    }

    document.addEventListener("click", (e) => {
      if (!plusMenu.contains(e.target) && e.target !== plusBtn) {
        plusMenu.classList.remove("open");
      }
    });

    if (menuUser && user) {
      menuUser.textContent = user.username;
    }

    // Menu links – only enable for logged-in users
    const createLink = document.getElementById("menuCreate");
    const pagesLink = document.getElementById("menuPages");
    const settingsLink = document.getElementById("menuSettings");

    if (!user) {
      [createLink, pagesLink, settingsLink].forEach(el => {
        if (el) {
          el.style.opacity = "0.4";
          el.style.pointerEvents = "none";
        }
      });
    }
  }
}

function renderTextCard(page, base = "main.html") {
  const viewUrl = `${base}?view=${encodeURIComponent(page.textId)}`;
  return `
    <article class="text-card">
      <h3>${escapeHtml(page.title)}</h3>
      <div class="meta">
        by ${escapeHtml(page.username)} · ${formatDate(page.createdAt)}
        ${page.likes && page.likes.length ? ` · ${page.likes.length} likes` : ""}
      </div>
      <a class="btn-view" href="${viewUrl}">View Text</a>
    </article>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
