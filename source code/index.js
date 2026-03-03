"use strict";

document.addEventListener("DOMContentLoaded", function () {

  // ── Theme Toggle ──
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      themeToggle.textContent = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
    });
  }

  // ── Navbar active link on scroll ──
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 80) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }, { passive: true });

  // ── Drag & Drop Workspace ──
  const toolboxBlocks = document.querySelectorAll(".block-item");
  const dropZone = document.getElementById("dropZone");
  const codeOutput = document.getElementById("codeOutput");
  const clearBtn = document.getElementById("clearBtn");
  const placeholder = document.getElementById("canvasPlaceholder");
  const canvasArea = document.getElementById("canvasArea");
  const langTabs = document.querySelectorAll(".lang-tab");

  if (!dropZone) return;

  let blockCount = 0;
  let currentLang = "js";
  let dragSourceId = null;
  let dragOffsetX = 0, dragOffsetY = 0;

  // Toolbox → canvas drag
  toolboxBlocks.forEach(block => {
    block.addEventListener("dragstart", e => {
      dragSourceId = null;
      e.dataTransfer.setData("blockType", block.dataset.type);
      const inputVal = block.querySelector(".bi-input")?.value || "";
      e.dataTransfer.setData("inputVal", inputVal);
      e.dataTransfer.effectAllowed = "copy";
    });
  });

  canvasArea.addEventListener("dragover", e => {
    e.preventDefault();
    canvasArea.classList.add("drag-over");
  });
  canvasArea.addEventListener("dragleave", () => canvasArea.classList.remove("drag-over"));

  canvasArea.addEventListener("drop", e => {
    e.preventDefault();
    canvasArea.classList.remove("drag-over");

    const blockType = e.dataTransfer.getData("blockType");
    const inputVal = e.dataTransfer.getData("inputVal");

    if (blockType) {
      // New block from toolbox
      const rect = canvasArea.getBoundingClientRect();
      const x = e.clientX - rect.left - 75;
      const y = e.clientY - rect.top - 20;
      createDroppedBlock(blockType, x, y, inputVal);
    } else if (dragSourceId) {
      // Moving existing block
      const block = document.getElementById(dragSourceId);
      if (block) {
        const rect = canvasArea.getBoundingClientRect();
        block.style.left = (e.clientX - rect.left - dragOffsetX) + "px";
        block.style.top  = (e.clientY - rect.top  - dragOffsetY) + "px";
      }
    }
    updateCode();
  });

  function createDroppedBlock(type, x, y, val = "") {
    if (placeholder) placeholder.style.opacity = "0";

    const block = document.createElement("div");
    block.className = `dropped-block block-${type}`;
    block.id = "db-" + (blockCount++);
    block.draggable = true;

    const icons = { loop: "🔁", condition: "❓", action: "▶", variable: "📦" };
    const labels = { loop: "Loop", condition: "If", action: "Action", variable: "Var" };
    const placeholders = { loop: "10", condition: "x > 0", action: "greet", variable: "x" };

    block.innerHTML = `
      <span>${icons[type]}</span>
      <span>${labels[type]}</span>
      <input class="bi-input" type="text" placeholder="${placeholders[type]}" value="${val}"/>
      <button class="delete-block" title="Remove">✕</button>
    `;

    block.style.left = Math.max(0, x) + "px";
    block.style.top  = Math.max(0, y) + "px";
    block.dataset.type = type;

    // Move within canvas
    block.addEventListener("dragstart", e => {
      dragSourceId = block.id;
      const rect = block.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.dataTransfer.setData("blockType", "");
      e.dataTransfer.effectAllowed = "move";
    });

    // Update code on input change
    block.querySelector(".bi-input").addEventListener("input", updateCode);

    // Delete block
    block.querySelector(".delete-block").addEventListener("click", e => {
      e.stopPropagation();
      block.remove();
      if (dropZone.querySelectorAll(".dropped-block").length === 0) {
        if (placeholder) placeholder.style.opacity = "1";
      }
      updateCode();
    });

    dropZone.appendChild(block);
  }

  // Clear all
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      dropZone.innerHTML = "";
      if (placeholder) placeholder.style.opacity = "1";
      codeOutput.textContent = currentLang === "js" ? "// Drop blocks to generate code"
        : currentLang === "py" ? "# Drop blocks to generate code"
        : "// Drop blocks to generate code";
    });
  }

  // Language tabs
  langTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      langTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentLang = tab.dataset.lang;
      updateCode();
    });
  });

  function updateCode() {
    const blocks = dropZone.querySelectorAll(".dropped-block");
    if (!blocks.length) {
      codeOutput.textContent = currentLang === "py" ? "# Drop blocks to generate code" : "// Drop blocks to generate code";
      return;
    }

    let lines = [];
    blocks.forEach(block => {
      const type = block.dataset.type;
      const val = block.querySelector(".bi-input")?.value?.trim() || block.querySelector(".bi-input")?.placeholder || "";

      if (currentLang === "js") {
        if (type === "loop")      lines.push(`for (let i = 0; i < ${val}; i++) {\n  // loop body\n}`);
        if (type === "condition") lines.push(`if (${val}) {\n  // condition body\n}`);
        if (type === "action")    lines.push(`${val}();`);
        if (type === "variable")  lines.push(`let ${val} = 0;`);
      } else if (currentLang === "py") {
        if (type === "loop")      lines.push(`for i in range(${val}):\n    # loop body\n    pass`);
        if (type === "condition") lines.push(`if ${val}:\n    # condition body\n    pass`);
        if (type === "action")    lines.push(`${val}()`);
        if (type === "variable")  lines.push(`${val} = 0`);
      } else if (currentLang === "java") {
        if (type === "loop")      lines.push(`for (int i = 0; i < ${val}; i++) {\n    // loop body\n}`);
        if (type === "condition") lines.push(`if (${val}) {\n    // condition body\n}`);
        if (type === "action")    lines.push(`${val}();`);
        if (type === "variable")  lines.push(`int ${val} = 0;`);
      }
    });

    codeOutput.textContent = lines.join("\n\n");
  }

  // ── Feedback form (AJAX) ──
  const feedbackForm = document.getElementById("feedbackForm");
  const formMsg = document.getElementById("formMsg");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const data = new FormData(feedbackForm);
      try {
        const res = await fetch("submit_feedback.php", { method: "POST", body: data });
        const json = await res.json();
        formMsg.className = "form-msg " + (json.success ? "success" : "error");
        formMsg.textContent = json.message;
        if (json.success) feedbackForm.reset();
      } catch {
        formMsg.className = "form-msg error";
        formMsg.textContent = "Something went wrong. Please try again.";
      }
    });
  }

});