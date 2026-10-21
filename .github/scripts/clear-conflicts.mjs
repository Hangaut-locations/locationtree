import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import { keepBoth } from "./keep-both.mjs";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const check = process.env.CHECK;

const headers = () => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

const gh = async (urlPath, options = {}) => {
  const res = await fetch(`https://api.github.com${urlPath}`, {
    ...options,
    headers: { ...headers(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${urlPath} ${res.status} ${await res.text()}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const git = (args) =>
  execFileSync(
    "git",
    [
      "-c",
      "user.name=github-actions[bot]",
      "-c",
      "user.email=41898282+github-actions[bot]@users.noreply.github.com",
      ...args,
    ],
    { encoding: "utf8" },
  );

const safeBranch = (name) =>
  typeof name === "string" &&
  /^[A-Za-z0-9._/-]+$/.test(name) &&
  !name.startsWith("-") &&
  !name.includes("..") &&
  name !== "main" &&
  name !== "master";

const conflictsWithMain = (branch) => {
  try {
    git(["merge-tree", "--write-tree", "origin/main", `origin/${branch}`]);
    return false;
  } catch (err) {
    if (err.status === 1) return true;
    throw err;
  }
};

const conflictingPulls = async () => {
  const pulls = await gh(`/repos/${repo}/pulls?state=open&base=main&per_page=100`);
  git(["fetch", "origin", "main"]);
  const found = [];
  for (const pull of pulls) {
    if (pull.head?.repo?.full_name !== repo) continue;
    if (!safeBranch(pull.head.ref)) continue;
    git(["fetch", "origin", pull.head.ref]);
    if (!conflictsWithMain(pull.head.ref)) continue;
    console.log(`#${pull.number} conflicts with main`);
    found.push(pull);
  }
  return found;
};

const unmerged = () =>
  git(["diff", "--name-only", "--diff-filter=U"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const resolveFiles = (files) => {
  for (const file of files) {
    const buf = fs.readFileSync(file);
    if (buf.includes(0)) throw new Error(`${file} is binary, so both sides cannot be kept`);
    const next = keepBoth(buf.toString("utf8"));
    if (next.includes("<<<<<<<") || next.includes(">>>>>>>")) {
      throw new Error(`${file} still has conflict markers`);
    }
    fs.writeFileSync(file, next);
  }
};

const finishMerge = () => {
  git([
    "-c",
    "user.name=github-actions[bot]",
    "-c",
    "user.email=41898282+github-actions[bot]@users.noreply.github.com",
    "commit",
    "-m",
    "merge main and keep both sides",
  ]);
};

const markerFor = (head, base) => `<!-- conflict-bot ${head} ${base} -->`;

const alreadyNoted = async (number, head, base) => {
  const comments = await gh(`/repos/${repo}/issues/${number}/comments?per_page=30`);
  const tag = markerFor(head, base);
  return comments.some((comment) => String(comment.body || "").includes(tag));
};

const note = async (number, head, base, detail) => {
  if (await alreadyNoted(number, head, base)) return;
  const clipped = String(detail || "").trim().slice(0, 1500);
  const body = [
    "This branch conflicted with main. Both sides were kept, but the result did not pass the check, so the branch was left as it was.",
    "",
    "```",
    clipped || "no extra detail",
    "```",
    "",
    markerFor(head, base),
  ].join("\n");
  await gh(`/repos/${repo}/issues/${number}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
};

const restore = (branch) => {
  try {
    git(["merge", "--abort"]);
  } catch {
    /* the merge was already finished or never started */
  }
  git(["reset", "--hard", `origin/${branch}`]);
};

const errorText = (err) =>
  [err.stdout, err.stderr, err.detail, err.message].filter(Boolean).join("\n");

const contentFailure = (err) => {
  const text = errorText(err);
  return (
    text.includes("check failed") ||
    text.includes("conflict markers") ||
    text.includes("still unmerged") ||
    text.includes("is binary")
  );
};

const runCheck = () => {
  execSync("npm ci", { stdio: "inherit" });
  try {
    const out = execSync(check, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (out) console.log(out);
  } catch (err) {
    const detail = errorText(err);
    console.error(detail);
    const wrapped = new Error("check failed");
    wrapped.detail = detail;
    throw wrapped;
  }
};

const fixOne = async (pull) => {
  const branch = pull.head.ref;
  const head = pull.head.sha;
  const base = pull.base.sha;
  if (await alreadyNoted(pull.number, head, base)) {
    console.log(`#${pull.number} was already left alone for this main`);
    return;
  }
  git(["fetch", "origin", "main", branch]);
  git(["checkout", "-B", branch, `origin/${branch}`]);
  const before = git(["rev-parse", "HEAD"]).trim();
  try {
    try {
      git(["merge", "origin/main", "-m", "merge main and keep both sides"]);
    } catch (err) {
      const files = unmerged();
      if (files.length === 0) throw err;
      resolveFiles(files);
      git(["add", "--", ...files]);
      if (unmerged().length) throw new Error(`still unmerged: ${unmerged().join(", ")}`);
      finishMerge();
    }
    if (git(["rev-parse", "HEAD"]).trim() === before) {
      console.log(`#${pull.number} already has main`);
      return;
    }
    runCheck();
    git(["push", "origin", `HEAD:refs/heads/${branch}`]);
    console.log(`cleared #${pull.number} on ${branch}`);
  } catch (err) {
    console.error(`#${pull.number} was left as it was`);
    try {
      restore(branch);
    } catch (restoreErr) {
      console.error(errorText(restoreErr));
    }
    if (!contentFailure(err)) throw err;
    await note(pull.number, head, base, errorText(err));
  }
};

const main = async () => {
  if (!repo || !token) throw new Error("GITHUB_REPOSITORY and GH_TOKEN are required");
  if (!check) throw new Error("CHECK is required");
  const pulls = await conflictingPulls();
  if (pulls.length === 0) {
    console.log("no conflicting pull requests");
    return;
  }
  for (const pull of pulls) await fixOne(pull);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
