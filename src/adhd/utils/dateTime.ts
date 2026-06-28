export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function toDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year = 1970, month = 1, day = 1] = dateKey.split("-").map(Number);
  return {
    year,
    month,
    day,
  };
}

export function parseTimeInput(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return {
    hours,
    minutes,
  };
}

export function combineDateAndTime(dateKey: string, time: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  const { hours, minutes } = parseTimeInput(time);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function buildRangeFromTimes(dateKey: string, startTime: string, endTime: string) {
  const start = combineDateAndTime(dateKey, startTime);
  let end = combineDateAndTime(dateKey, endTime);

  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export function differenceInMinutes(startAt: string, endAt: string): number {
  return Math.max(0, Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000));
}

export function addDays(dateKey: string, amount: number): string {
  const date = combineDateAndTime(dateKey, "12:00");
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

export function getTimeLabel(iso: string): string {
  const date = new Date(iso);
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (remain === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remain}분`;
}

export function getRangeLabel(startAt: string, endAt: string): string {
  return `${getTimeLabel(startAt)} - ${getTimeLabel(endAt)}`;
}

export function getWindowFromIso(iso: string) {
  const hour = new Date(iso).getHours();
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  return "evening";
}

export function getDayLabel(dateKey: string): string {
  const date = combineDateAndTime(dateKey, "12:00");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}

export function sortByStartAt<T extends { startAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
  );
}
