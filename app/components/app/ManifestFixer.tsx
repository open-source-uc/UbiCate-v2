"use client";

import { useEffect } from "react";

export default function ManifestFixer() {
  useEffect(() => {
    const manifestLinkSelector = 'link[rel="manifest"]';
    const head = document.head;
    const body = document.body;

    if (!head || !body) return;

    const manifestInHead = head.querySelector(manifestLinkSelector);
    if (manifestInHead) return; // Ya está en <head>, no hacer nada

    const manifestInBody = body.querySelector(manifestLinkSelector);
    if (manifestInBody) {
      head.appendChild(manifestInBody); // Mover al head
      console.warn("[ManifestFixer] Se movió el manifest del <body> al <head>");
    }
  }, []);

  return null;
}
