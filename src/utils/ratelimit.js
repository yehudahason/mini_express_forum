import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: "Too many requests, slow down.",
});

// Limit thread creation: 1 per 2 minutes
export const createThreadLimiter = rateLimit({
  windowMs: 1 * 10 * 1000,
  max: 1,
  message: `
    <h3 style="text-align: center; margin: 1rem auto">
      המתן 10 שניות
    </h3>
  `,
});

export const searchLimiter = rateLimit({
  windowMs: 1 * 10 * 1000,
  max: 1,
  message: `
    <h3 style="text-align: center; margin: 1rem auto">
      המתן 10 שניות
    </h3>
    <a src="/forum"> דף הבית</a>
  `,
});
