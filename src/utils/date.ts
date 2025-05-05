export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat(undefined, options); // uses browser locale/timezone
  return formatter.format(date);
};
