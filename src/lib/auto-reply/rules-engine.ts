export interface AutoReplyRule {
  id: string;
  user_id: string;
  name: string;
  platforms: string[];
  keywords: string[];
  tone: string;
  custom_instructions: string | null;
  is_active: boolean;
}

export interface IncomingComment {
  text: string;
  platform: string;
}

/**
 * Match an incoming comment against a set of rules.
 * Returns the first matching active rule, or null.
 *
 * Matching logic:
 * 1. Rule must be active
 * 2. Rule platforms must include the comment's platform (or be empty = all platforms)
 * 3. At least one keyword must appear in the comment text (case-insensitive),
 *    or keywords array is empty (matches all comments)
 */
export function matchRule(
  comment: IncomingComment,
  rules: AutoReplyRule[]
): AutoReplyRule | null {
  for (const rule of rules) {
    if (!rule.is_active) continue;

    // Platform filter
    if (rule.platforms.length > 0 && !rule.platforms.includes(comment.platform)) {
      continue;
    }

    // Keyword filter
    if (rule.keywords.length > 0) {
      const lowerText = comment.text.toLowerCase();
      const hasMatch = rule.keywords.some((kw) =>
        lowerText.includes(kw.toLowerCase())
      );
      if (!hasMatch) continue;
    }

    return rule;
  }

  return null;
}

/**
 * Build the reply instructions string from a matched rule,
 * to be passed to Gemini's generateCommentReply.
 */
export function buildReplyInstructions(rule: AutoReplyRule): string {
  const parts: string[] = [];
  parts.push(`Tone: ${rule.tone}.`);
  if (rule.custom_instructions) {
    parts.push(rule.custom_instructions);
  }
  parts.push("Be concise and authentic. Do not include quotes or labels.");
  return parts.join(" ");
}
