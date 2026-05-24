import type { Todo } from '../types';

export interface TargetDraftLike {
  title: string;
  desc: string;
  beginTime: string;
  endTime: string;
}

export interface SuggestedTargetTodoLike {
  id: string;
  title: string;
  desc?: string;
  category: string;
  level: Todo['level'];
  beginTime?: string;
  endTime?: string;
}

/** 从文案解析「每周 N 次」（支持「每周运动3次」等中间带字的写法） */
export function parseTimesPerWeek(text: string): number {
  const t = text || '';
  const patterns = [
    /每[周星期][^0-9]{0,16}(\d+)\s*次/,
    /一[周星期][^0-9]{0,16}(\d+)\s*次/,
    /每周\s*(\d+)\s*次/,
    /一周\s*(\d+)\s*次/,
    /(\d+)\s*次\s*[/／]\s*周/,
    /周\s*(\d+)\s*练/,
    /每周\s*(\d+)\s*练/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) return Math.min(7, Math.max(1, Number(m[1])));
  }
  return 0;
}

function parseEveningHours(text: string): { start: number; end: number } {
  if (/晚上|夜间|晚间/.test(text)) return { start: 19, end: 20 };
  return { start: 17, end: 18 };
}

const WEEKDAY_BY_FREQ: Record<number, number[]> = {
  1: [3],
  2: [2, 5],
  3: [1, 3, 5],
  4: [1, 2, 4, 6],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDateTimeLocal(d: Date, hour = 18, minute = 0): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}`;
}

function parseDateOnly(s: string): Date {
  const d = new Date(`${s.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(12, 0, 0, 0);
  return x;
}

function addDaysDate(base: Date, days: number): Date {
  const x = new Date(base);
  x.setDate(x.getDate() + days);
  return x;
}

/** 在目标周期内按每周 N 次展开为带时间的具体任务 */
export function expandSuggestedTodos(
  draft: TargetDraftLike,
  templates: SuggestedTargetTodoLike[],
  contextText = '',
): SuggestedTargetTodoLike[] {
  if (templates.length === 0) return [];

  if (templates.every((t) => t.endTime?.trim()) && templates.length >= 8) {
    return templates;
  }

  const scheduleText = `${contextText} ${draft.desc} ${draft.title}`;
  const timesPerWeek =
    parseTimesPerWeek(contextText) ||
    parseTimesPerWeek(draft.desc) ||
    parseTimesPerWeek(draft.title) ||
    3;
  const evening = parseEveningHours(scheduleText);

  const freq = Math.min(7, Math.max(1, timesPerWeek));
  const weekdays = WEEKDAY_BY_FREQ[freq] ?? WEEKDAY_BY_FREQ[3];
  const begin = parseDateOnly(draft.beginTime);
  const end = parseDateOnly(draft.endTime);
  const expanded: SuggestedTargetTodoLike[] = [];
  let templateIdx = 0;
  let weekStart = startOfWeekMonday(begin);

  while (weekStart <= end) {
    for (const wd of weekdays) {
      const session = addDaysDate(weekStart, wd === 0 ? 6 : wd - 1);
      if (session < begin || session > end) continue;

      const tpl = templates[templateIdx % templates.length];
      templateIdx += 1;
      const sessionLabel = `${session.getMonth() + 1}/${session.getDate()}`;
      const baseTitle = tpl.title.replace(/^每周/, '').trim() || '运动训练';

      expanded.push({
        id: `sched-${expanded.length}`,
        title: `${baseTitle}（${sessionLabel}）`,
        desc: tpl.desc || `目标「${draft.title}」安排的一次训练`,
        category: tpl.category || '健康',
        level: tpl.level || ('not-urgent-important' as Todo['level']),
        beginTime: toDateTimeLocal(session, evening.start, 0),
        endTime: toDateTimeLocal(session, evening.end, 0),
      });
    }
    weekStart = addDaysDate(weekStart, 7);
    if (expanded.length > 80) break;
  }

  return expanded.length > 0 ? expanded : templates;
}
