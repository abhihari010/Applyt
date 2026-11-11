import { format, parseISO } from "date-fns";

// dateApplied is a calendar day stored as UTC midnight. Read and write it in
// UTC so it isn't shifted to the previous day in timezones behind UTC.
export const dayFromIso = (iso: string) =>
  parseISO(new Date(iso).toISOString().slice(0, 10));

export const dayToIso = (d: Date) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();

export const formatDay = (iso: string) => format(dayFromIso(iso), "MMM d, yyyy");
