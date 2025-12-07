import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: "Too many requests, slow down.",
});

// Limit thread creation: 1 per 2 minutes
export const createThreadLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 1,
  message: "Please wait 2 minutes before posting again.",
});
