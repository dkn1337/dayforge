let sequence = 0;

export function nextDemoId(prefix: string) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}
