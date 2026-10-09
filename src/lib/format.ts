const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parse = (iso: string) => new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);

export function fmtDate(iso: string, opts: { year?: boolean; weekday?: boolean } = {}) {
  const d = parse(iso);
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const wd = opts.weekday ? d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' : '';
  return wd + (opts.year ? `${base} ${d.getFullYear()}` : base);
}

export function fmtTime(iso: string) {
  const d = parse(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(iso: string) {
  return `${fmtDate(iso, { year: true })}, ${fmtTime(iso)}`;
}

export function fmtRelative(iso: string) {
  const d = parse(iso).getTime();
  const diff = Date.now() - d;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const days = Math.round(h / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return fmtDate(iso, { year: parse(iso).getFullYear() !== new Date().getFullYear() });
}

export function daysUntil(iso: string) {
  const d = parse(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export function dueLabel(iso: string) {
  const n = daysUntil(iso);
  if (n < 0) return `${-n} day${n === -1 ? '' : 's'} overdue`;
  if (n === 0) return 'due today';
  if (n === 1) return 'due tomorrow';
  if (n < 7) return `due in ${n} days`;
  return `due ${fmtDate(iso)}`;
}

export const aed = (n: number) => 'AED ' + n.toLocaleString('en-US');

export function fmtSize(kb: number) {
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(kb < 10240 ? 1 : 0)} MB`;
}

export function addDays(iso: string, days: number) {
  const d = parse(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const nowIso = () => {
  const d = new Date();
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 19);
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
