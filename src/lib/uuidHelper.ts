export const getUUIDFromStaticId = (id: string): string => {
  if (!id) return '';
  const strId = String(id);
  if (strId.includes('-') && strId.length >= 32) return strId; // Already a UUID
  const num = strId.replace(/[^0-9]/g, '');
  const prefix = strId.replace(/[0-9]/g, '');
  const hexPrefix = prefix === 't' ? 'e1' : prefix === 's' ? 'e2' : prefix === 'c' ? 'e3' : 'e0';
  const paddedNum = num.padStart(8, '0');
  return `00000000-0000-0000-0000-${hexPrefix}000000${paddedNum}`;
};
