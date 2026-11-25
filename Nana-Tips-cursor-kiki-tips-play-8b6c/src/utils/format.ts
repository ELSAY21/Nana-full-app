const publishedDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatPublishedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return publishedDate.format(new Date(year, month - 1, day));
}

export function formatReadTime(minutes: number): string {
  return `${minutes} min read`;
}
