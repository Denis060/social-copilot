import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  youtube: 5000,
  tiktok: 4000,
  facebook: 63206,
  linkedin: 3000,
  pinterest: 500,
  discord: 2000,
  x: 280,
  slack: 40000,
};

export async function generateCaption(
  topic: string,
  platforms: string[],
  tone: string
): Promise<Record<string, string>> {
  const platformInstructions = platforms
    .map((p) => {
      const limit = PLATFORM_LIMITS[p] || 2000;
      return `- ${p} (max ${limit} characters): write in a style appropriate for ${p}`;
    })
    .join("\n");

  const prompt = `You are a social media copywriter. Generate captions for the following platforms based on the topic and tone provided.

Topic: ${topic}
Tone: ${tone}

Platforms:
${platformInstructions}

Return ONLY a valid JSON object with platform names as keys and caption strings as values. No markdown, no code fences, just the JSON object. Example: {"instagram": "caption here", "x": "caption here"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const cleaned = text.replace(/```json\s*|```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

export async function generateCommentReply(
  comment: string,
  context: string,
  rules: string
): Promise<string> {
  const prompt = `You are a social media community manager. Reply to the following comment in a helpful, on-brand way.

Original post context: ${context}
Brand reply rules: ${rules}
Comment: ${comment}

Write a single reply. Be concise and authentic. Do not include quotes or labels, just the reply text.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
