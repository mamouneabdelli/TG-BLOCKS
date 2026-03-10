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
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) current = s.id; });
    navLinks.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }, { passive: true });

  // ── Drag & Drop Workspace ──
  const toolboxBlocks = document.querySelectorAll(".block-item");
  const dropZone      = document.getElementById("dropZone");
  const codeOutput    = document.getElementById("codeOutput");
  const clearBtn      = document.getElementById("clearBtn");
  const placeholder   = document.getElementById("canvasPlaceholder");
  const canvasArea    = document.getElementById("canvasArea");
  const langTabs      = document.querySelectorAll(".lang-tab");

  if (!dropZone) return;

  // Inject SVG connector layer
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "connectorSvg";
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  dropZone.appendChild(svg);

  let blockCount   = 0;
  let currentLang  = "js";
  let dragSourceId = null;
  let dragOffsetX  = 0, dragOffsetY = 0;

  // Block chain — ordered list of block IDs for connections
  const blockChain = [];  // [ {id, el} ]

  const BLOCK_COLORS = {
    loop:      "#f97316",
    condition: "#3b82f6",
    action:    "#22c55e",
    variable:  "#a855f7",
  };

  // ── Toolbox → canvas drag ──
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
    const inputVal  = e.dataTransfer.getData("inputVal");

    if (blockType) {
      const rect = canvasArea.getBoundingClientRect();
      const x = e.clientX - rect.left - 85;
      const y = e.clientY - rect.top  - 22;
      createDroppedBlock(blockType, x, y, inputVal);
    } else if (dragSourceId) {
      const block = document.getElementById(dragSourceId);
      if (block) {
        const rect = canvasArea.getBoundingClientRect();
        block.style.left = Math.max(0, e.clientX - rect.left - dragOffsetX) + "px";
        block.style.top  = Math.max(0, e.clientY - rect.top  - dragOffsetY) + "px";
      }
    }
    updateCode();
    drawConnectors();
  });

  // ── Build a dropped block ──
  function createDroppedBlock(type, x, y, val = "") {
    if (placeholder) placeholder.style.opacity = "0";

    const block = document.createElement("div");
    block.className = `dropped-block block-${type}`;
    block.id = "db-" + (blockCount++);
    block.draggable = true;

    const icons  = { loop: "🔁", condition: "❓", action: "▶", variable: "📦" };
    const labels = { loop: "Loop", condition: "If Condition", action: "Action", variable: "Variable" };

    // Build inner HTML based on type
    let bodyHTML = "";
    if (type === "loop") {
      bodyHTML = `
        <div class="block-body">
          <label>repeat:</label>
          <input class="bi-input bi-main" data-role="main" type="text" placeholder="10" value="${val}" spellcheck="false"/>
          <label>times</label>
        </div>
        <div class="block-body block-body-tall">
          <label>body:</label>
          <textarea class="bi-textarea" data-role="body" placeholder="// loop body" spellcheck="false"></textarea>
        </div>`;
    } else if (type === "condition") {
      bodyHTML = `
        <div class="block-body">
          <label>if:</label>
          <input class="bi-input bi-main" data-role="main" type="text" placeholder="x > 0" value="${val}" spellcheck="false"/>
        </div>
        <div class="block-body block-body-tall">
          <label>body:</label>
          <textarea class="bi-textarea" data-role="body" placeholder="// condition body" spellcheck="false"></textarea>
        </div>`;
    } else if (type === "action") {
      bodyHTML = `
        <div class="block-body">
          <label>call:</label>
          <input class="bi-input bi-main" data-role="main" type="text" placeholder="greet" value="${val}" spellcheck="false"/>
          <label>()</label>
        </div>
        <div class="block-body block-body-tall">
          <label>body:</label>
          <textarea class="bi-textarea" data-role="body" placeholder="// function body" spellcheck="false"></textarea>
        </div>`;
    } else if (type === "variable") {
      bodyHTML = `
        <div class="block-body">
          <label>name:</label>
          <input class="bi-input bi-main" data-role="main" type="text" placeholder="x" value="${val}" spellcheck="false"/>
        </div>
        <div class="block-body">
          <label>value:</label>
          <input class="bi-input" data-role="value" type="text" placeholder="0" spellcheck="false"/>
        </div>`;
    }

    block.innerHTML = `
      <div class="block-header">
        <span class="bi-icon">${icons[type]}</span>
        <span class="bi-label">${labels[type]}</span>
        <button class="delete-block" title="Remove">✕</button>
      </div>
      ${bodyHTML}
    `;

    block.style.left = Math.max(4, x) + "px";
    block.style.top  = Math.max(4, y) + "px";
    block.dataset.type = type;

    // Move within canvas
    block.addEventListener("dragstart", e => {
      dragSourceId = block.id;
      const rect = block.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      e.dataTransfer.setData("blockType", "");
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => { block.style.opacity = "0.45"; }, 0);
    });
    block.addEventListener("dragend", () => { block.style.opacity = "1"; drawConnectors(); });

    block.querySelector(".bi-input").addEventListener("input", () => { updateCode(); });

    block.querySelector(".delete-block").addEventListener("click", e => {
      e.stopPropagation();
      // Remove from chain
      const idx = blockChain.findIndex(b => b.id === block.id);
      if (idx !== -1) blockChain.splice(idx, 1);
      block.remove();
      if (dropZone.querySelectorAll(".dropped-block").length === 0) {
        if (placeholder) placeholder.style.opacity = "1";
      }
      updateCode();
      drawConnectors();
    });

    dropZone.appendChild(block);

    // Add to chain
    blockChain.push({ id: block.id, el: block });

    // Auto-position: if not the first block, stack below previous with gap
    autoPosition(block, x, y);

    updateCode();
    drawConnectors();
  }

  function autoPosition(block, x, y) {
    const idx = blockChain.findIndex(b => b.id === block.id);
    if (idx === 0) return; // first block: use dropped position

    // If dropped deliberately (not near default area), keep dropped position
    const prevBlock = blockChain[idx - 1]?.el;
    if (!prevBlock) return;

    // Check if user dropped near a linked position (within 40px of "linked" column)
    const prevLeft = parseInt(prevBlock.style.left, 10) || 40;
    const prevTop  = parseInt(prevBlock.style.top, 10)  || 40;
    const prevH    = prevBlock.offsetHeight || 68;

    // Snap into alignment if dropped within X columns of the prev block
    if (Math.abs(x - prevLeft) < 80) {
      block.style.left = prevLeft + "px";
      block.style.top  = (prevTop + prevH + 28) + "px";
    }
  }

  // ── Draw SVG Bezier connectors between chained blocks ──
  function drawConnectors() {
    // Clear old paths
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const canvasRect = canvasArea.getBoundingClientRect();

    for (let i = 0; i < blockChain.length - 1; i++) {
      const fromEl = blockChain[i].el;
      const toEl   = blockChain[i + 1].el;

      if (!fromEl.isConnected || !toEl.isConnected) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect   = toEl.getBoundingClientRect();

      // Coordinates relative to canvasArea
      const x1 = fromRect.left + fromRect.width / 2  - canvasRect.left;
      const y1 = fromRect.bottom                      - canvasRect.top;
      const x2 = toRect.left   + toRect.width  / 2   - canvasRect.left;
      const y2 = toRect.top                           - canvasRect.top;

      const color1 = BLOCK_COLORS[fromEl.dataset.type] || "#ffffff";
      const color2 = BLOCK_COLORS[toEl.dataset.type]   || "#ffffff";

      // Gradient definition
      const gradId = `grad-${i}`;
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      grad.setAttribute("id", gradId);
      grad.setAttribute("gradientUnits", "userSpaceOnUse");
      grad.setAttribute("x1", x1); grad.setAttribute("y1", y1);
      grad.setAttribute("x2", x2); grad.setAttribute("y2", y2);

      const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", color1); stop1.setAttribute("stop-opacity", "0.85");
      const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", color2); stop2.setAttribute("stop-opacity", "0.85");

      grad.appendChild(stop1); grad.appendChild(stop2);
      defs.appendChild(grad);
      svg.appendChild(defs);

      // Bezier curve: handles go straight down / up
      const cy1 = y1 + Math.abs(y2 - y1) * 0.55;
      const cy2 = y2 - Math.abs(y2 - y1) * 0.55;
      const d = `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`;

      // Glow (thicker, blurred duplicate)
      const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      glowPath.setAttribute("d", d);
      glowPath.setAttribute("fill", "none");
      glowPath.setAttribute("stroke", `url(#${gradId})`);
      glowPath.setAttribute("stroke-width", "6");
      glowPath.setAttribute("stroke-linecap", "round");
      glowPath.setAttribute("opacity", "0.3");
      glowPath.setAttribute("filter", "blur(4px)");
      svg.appendChild(glowPath);

      // Main path
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", `url(#${gradId})`);
      path.setAttribute("stroke-width", "2.5");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-dasharray", "0");
      svg.appendChild(path);

      // Arrow at the end
      const arrowSize = 6;
      const dx = x2 - x1;
      const angle = Math.atan2(y2 - cy2, x2 - x2) * 180 / Math.PI; // always pointing down
      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrow.setAttribute("points", `${x2},${y2} ${x2 - arrowSize},${y2 - arrowSize * 1.6} ${x2 + arrowSize},${y2 - arrowSize * 1.6}`);
      arrow.setAttribute("fill", color2);
      arrow.setAttribute("opacity", "0.9");
      svg.appendChild(arrow);

      // Connection dot at start
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", x1); dot.setAttribute("cy", y1);
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", color1);
      dot.setAttribute("opacity", "0.9");
      svg.appendChild(dot);
    }
  }

  // ── Clear all ──
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      dropZone.innerHTML = "";
      dropZone.appendChild(svg);
      blockChain.length = 0;
      if (placeholder) placeholder.style.opacity = "1";
      codeOutput.textContent = currentLang === "py"
        ? "# Drop blocks to generate code"
        : "// Drop blocks to generate code";
      while (svg.firstChild) svg.removeChild(svg.firstChild);
    });
  }

  // ── Language tabs ──
  langTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      langTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentLang = tab.dataset.lang;
      updateCode();
    });
  });

  // ── Generate code ──
  function getVal(block, role) {
    const el = block.querySelector(`[data-role="${role}"]`);
    if (!el) return '';
    return el.value.trim() || el.placeholder || '';
  }

  function indentBody(raw, indent) {
    if (!raw.trim()) return indent + '// body';
    return raw.split('\n').map(l => indent + l).join('\n');
  }

  function updateCode() {
    const blocks = dropZone.querySelectorAll('.dropped-block');
    if (!blocks.length) {
      codeOutput.textContent = currentLang === 'py' ? '# Drop blocks to generate code' : '// Drop blocks to generate code';
      return;
    }

    const orderedEls = blockChain.map(b => b.el).filter(el => el.isConnected);
    let lines = [];

    if (currentLang === 'java') {
      lines.push('public class Main {');
      lines.push('  public static void main(String[] args) {');
      orderedEls.forEach(block => {
        const type = block.dataset.type;
        const main = getVal(block, 'main');
        const body = getVal(block, 'body');
        const val2 = getVal(block, 'value');
        if (type === 'loop')
          lines.push(`    for (int i = 0; i < ${main}; i++) {\n${indentBody(body, '      ')}\n    }`);
        else if (type === 'condition')
          lines.push(`    if (${main}) {\n${indentBody(body, '      ')}\n    }`);
        else if (type === 'action')
          lines.push(`    void ${main}() {\n${indentBody(body, '      ')}\n    }`);
        else if (type === 'variable')
          lines.push(`    int ${main} = ${val2 || '0'};`);
      });
      lines.push('  }');
      lines.push('}');
    } else if (currentLang === 'js') {
      orderedEls.forEach(block => {
        const type = block.dataset.type;
        const main = getVal(block, 'main');
        const body = getVal(block, 'body');
        const val2 = getVal(block, 'value');
        if (type === 'loop')
          lines.push(`for (let i = 0; i < ${main}; i++) {\n${indentBody(body, '  ')}\n}`);
        else if (type === 'condition')
          lines.push(`if (${main}) {\n${indentBody(body, '  ')}\n}`);
        else if (type === 'action')
          lines.push(`function ${main}() {\n${indentBody(body, '  ')}\n}`);
        else if (type === 'variable')
          lines.push(`let ${main} = ${val2 || '0'};`);
      });
    } else if (currentLang === 'py') {
      orderedEls.forEach(block => {
        const type = block.dataset.type;
        const main = getVal(block, 'main');
        const body = getVal(block, 'body');
        const val2 = getVal(block, 'value');
        if (type === 'loop')
          lines.push(`for i in range(${main}):\n${indentBody(body, '    ')}`);
        else if (type === 'condition')
          lines.push(`if ${main}:\n${indentBody(body, '    ')}`);
        else if (type === 'action')
          lines.push(`def ${main}():\n${indentBody(body, '    ')}`);
        else if (type === 'variable')
          lines.push(`${main} = ${val2 || '0'}`);
      });
    }

    codeOutput.textContent = lines.join('\n\n');
  }
  // Redraw connectors on window resize
  window.addEventListener("resize", drawConnectors, { passive: true });

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
