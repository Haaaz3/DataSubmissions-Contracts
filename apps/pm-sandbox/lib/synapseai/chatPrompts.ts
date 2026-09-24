export const QUALITY_WEEKLY_IMPACT_PROMPT =
  "What is the most impactful measure for me this week and why?";

export const QUALITY_SINGLE_SAMPLE_PROMPTS = [QUALITY_WEEKLY_IMPACT_PROMPT] as const;

export const LIFE_SCIENCES_WEEKLY_IMPACT_PROMPT =
  "Which trial should we prioritize this week for the highest quality + revenue impact?";

export const LIFE_SCIENCES_SINGLE_SAMPLE_PROMPTS = [
  LIFE_SCIENCES_WEEKLY_IMPACT_PROMPT,
  "Which sponsor-fit opportunities are most ready for outreach?",
  "Where can we reduce referral leakage while improving trial enrollment?",
] as const;