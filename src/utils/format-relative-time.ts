const formatter = new Intl.RelativeTimeFormat("en-US", {
  numeric: "auto",
  style: "long",
});

export const formatRelativeTime = (milliseconds: number): string => {
  const seconds = Math.round(milliseconds / 1000);
  if (Math.abs(seconds) < 60) return formatter.format(seconds, "second");

  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return formatter.format(days, "day");

  const weeks = Math.round(days / 7);
  if (Math.abs(weeks) < 4) return formatter.format(weeks, "week");

  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return formatter.format(months, "month");

  const quarters = Math.round(days / 90);
  if (Math.abs(quarters) < 4) return formatter.format(quarters, "quarter");

  const years = Math.round(days / 365);
  return formatter.format(years, "year");
};
