const REDACTED = "[REDACTED]";

const sensitivePatterns = [
  /\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*/gi,
  /\bBasic\s+[A-Za-z0-9+/]{20,}={0,2}/g,
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|secret|password|token)\s*[:=]\s*[^\s,;]+/gi,
  /\b(?:sk-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9_]{12,}|github_pat_[A-Za-z0-9_]{12,}|xox[baprs]-[A-Za-z0-9-]{12,}|AKIA[A-Z0-9]{16})\b/g,
  /\beyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b/g,
  /\b(?=[A-Za-z0-9_-]{32,}\b)(?=[A-Za-z0-9_-]*[A-Za-z])(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+\b/g,
  /(["'])(?:~\/|\.{1,2}\/|\/)[^"']+\1/g,
  /(?<!:)(?:\\\\|\/\/)[^\r\n]*/g,
  /(?<![\w:/])(?:~\/|\.\/|\.\.\/|\/)[^\r\n]*/g,
  /\b[A-Za-z]:[\\/][^\r\n]*/g,
] as const;

export function redactSensitiveText(text: string): string {
  return sensitivePatterns.reduce((redacted, pattern) => redacted.replace(pattern, REDACTED), text);
}
