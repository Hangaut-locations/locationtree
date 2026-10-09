/** Dates come back as UTC midnight of the chosen day, so read them in UTC to keep the same day. */
const formatDay = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

/** "18:30" -> "6:30 PM" */
export const formatStartTime = (time?: string) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

/** e.g. "Sat, 24 Oct · starts 6:30 PM" or "Sat, 24 Oct – Sun, 25 Oct · starts 9:00 PM" */
export const formatPartyWhen = (party: {
  start_date?: Date | string;
  end_date?: Date | string;
  start_time?: string;
}) => {
  if (!party.start_date) return "";
  const start = formatDay(party.start_date);
  const end = party.end_date ? formatDay(party.end_date) : start;
  const days = start === end ? start : `${start} – ${end}`;
  return party.start_time ? `${days} · starts ${formatStartTime(party.start_time)}` : days;
};

/** Start and end date both count, so a one-day party is 1. Same rule as the API. */
export const partyLengthInDays = (
  startDate?: Date | string,
  endDate?: Date | string,
) => {
  if (!startDate || !endDate) return 1;
  const days =
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000,
    ) + 1;
  return Math.max(days, 1);
};

/** API date -> "YYYY-MM-DD" for date inputs. */
export const toDateInput = (date?: Date | string) =>
  date ? new Date(date).toISOString().slice(0, 10) : "";
