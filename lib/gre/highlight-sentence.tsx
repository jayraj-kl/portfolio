import React from "react";

/* ─── Sentence highlighter ─── */

/**
 * Renders a sentence with three types of highlights:
 * - The transition/signal word → bold + primary color
 * - idea1 → underlined with teal
 * - idea2 → underlined with amber
 *
 * Handles two tricky cases:
 * 1. Words with parenthetical annotations in the display name, e.g.
 *    "like (similarity)" or "to be words (is, was, are, etc)".
 *    The function tries the full string, then the part before the parens,
 *    then each comma-separated item inside the parens.
 *
 * 2. Transition words embedded inside an idea's clause, e.g.
 *    "He then graduated with honors" where idea2 = "He graduated with honors".
 *    When an idea can't be found as a contiguous substring, the function
 *    removes the transition word, finds the idea in the collapsed text,
 *    then maps highlights back as split segments.
 */

type HighlightType = "word" | "idea1" | "idea2";

type Highlight = {
  start: number;
  end: number;
  type: HighlightType;
};

/**
 * Find the transition word in the sentence, handling display names that
 * contain parenthetical annotations like "like (similarity)" or
 * "to be words (is, was, are, etc)".
 *
 * Returns the match position or null.
 */
function findWordMatch(
  sentence: string,
  displayWord: string,
): { start: number; end: number } | null {
  if (!displayWord) return null;

  const tryMatch = (
    searchTerm: string,
  ): { start: number; end: number } | null => {
    // For short words (≤3 chars), use word-boundary regex to avoid matching
    // inside longer words (e.g. "is" inside "This").
    // However, if the search term consists only of non-word characters (e.g. punctuation like . or ;),
    // word boundaries (\b) will prevent matching, so we check for at least one word character.
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasWordChar = /\w/.test(searchTerm);
    const pattern =
      searchTerm.length <= 3 && hasWordChar
        ? new RegExp(`\\b${escaped}\\b`, "i")
        : new RegExp(escaped, "i");
    const match = pattern.exec(sentence);
    if (match) {
      return { start: match.index, end: match.index + match[0].length };
    }
    return null;
  };

  // 1. Try the full display word as-is
  let result = tryMatch(displayWord);
  if (result) return result;

  // 2. If it has parenthetical content, try the part before "("
  const parenIdx = displayWord.indexOf("(");
  if (parenIdx > 0) {
    const beforeParen = displayWord.slice(0, parenIdx).trim();
    if (beforeParen) {
      result = tryMatch(beforeParen);
      if (result) return result;
    }

    // 3. Try each comma-separated item inside the parentheses
    const closeIdx = displayWord.indexOf(")", parenIdx);
    if (closeIdx > parenIdx) {
      const inside = displayWord.slice(parenIdx + 1, closeIdx);
      const items = inside
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "etc" && s !== "etc.");
      for (const item of items) {
        result = tryMatch(item);
        if (result) return result;
      }
    }
  }

  // 4. Fallback for punctuation names like "period .", "semi-colon ;", etc.
  const lowerWord = displayWord.toLowerCase();
  if (lowerWord.includes("period") || lowerWord.includes(".")) {
    result = tryMatch(".");
    if (result) return result;
  }
  if (lowerWord.includes("semi-colon") || lowerWord.includes(";")) {
    result = tryMatch(";");
    if (result) return result;
  }
  if (lowerWord.includes("colon") || lowerWord.includes(":")) {
    result = tryMatch(":");
    if (result) return result;
  }
  if (lowerWord.includes("comma") || lowerWord.includes(",")) {
    result = tryMatch(",");
    if (result) return result;
  }
  if (
    lowerWord.includes("dash") ||
    lowerWord.includes("-") ||
    lowerWord.includes("—")
  ) {
    result = tryMatch("—") || tryMatch("--") || tryMatch("-");
    if (result) return result;
  }
  if (
    lowerWord.includes("parentheses") ||
    lowerWord.includes("(") ||
    lowerWord.includes(")")
  ) {
    result = tryMatch("(") || tryMatch(")");
    if (result) return result;
  }

  return null;
}

export function highlightSentence(
  sentence: string,
  word: string,
  idea1: string,
  idea2: string,
) {
  const sLower = sentence.toLowerCase();
  const highlights: Highlight[] = [];

  // ── Step 1: find the transition word ──
  let wordStart = -1;
  let wordEnd = -1;

  const wordMatch = findWordMatch(sentence, word);
  if (wordMatch) {
    wordStart = wordMatch.start;
    wordEnd = wordMatch.end;
    highlights.push({ start: wordStart, end: wordEnd, type: "word" });
  }

  // ── Step 2: find ideas (with fallback to collapse-and-remap) ──
  const findIdea = (needle: string, type: HighlightType) => {
    if (!needle) return;

    // Try direct match first
    const idx = sLower.indexOf(needle.toLowerCase());
    if (idx !== -1) {
      highlights.push({ start: idx, end: idx + needle.length, type });
      return;
    }

    // Fallback: the transition word may be embedded inside this idea's clause.
    // Remove the word (and adjacent whitespace) from the sentence, find the
    // idea in the collapsed version, then map positions back.
    if (wordStart === -1) return;

    // Find the full span to remove (word + surrounding whitespace so collapse
    // reads naturally, e.g. "He then graduated" → "He graduated")
    let removeStart = wordStart;
    let removeEnd = wordEnd;
    // Expand to eat one trailing space if present
    if (removeEnd < sentence.length && sentence[removeEnd] === " ") {
      removeEnd++;
    }
    // If we didn't eat a trailing space, try eating a leading space
    else if (removeStart > 0 && sentence[removeStart - 1] === " ") {
      removeStart--;
    }

    const collapsed =
      sentence.slice(0, removeStart) + sentence.slice(removeEnd);
    const collapsedLower = collapsed.toLowerCase();
    const cIdx = collapsedLower.indexOf(needle.toLowerCase());
    if (cIdx === -1) return;

    const cEnd = cIdx + needle.length;

    // Map collapsed range [cIdx, cEnd) back to original positions.
    // Characters before removeStart map 1:1; characters at/after removeStart
    // are shifted by (removeEnd - removeStart).
    const shift = removeEnd - removeStart;

    const mapToOriginal = (collapsedPos: number) =>
      collapsedPos < removeStart ? collapsedPos : collapsedPos + shift;

    const origStart = mapToOriginal(cIdx);
    const origEnd = mapToOriginal(cEnd);

    // If the idea span crosses the removed word region, split into two segments
    if (origStart < wordStart && origEnd > wordEnd) {
      // Part before the word
      highlights.push({ start: origStart, end: wordStart, type });
      // Part after the word (skip any whitespace right after the word)
      let afterStart = wordEnd;
      if (afterStart < sentence.length && sentence[afterStart] === " ") {
        afterStart++;
      }
      highlights.push({ start: afterStart, end: origEnd, type });
    } else {
      highlights.push({ start: origStart, end: origEnd, type });
    }
  };

  findIdea(idea1, "idea1");
  findIdea(idea2, "idea2");

  // ── Step 3: sort, de-overlap, render ──

  // Sort by start position
  highlights.sort((a, b) => a.start - b.start);

  // Remove overlaps — "word" type always wins over ideas
  const clean: Highlight[] = [];
  for (const h of highlights) {
    const last = clean[clean.length - 1];
    if (!last || h.start >= last.end) {
      clean.push(h);
      continue;
    }
    // Overlap detected — keep whichever is "word", or keep the earlier one
    if (h.type === "word" && last.type !== "word") {
      // Replace the last entry: trim it, insert word, then the remainder
      const trimmed = { ...last, end: h.start };
      clean.pop();
      if (trimmed.start < trimmed.end) clean.push(trimmed);
      clean.push(h);
      // If the word ends before the idea, push the remainder
      if (h.end < last.end) {
        clean.push({ start: h.end, end: last.end, type: last.type });
      }
    }
    // Otherwise keep earlier match (already in clean)
  }

  // Build JSX fragments
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const h of clean) {
    // Plain text before this highlight
    if (cursor < h.start) {
      parts.push(sentence.slice(cursor, h.start));
    }

    const text = sentence.slice(h.start, h.end);

    if (h.type === "word") {
      parts.push(
        <span key={`w-${h.start}`} className="font-semibold text-foreground">
          {text}
        </span>,
      );
    } else if (h.type === "idea1") {
      parts.push(
        <span
          key={`i1-${h.start}`}
          className="text-foreground"
          style={{
            textDecoration: "underline",
            textDecorationColor: "oklch(0.75 0.15 180)",
            textUnderlineOffset: "3px",
            textDecorationThickness: "2px",
          }}
        >
          {text}
        </span>,
      );
    } else {
      parts.push(
        <span
          key={`i2-${h.start}`}
          className="text-foreground"
          style={{
            textDecoration: "underline",
            textDecorationColor: "oklch(0.75 0.15 75)",
            textUnderlineOffset: "3px",
            textDecorationThickness: "2px",
          }}
        >
          {text}
        </span>,
      );
    }

    cursor = h.end;
  }

  // Trailing plain text
  if (cursor < sentence.length) {
    parts.push(sentence.slice(cursor));
  }

  return <>{parts}</>;
}
