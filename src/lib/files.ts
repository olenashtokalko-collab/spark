import type { DocKind } from '../data/types';

/** File kind from its extension (uploads and chat attachments). */
export function kindOf(name: string): DocKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'heic'].includes(ext)) return 'image';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'deck';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'sheet';
  if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
  return 'pdf';
}
