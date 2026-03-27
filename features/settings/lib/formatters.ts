export function formatMemberSince(dateStr?: string | null) {
  if (!dateStr) return null;

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}
