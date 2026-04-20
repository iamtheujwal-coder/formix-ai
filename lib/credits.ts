import { IUser, PlanType } from "@/models/User";

export const PLAN_LIMITS: Record<PlanType, number> = {
  free: 800,
  starter: 5000,
  pro: 20000,
};

export function getPlanLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function isNewDay(lastReset: Date): boolean {
  const now = new Date();
  const last = new Date(lastReset);

  return (
    now.getUTCFullYear() !== last.getUTCFullYear() ||
    now.getUTCMonth() !== last.getUTCMonth() ||
    now.getUTCDate() !== last.getUTCDate()
  );
}

export async function resetCreditsIfNeeded(
  user: IUser
): Promise<IUser> {
  if (isNewDay(user.lastReset)) {
    user.creditsRemaining = getPlanLimit(user.plan);
    user.lastReset = new Date();
    await (user as any).save();
  }
  return user;
}

export function hasEnoughCredits(user: IUser, wordCount: number): boolean {
  return user.creditsRemaining >= wordCount;
}

export async function deductCredits(
  user: IUser,
  wordCount: number
): Promise<IUser> {
  user.creditsRemaining = Math.max(0, user.creditsRemaining - wordCount);
  await (user as any).save();
  return user;
}

export async function addCredits(
  user: IUser,
  amount: number
): Promise<IUser> {
  user.creditsRemaining = (user.creditsRemaining || 0) + amount;
  await (user as any).save();
  return user;
}

export async function upgradePlan(
  user: IUser,
  plan: PlanType
): Promise<IUser> {
  user.plan = plan;
  user.creditsRemaining = getPlanLimit(plan);
  user.lastReset = new Date();
  await (user as any).save();
  return user;
}
