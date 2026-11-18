export const WELCOME_ELIGIBILITY_DAYS = 7;

export function getWelcomeEligibilityDate(now = new Date()): Date {
  return new Date(now.getTime() - WELCOME_ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000);
}
