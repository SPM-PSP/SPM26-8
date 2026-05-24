import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { Label } from './ui/label';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer';
import { cn } from './ui/utils';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => String(CURRENT_YEAR - 5 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

function daysInMonth(year: string, month: string): number {
  return new Date(Number(year), Number(month), 0).getDate();
}

function dayOptions(year: string, month: string): string[] {
  const n = daysInMonth(year, month);
  return Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0'));
}

function splitDateTime(value: string): { date: string; time: string } {
  if (!value?.trim()) return { date: '', time: '' };
  const [date, time] = value.split('T');
  return { date: date ?? '', time: (time ?? '').slice(0, 5) };
}

function parseDateParts(date: string, fallback: string) {
  const src = date || fallback;
  const [y, m, d] = src.split('-');
  return {
    year: y || String(CURRENT_YEAR),
    month: m || '01',
    day: d || '01',
  };
}

function formatDateDisplay(date: string) {
  if (!date) return '点击选择日期';
  const [y, m, d] = date.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}

function formatTimeDisplay(time: string) {
  if (!time) return '点击选择时间';
  const [h, m] = time.split(':');
  return `${h}:${m}`;
}

function ScrollColumn({
  options,
  value,
  onChange,
  suffix,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  suffix: string;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center' });
  }, [value, options.length]);

  return (
    <div className="datetime-scroll-column" data-vaul-no-drag="">
      {options.map((opt) => (
        <button
          key={opt}
          ref={value === opt ? activeRef : undefined}
          type="button"
          className={cn(
            'datetime-scroll-column__item',
            value === opt && 'datetime-scroll-column__item--active',
          )}
          onClick={() => onChange(opt)}
        >
          {opt}
          {suffix}
        </button>
      ))}
    </div>
  );
}

type DateTimeLocalFieldProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** 日期 / 时间：滚轮选择 + 确定 / 取消（不使用原生 date/time 控件） */
export function DateTimeLocalField({
  id,
  label,
  value,
  onChange,
  className,
}: DateTimeLocalFieldProps) {
  const { date, time } = splitDateTime(value);
  const today = new Date().toISOString().slice(0, 10);
  const todayParts = parseDateParts(today, today);

  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const [draftYear, setDraftYear] = useState(todayParts.year);
  const [draftMonth, setDraftMonth] = useState(todayParts.month);
  const [draftDay, setDraftDay] = useState(todayParts.day);
  const [draftHour, setDraftHour] = useState('09');
  const [draftMinute, setDraftMinute] = useState('00');

  const dayList = dayOptions(draftYear, draftMonth);
  const safeDraftDay = dayList.includes(draftDay)
    ? draftDay
    : dayList[dayList.length - 1] ?? '01';

  useEffect(() => {
    if (!dateOpen) return;
    const parts = parseDateParts(date, today);
    setDraftYear(parts.year);
    setDraftMonth(parts.month);
    setDraftDay(parts.day);
  }, [dateOpen, date, today]);

  useEffect(() => {
    const max = daysInMonth(draftYear, draftMonth);
    if (Number(draftDay) > max) {
      setDraftDay(String(max).padStart(2, '0'));
    }
  }, [draftYear, draftMonth, draftDay]);

  useEffect(() => {
    if (!timeOpen) return;
    const [h, m] = time ? time.split(':') : ['09', '00'];
    setDraftHour(h || '09');
    setDraftMinute(m || '00');
  }, [timeOpen, time]);

  const buildDraftDate = () => `${draftYear}-${draftMonth}-${safeDraftDay}`;

  const confirmDate = () => {
    const nextDate = buildDraftDate();
    if (time) {
      onChange(`${nextDate}T${time}`);
    } else {
      onChange(nextDate);
    }
    setDateOpen(false);
  };

  const confirmTime = () => {
    const baseDate = date || today;
    const next = `${baseDate}T${draftHour}:${draftMinute}`;
    onChange(next);
    setTimeOpen(false);
  };

  const handleDateOpenChange = (open: boolean) => {
    setDateOpen(open);
  };

  const handleTimeOpenChange = (open: boolean) => {
    setTimeOpen(open);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-medium text-[#4a4a4a]">{label}</Label>

      <button
        type="button"
        id={id ? `${id}-date` : undefined}
        className="datetime-field-row w-full text-left"
        onClick={() => setDateOpen(true)}
      >
        <Calendar className="datetime-field-row__icon" aria-hidden />
        <span className="datetime-field-row__hint">日期</span>
        <span
          className={cn(
            'datetime-field-row__value flex-1',
            !date && 'text-[#8b8680]',
          )}
        >
          {formatDateDisplay(date)}
        </span>
        <ChevronRight className="w-4 h-4 text-[#8b8680] shrink-0" aria-hidden />
      </button>

      <button
        type="button"
        id={id ? `${id}-time` : undefined}
        className="datetime-field-row w-full text-left"
        onClick={() => setTimeOpen(true)}
      >
        <Clock className="datetime-field-row__icon" aria-hidden />
        <span className="datetime-field-row__hint">时间</span>
        <span
          className={cn(
            'datetime-field-row__value flex-1',
            !time && 'text-[#8b8680]',
          )}
        >
          {formatTimeDisplay(time)}
        </span>
        <ChevronRight className="w-4 h-4 text-[#8b8680] shrink-0" aria-hidden />
      </button>

      <Drawer open={dateOpen} onOpenChange={handleDateOpenChange}>
        <DrawerContent className="datetime-picker-drawer">
          <DrawerHeader>
            <DrawerTitle className="text-center">选择日期</DrawerTitle>
          </DrawerHeader>
          <div
            className="datetime-picker-time-wheels px-5 pb-2"
            data-vaul-no-drag=""
          >
            <ScrollColumn
              options={YEARS}
              value={draftYear}
              onChange={setDraftYear}
              suffix="年"
            />
            <ScrollColumn
              options={MONTHS}
              value={draftMonth}
              onChange={setDraftMonth}
              suffix="月"
            />
            <ScrollColumn
              options={dayList}
              value={safeDraftDay}
              onChange={setDraftDay}
              suffix="日"
            />
          </div>
          <p className="text-center text-sm text-[#8b8680] pb-1">
            预览：{formatDateDisplay(buildDraftDate())}
          </p>
          <DrawerFooter
            className="flex-row gap-3 border-t border-gray-100 pt-4"
            data-vaul-no-drag=""
          >
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full h-11"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setDateOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full h-11 bg-[#d4726f] hover:bg-[#c46562] text-white"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={confirmDate}
            >
              确定
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Drawer open={timeOpen} onOpenChange={handleTimeOpenChange}>
        <DrawerContent className="datetime-picker-drawer">
          <DrawerHeader>
            <DrawerTitle className="text-center">选择时间</DrawerTitle>
          </DrawerHeader>
          <div
            className="datetime-picker-time-wheels px-5 pb-2"
            data-vaul-no-drag=""
          >
            <ScrollColumn
              options={HOURS}
              value={draftHour}
              onChange={setDraftHour}
              suffix=" 时"
            />
            <span className="datetime-field-time-sep self-center">:</span>
            <ScrollColumn
              options={MINUTES}
              value={draftMinute}
              onChange={setDraftMinute}
              suffix=" 分"
            />
          </div>
          <p className="text-center text-sm text-[#8b8680] pb-1">
            预览：{draftHour}:{draftMinute}
          </p>
          <DrawerFooter
            className="flex-row gap-3 border-t border-gray-100 pt-4"
            data-vaul-no-drag=""
          >
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full h-11"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setTimeOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-full h-11 bg-[#d4726f] hover:bg-[#c46562] text-white"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={confirmTime}
            >
              确定
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
