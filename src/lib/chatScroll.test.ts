import { describe, it, expect } from "vitest";
import {
  isNearBottom,
  isNearTop,
  computeAnchorIndexAfterPrepend,
  shouldBumpNewMessages,
  NEAR_BOTTOM_THRESHOLD,
  LOAD_MORE_TOP_THRESHOLD,
} from "@/lib/chatScroll";

describe("chatScroll — scroll-to-bottom detection", () => {
  it("is near bottom when distance < threshold", () => {
    expect(
      isNearBottom({ scrollTop: 9000, scrollHeight: 10000, clientHeight: 1000 }),
    ).toBe(true); // distance = 0
    expect(
      isNearBottom({ scrollTop: 8850, scrollHeight: 10000, clientHeight: 1000 }),
    ).toBe(true); // distance = 150 < 200
  });

  it("is NOT near bottom when distance >= threshold", () => {
    expect(
      isNearBottom({ scrollTop: 8000, scrollHeight: 10000, clientHeight: 1000 }),
    ).toBe(false); // distance = 1000
    expect(
      isNearBottom({
        scrollTop: 10000 - 1000 - NEAR_BOTTOM_THRESHOLD,
        scrollHeight: 10000,
        clientHeight: 1000,
      }),
    ).toBe(false); // exactly threshold → not "<"
  });
});

describe("chatScroll — load-more top detection", () => {
  it("triggers load-more near top", () => {
    expect(
      isNearTop({ scrollTop: 50, scrollHeight: 10000, clientHeight: 1000 }),
    ).toBe(true);
    expect(
      isNearTop({
        scrollTop: LOAD_MORE_TOP_THRESHOLD - 1,
        scrollHeight: 10000,
        clientHeight: 1000,
      }),
    ).toBe(true);
  });

  it("does not trigger when scrolled away from top", () => {
    expect(
      isNearTop({ scrollTop: 500, scrollHeight: 10000, clientHeight: 1000 }),
    ).toBe(false);
  });
});

describe("chatScroll — load-more anchoring", () => {
  it("returns the prepended count so the previously-first message stays in view", () => {
    expect(computeAnchorIndexAfterPrepend(50)).toBe(50);
    expect(computeAnchorIndexAfterPrepend(0)).toBe(0);
  });

  it("never returns a negative index", () => {
    expect(computeAnchorIndexAfterPrepend(-5)).toBe(0);
  });
});

describe("chatScroll — scroll-to-message new-messages counter", () => {
  const farFromBottom = { scrollTop: 0, scrollHeight: 10000, clientHeight: 1000 };
  const atBottom = { scrollTop: 9000, scrollHeight: 10000, clientHeight: 1000 };

  it("bumps when message is from someone else and user is scrolled up", () => {
    expect(
      shouldBumpNewMessages({
        metrics: farFromBottom,
        incomingUserId: "user-b",
        currentUserId: "user-a",
      }),
    ).toBe(true);
  });

  it("does not bump for own messages", () => {
    expect(
      shouldBumpNewMessages({
        metrics: farFromBottom,
        incomingUserId: "user-a",
        currentUserId: "user-a",
      }),
    ).toBe(false);
  });

  it("does not bump when user is already at the bottom", () => {
    expect(
      shouldBumpNewMessages({
        metrics: atBottom,
        incomingUserId: "user-b",
        currentUserId: "user-a",
      }),
    ).toBe(false);
  });
});
