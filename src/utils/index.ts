import { KeyboardEvent } from "react";

export function generateId() {
  return crypto.randomUUID();
}

export function handleSaveOnInputEnter(
  e: KeyboardEvent<HTMLInputElement>,
  cb: Function
) {
  if (e.key !== "Enter") {
    return;
  }

  cb();
}

export function handleSaveOnTextAreaEnter(
  e: KeyboardEvent<HTMLTextAreaElement>,
  cb: Function
) {
  if (e.key === "Enter" && e.shiftKey) {
    cb();
  }
}
