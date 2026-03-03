"use client";

import { useEffect } from "react";
import { list } from "@/lib/types";

interface PreviewUpdateMessage {
  type: "cms-preview-update";
  blockTag: string;
  fieldName: string;
  fieldType: string;
  value: string;
}

interface PreviewHighlightMessage {
  type: "cms-preview-highlight";
  blockTag: string;
  fieldName: string;
  active: boolean;
}

type CMSMessage = PreviewUpdateMessage | PreviewHighlightMessage;

const isInIframe = typeof window !== "undefined" && window !== window.parent;

const HIGHLIGHT_CLASS = "cms-preview-highlight";
const HIGHLIGHT_STYLE_ID = "cms-preview-highlight-style";

function ensureHighlightStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    .${HIGHLIGHT_CLASS} {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px;
      transition: outline 0.15s ease;
    }
    ${isInIframe ? `
    [data-cms-field] {
      cursor: pointer;
      transition: outline 0.15s ease;
    }
    [data-cms-field]:hover {
      outline: 1px dashed #3b82f6 !important;
      outline-offset: 2px;
    }
    ` : ""}
  `;
  document.head.appendChild(style);
}

function findField(blockTag: string, fieldName: string): Element | null {
  const block = document.querySelector(`[data-cms-block="${blockTag}"]`);
  if (!block) return null;
  return block.querySelector(`[data-cms-field="${fieldName}"]`);
}

function handleUpdate(msg: PreviewUpdateMessage) {
  const el = findField(msg.blockTag, msg.fieldName);
  if (!el) return;

  switch (msg.fieldType) {
    case "text":
      el.textContent = msg.value;
      break;
    case "richtext":
      el.innerHTML = msg.value;
      break;
    case "image":
      if (el instanceof HTMLImageElement) {
        el.src = msg.value;
      }
      break;
    case "list":
      try {
        const rawItems = JSON.parse(msg.value);
        const items = list({ fieldValue: rawItems });
        if (Array.isArray(items)) {
          el.innerHTML = items
            .map(
              (item) =>
                `<li>${typeof item === "string" ? item : JSON.stringify(item)}</li>`
            )
            .join("");
        }
      } catch {
        // ignore parse errors
      }
      break;
    default:
      el.textContent = msg.value;
  }
}

function handleHighlight(msg: PreviewHighlightMessage) {
  ensureHighlightStyles();
  const el = findField(msg.blockTag, msg.fieldName);
  if (!el) return;

  if (msg.active) {
    el.classList.add(HIGHLIGHT_CLASS);
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    el.classList.remove(HIGHLIGHT_CLASS);
  }
}

function handleMessage(event: MessageEvent) {
  const msg = event.data as CMSMessage;
  if (!msg || typeof msg !== "object" || !msg.type) return;

  if (msg.type === "cms-preview-update") {
    handleUpdate(msg as PreviewUpdateMessage);
  } else if (msg.type === "cms-preview-highlight") {
    handleHighlight(msg as PreviewHighlightMessage);
  }
}

function handleClick(event: MouseEvent) {
  if (!isInIframe) return;
  const target = event.target as Element;
  // Walk up to find nearest data-cms-field
  const fieldEl = target.closest("[data-cms-field]");
  if (!fieldEl) return;
  const blockEl = fieldEl.closest("[data-cms-block]");
  if (!blockEl) return;

  const fieldName = fieldEl.getAttribute("data-cms-field");
  const blockTag = blockEl.getAttribute("data-cms-block");
  if (!fieldName || !blockTag) return;

  window.parent.postMessage(
    { type: "cms-preview-element-click", blockTag, fieldName },
    "*"
  );
}

export function CMSPreviewListener() {
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    if (isInIframe) {
      ensureHighlightStyles();
      document.addEventListener("click", handleClick);
    }
    return () => {
      window.removeEventListener("message", handleMessage);
      if (isInIframe) {
        document.removeEventListener("click", handleClick);
      }
    };
  }, []);

  return null;
}
