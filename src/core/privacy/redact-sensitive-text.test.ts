import { describe, expect, test } from "bun:test";
import { redactSensitiveText } from "./redact-sensitive-text.ts";

describe("redactSensitiveText", () => {
  test("redacts an ambiguous unquoted path through the end of its line without mutating stored input", () => {
    const persistedPreferences = "Use /home/player/private notes/recording.wav when studying.";

    const promptValue = redactSensitiveText(persistedPreferences);

    expect(promptValue).not.toContain("/home/player/private");
    expect(promptValue).not.toContain("notes/recording.wav");
    expect(persistedPreferences).toBe("Use /home/player/private notes/recording.wav when studying.");
  });

  test("continues redacting credentials", () => {
    expect(redactSensitiveText("token=secret-value-123456")).toBe("[REDACTED]");
  });
});
