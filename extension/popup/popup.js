const api = globalThis.browser ?? globalThis.chrome;
const DEFAULT_MODE = "hide";
const form = document.getElementById("modes");

function loadMode() {
  const defaults = { mode: DEFAULT_MODE };
  const read = globalThis.browser
    ? api.storage.local.get(defaults)
    : new Promise((resolve) => api.storage.local.get(defaults, resolve));
  return read.then((items) => items?.mode ?? DEFAULT_MODE);
}

loadMode().then((mode) => {
  const input = form.querySelector(`input[value="${mode}"]`);
  if (input) input.checked = true;
});

form.addEventListener("change", (event) => {
  api.storage.local.set({ mode: event.target.value });
});
