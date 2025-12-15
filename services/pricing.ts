// Pricing Configuration
// Base Gemini 2.5 Flash Pricing (Approximate per 1M tokens)
const BASE_INPUT_PRICE_PER_1M = 0.10; // $0.10
const BASE_OUTPUT_PRICE_PER_1M = 0.40; // $0.40

// Markup Configuration
const MARKUP_MULTIPLIER = 10; // 10x Markup

// Token Conversion
// 1 StreamCredit = $0.001 (Tenth of a cent)
// This makes numbers integer-friendly and psychological for users
const USD_TO_CREDITS = 1000; 

export const calculateCost = (inputTokens: number, outputTokens: number): number => {
  // 1. Calculate Base Cost in USD
  const inputCost = (inputTokens / 1_000_000) * BASE_INPUT_PRICE_PER_1M;
  const outputCost = (outputTokens / 1_000_000) * BASE_OUTPUT_PRICE_PER_1M;
  const totalBaseCost = inputCost + outputCost;

  // 2. Apply Markup
  const retailCostUSD = totalBaseCost * MARKUP_MULTIPLIER;

  // 3. Convert to StreamCredits (Round up to nearest whole credit)
  const credits = Math.ceil(retailCostUSD * USD_TO_CREDITS);

  // Minimum 5 credits per analysis to cover overhead
  return Math.max(credits, 5);
};

export const estimateVideoCost = (durationSeconds: number): number => {
  // Rough estimation logic
  // Video adds ~260 tokens per second + text prompt overhead
  const estimatedTokens = durationSeconds * 300; 
  return calculateCost(estimatedTokens, 1000); // Assume 1k output tokens
};