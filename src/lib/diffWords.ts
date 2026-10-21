/** Word-level diff of two texts (longest common subsequence), for showing tracked changes. */
export function diffWords(a: string, b: string) {
  const x = a.split(' ');
  const y = b.split(' ');
  const t = Array.from({ length: x.length + 1 }, () => Array<number>(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) t[i][j] = x[i] === y[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const out: { w: string; k: 'same' | 'add' | 'del' }[] = [];
  let i = 0;
  let j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) {
      out.push({ w: x[i], k: 'same' });
      i++;
      j++;
    } else if (t[i + 1][j] >= t[i][j + 1]) out.push({ w: x[i++], k: 'del' });
    else out.push({ w: y[j++], k: 'add' });
  }
  while (i < x.length) out.push({ w: x[i++], k: 'del' });
  while (j < y.length) out.push({ w: y[j++], k: 'add' });
  return out;
}
