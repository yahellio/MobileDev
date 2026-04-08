export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  const m = a.length;
  const n = b.length;
  if (m === 0) {
    return n;
  }
  if (n === 0) {
    return m;
  }
  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j += 1) {
    row[j] = j;
  }
  for (let i = 1; i <= m; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

function tokenMatches(txt: string, token: string): boolean {
  if (!token.length) {
    return true;
  }
  if (txt.includes(token)) {
    return true;
  }
  const maxDist = token.length <= 3 ? 0 : 1;
  for (const word of txt.split(/\s+/)) {
    if (word.length && levenshtein(word, token) <= maxDist) {
      return true;
    }
  }
  return false;
}

export function fuzzyKeywordMatch(text: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const txt = text.toLowerCase();
  for (const token of q.split(/\s+/)) {
    if (!tokenMatches(txt, token)) {
      return false;
    }
  }
  return true;
}
