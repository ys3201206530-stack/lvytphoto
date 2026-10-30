import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const port = 9345;
const url = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${process.cwd()}/.chrome-intro`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let targets = null;
for (let i = 0; i < 60; i += 1) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    if (targets.length > 0) break;
  } catch {}
  await sleep(250);
}

const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
await new Promise((r) => {
  ws.onopen = r;
});
const send = (method, params = {}) =>
  new Promise((res) => {
    id += 1;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url });
await sleep(650);
const shot1 = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
writeFileSync("intro-1.png", Buffer.from(shot1.result.data, "base64"));
await sleep(2600);
const shot2 = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
writeFileSync("intro-2.png", Buffer.from(shot2.result.data, "base64"));
console.log("done");
ws.close();
proc.kill();
