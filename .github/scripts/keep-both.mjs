const marker =
  /^<<<<<<<[^\n]*\r?\n([\s\S]*?)^=======\r?\n([\s\S]*?)^>>>>>>>[^\n]*\r?\n?/gm;

const propKey = (line) => {
  const match = line.match(
    /^\s*(?:['"]([A-Za-z0-9_]+)['"]|([A-Za-z_][A-Za-z0-9_]*))\s*:/,
  );
  return match ? match[1] || match[2] : null;
};

const linesOf = (side) => {
  if (side === "" || side === "\n") return [];
  return side.replace(/\n$/, "").split("\n");
};

/** Keep the lines from both sides of one conflict. A repeated property keeps the longer line. */
export const joinSides = (ours, theirs) => {
  if (ours.trim() === theirs.trim()) return ours.endsWith("\n") || ours === "" ? ours : `${ours}\n`;
  const result = linesOf(ours);
  const keyAt = new Map();
  result.forEach((line, index) => {
    const key = propKey(line);
    if (key) keyAt.set(key, index);
  });
  for (const line of linesOf(theirs)) {
    const key = propKey(line);
    if (key && keyAt.has(key)) {
      const at = keyAt.get(key);
      if (line.trim().length > result[at].trim().length) result[at] = line;
      continue;
    }
    if (line.trim() !== "" && result.some((have) => have.trim() === line.trim())) continue;
    result.push(line);
    if (key) keyAt.set(key, result.length - 1);
  }
  return `${result.join("\n")}\n`;
};

export const keepBoth = (text) => text.replace(marker, (_, ours, theirs) => joinSides(ours, theirs));

const assert = (name, actual, expected) => {
  if (actual !== expected) {
    console.error(name);
    console.error("--- actual ---");
    console.error(actual);
    console.error("--- expected ---");
    console.error(expected);
    process.exitCode = 1;
  }
};

if (process.argv[1] && process.argv[1].endsWith("keep-both.mjs")) {
  const ticket = keepBoth(`<<<<<<< free-button
is_ticket_sales: is_ticket_sales ? "true" : "false",
=======
is_ticket_sales: is_ticket_sales,
...(sendTickets && { ticket_options: JSON.stringify(namedTickets) }),
>>>>>>> main
`);
  assert(
    "ticket row keeps the real flag and the extra tickets",
    ticket,
    `is_ticket_sales: is_ticket_sales ? "true" : "false",
...(sendTickets && { ticket_options: JSON.stringify(namedTickets) }),
`,
  );

  assert(
    "different lines both stay",
    keepBoth(`<<<<<<< a
import { A } from "./a";
=======
import { B } from "./b";
>>>>>>> b
`),
    `import { A } from "./a";
import { B } from "./b";
`,
  );

  assert(
    "the same line stays once",
    keepBoth(`<<<<<<< a
const ready = true;
=======
const ready = true;
>>>>>>> b
`),
    "const ready = true;\n",
  );

  assert("a file with no conflict is left alone", keepBoth("const ready = true;\n"), "const ready = true;\n");

  if (process.exitCode) process.exit(process.exitCode);
  console.log("keep-both ok");
}
