import { describe, it, expect } from "vitest";
import {
  checkDisposableEmail,
  isDisposableByPattern,
  extractEmailDomain,
} from "./disposable-email";

describe("Dynamic Disposable & Temporary Email Detector", () => {
  it("extracts normalized email domain accurately", () => {
    expect(extractEmailDomain("USER@Example.Com")).toBe("example.com");
    expect(extractEmailDomain("  test@domain.com  ")).toBe("domain.com");
    expect(extractEmailDomain("invalid-email")).toBe("");
    expect(extractEmailDomain("")).toBe("");
  });

  it("detects generic burner/disposable naming patterns without hardcoded emails", () => {
    expect(isDisposableByPattern("anon@random-temp-mail.xyz")).toBe(true);
    expect(isDisposableByPattern("user@throwaway-box.org")).toBe(true);
    expect(isDisposableByPattern("test@10minute-inbox.net")).toBe(true);
    expect(isDisposableByPattern("creator@gmail.com")).toBe(false);
    expect(isDisposableByPattern("support@outlook.com")).toBe(false);
  });

  it("dynamically validates disposable emails via live verification", async () => {
    const tempMailResult = await checkDisposableEmail("test@temp-mail.org");
    expect(tempMailResult.isDisposable).toBe(true);

    const greencafeResult = await checkDisposableEmail("test@greencafe24.com");
    expect(greencafeResult.isDisposable).toBe(true);

    const gmailResult = await checkDisposableEmail("user@gmail.com");
    expect(gmailResult.isDisposable).toBe(false);
    expect(gmailResult.isValidEmail).toBe(true);
  }, 10000);

  it("identifies invalid/fake domains lacking MX records", async () => {
    const fakeResult = await checkDisposableEmail("fakeuser@nonexistent-fakedomain-982137.org");
    expect(fakeResult.isDisposable).toBe(true);
    expect(fakeResult.isValidEmail).toBe(false);
  }, 10000);
});
