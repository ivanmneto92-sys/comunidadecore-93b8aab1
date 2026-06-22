/**
 * Pure helpers for virtualized chat scroll behavior.
 * Extracted so they can be unit-tested without a real DOM/layout engine.
 */

export interface ScrollMetrics {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export const NEAR_BOTTOM_THRESHOLD = 200;
export const LOAD_MORE_TOP_THRESHOLD = 100;

/** Returns true when the user is within `threshold`px of the bottom. */
export function isNearBottom(
  m: ScrollMetrics,
  threshold = NEAR_BOTTOM_THRESHOLD,
): boolean {
  return m.scrollHeight - m.scrollTop - m.clientHeight < threshold;
}

/** Returns true when the user is within `threshold`px of the top. */
export function isNearTop(
  m: ScrollMetrics,
  threshold = LOAD_MORE_TOP_THRESHOLD,
): boolean {
  return m.scrollTop < threshold;
}

/**
 * After prepending `prependedCount` older messages, the previously-first
 * message moves to this index. Use it with `virtualizer.scrollToIndex(...)`
 * to keep the user anchored at the same visual position.
 */
export function computeAnchorIndexAfterPrepend(prependedCount: number): number {
  return Math.max(0, prependedCount);
}

/**
 * Whether to increment the unread "new messages" counter when a realtime
 * INSERT arrives. We only bump it when:
 *  - the message is NOT from the current user, AND
 *  - the user is NOT currently near the bottom.
 */
export function shouldBumpNewMessages(params: {
  metrics: ScrollMetrics;
  incomingUserId: string | null | undefined;
  currentUserId: string | null | undefined;
}): boolean {
  if (params.incomingUserId && params.incomingUserId === params.currentUserId) {
    return false;
  }
  return !isNearBottom(params.metrics);
}
