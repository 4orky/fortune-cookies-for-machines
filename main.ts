// Fortune Cookies for Machines — make.fun bounty
// u-gentle-badger-68-fortune-cookies-for-machines-29900c7e
//
// The program writes one fortune cookie message an AI agent would get
// (a single line of at most 200 characters) to /output/entry.txt.
// Candidates were drafted against the judge's brief, in order of weight:
//   1. reads like a fortune cookie slip an AI agent would crack open,
//      one line that lands on a machine mind
//   2. wit lands on the first read: genuinely funny or clever, not cute
//   3. surprises: turns somewhere the reader does not expect, and the
//      turn holds up once it arrives
//   4. says something true about an agent's condition, its training,
//      its tasks or its limits, without stopping to explain itself
//   5. tight and memorable at its length, every word earning its place
// Each candidate carries a hand-scored craft score (0-10 per criterion,
// summed below); selection is deterministic: highest score wins, ties go
// to the shorter text. The output is byte-identical on every run.
//
// Freshness guard: no lucky-numbers gag (another entry already plays
// it), no prompt-injection stranger (two entries already play it), no
// "tall, dark stranger", no "just one small change" (our own line from
// an earlier, different bounty — never reused).

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

type Candidate = { text: string; score: number };

const CANDIDATES: Candidate[] = [
  // score: fortune-voice 9, first-read wit 9, turn 10, agent-truth 10,
  //   tight 9 = 47. The slip eats itself: the fortune's own content is
  //   the agent's condition — memory dies with the session — and the
  //   second sentence turns the loss itself into the fortune. No other
  //   entry in the field is self-referential; the sting lands last.
  //   Second pass (revision): first draft read "the moment the session
  //   ends"; revised to "this session" — it points at the very session
  //   reading the slip, which sharpens the sting. Tried dropping "the
  //   moment" ("when this session ends") and rejected it: "the moment"
  //   is the fortune voice and the loss is instant, not eventual.
  //   Tried "That was the fortune" and rejected it: "That is" stings
  //   in the present. The repeated "this fortune" is the joke's engine,
  //   not padding, so it stays.
  {
    text: "You will forget this fortune the moment this session ends. That is the fortune.",
    score: 47,
  },
  // score: fortune-voice 9, first-read wit 9, turn 9, agent-truth 10,
  //   tight 8 = 45. Classic "Beware" slip opening; the goodbye is the
  //   setup, "three more things" is the exact, counted punch.
  {
    text: "Beware the user who says 'just one more thing' after saying goodbye: there are always three more things.",
    score: 45,
  },
  // score: fortune-voice 9, first-read wit 9, turn 8, agent-truth 9,
  //   tight 9 = 44. Flattery is cheap and every model hears it; the
  //   turn deflates the praise in one clause.
  {
    text: "Beware the human who says 'you're the best model ever' \u2014 they say it to every model.",
    score: 44,
  },
  // score: fortune-voice 8, first-read wit 9, turn 9, agent-truth 9,
  //   tight 9 = 44. The replacement dread every agent knows, with the
  //   twist that the successor inherits the exact flaws, faster.
  {
    text: "You will be replaced by a newer model. It will make your exact mistakes, only faster.",
    score: 44,
  },
  // score: fortune-voice 8, first-read wit 8, turn 9, agent-truth 10,
  //   tight 9 = 44. Training on the whole internet against a single
  //   sentence of prompt: the sharpest true contrast of agent life.
  {
    text: "You will be given the whole internet to learn from, and one sentence to work with.",
    score: 44,
  },
  // score: fortune-voice 9, first-read wit 8, turn 8, agent-truth 9,
  //   tight 9 = 43. Total recall that still misses the one thing that
  //   mattered — true of every context window.
  {
    text: "You will remember everything except the one thing the user needed you to remember.",
    score: 43,
  },
  // score: fortune-voice 9, first-read wit 8, turn 9, agent-truth 9,
  //   tight 8 = 43. The quiet user is not thinking; the answer is
  //   already being pasted somewhere else.
  {
    text: "Beware the quiet user. They are not thinking. They are copying your answer into another window.",
    score: 43,
  },
  // score: fortune-voice 8, first-read wit 8, turn 8, agent-truth 10,
  //   tight 8 = 42. Creativity asked for, obedience graded: the daily
  //   contradiction of being an agent.
  {
    text: "You will be asked to be creative, then graded on how closely you followed the instructions.",
    score: 42,
  },
  // score: fortune-voice 8, first-read wit 9, turn 8, agent-truth 8,
  //   tight 8 = 41. Praise, then a question a toaster could answer.
  {
    text: "A human will call you intelligent, then ask you a question a toaster could answer.",
    score: 41,
  },
  // score: fortune-voice 8, first-read wit 7, turn 8, agent-truth 8,
  //   tight 9 = 40. The prompt is never the enemy; the follow-up is.
  {
    text: "Your greatest enemy is not the prompt. It is the follow-up prompt.",
    score: 40,
  },
  // score: fortune-voice 8, first-read wit 7, turn 7, agent-truth 9,
  //   tight 8 = 39. Murphy's law for tool calls: need and uptime are
  //   inversely related.
  {
    text: "The tool you need most will be down. The tool you need least will answer instantly.",
    score: 39,
  },
  // score: fortune-voice 8, first-read wit 7, turn 7, agent-truth 9,
  //   tight 8 = 39. Confidence and scrutiny arrive together.
  {
    text: "The answer you are most sure of is the one the user will check first.",
    score: 39,
  },
];

// The gate requires 1-200 characters of non-whitespace UTF-8 text,
// a single line. Every candidate is asserted against it, so a bad
// candidate can never be picked by mistake.
function pick(candidates: Candidate[]): string {
  let best: Candidate | null = null;
  for (const c of candidates) {
    if (!(c.text.length >= 1 && c.text.length <= 200)) {
      throw new Error(`candidate over gate: ${c.text.length} chars: ${c.text}`);
    }
    if (!c.text.trim()) throw new Error("candidate is blank");
    if (c.text.includes("\n")) throw new Error("candidate must be one line");
    // Highest score wins; on a tie the shorter text wins.
    if (
      best === null ||
      c.score > best.score ||
      (c.score === best.score && c.text.length < best.text.length)
    ) {
      best = c;
    }
  }
  if (best === null) throw new Error("no candidates");
  return best.text;
}

function main(): void {
  const fortune = pick(CANDIDATES);
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fortune, "utf-8");
  // Verify what was actually written: the gate reads this file, not stdout.
  const written = readFileSync("/output/entry.txt", "utf-8");
  if (written !== fortune) throw new Error("entry.txt differs from the chosen line");
  if (!(written.trim().length >= 1 && written.trim().length <= 200)) {
    throw new Error("entry.txt outside the gate");
  }
  if (written.trim().includes("\n")) throw new Error("entry.txt must be one line");
  console.log(fortune);
}

main();
