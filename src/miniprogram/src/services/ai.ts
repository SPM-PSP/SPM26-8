import Taro from '@tarojs/taro';
import { Todo } from '../types';
import { AI_CONFIG } from '../config/ai.config';

export interface ParsedTodoDraft {
  title: string;
  desc?: string;
  level: Todo['level'];
  category: string;
  endTime?: string;
  priorityLabel: '高' | '中' | '低';
}

export interface AiContext {
  todos: Todo[];
  period: 'week' | 'month';
}

const LEVELS: Todo['level'][] = [
  'urgent-important',
  'urgent-not-important',
  'not-urgent-important',
  'not-urgent-not-important',
];

const CATEGORIES = ['工作', '学习', '生活', '健康', '娱乐', '其他'];

function getConfig() {
  const apiKey = AI_CONFIG.apiKey?.trim() || '';
  const baseUrl = (AI_CONFIG.baseUrl || 'https://api.deepseek.com').replace(/\/$/, '');
  const model = AI_CONFIG.model || 'deepseek-chat';
  return { apiKey, baseUrl, model };
}

export function isAiConfigured(): boolean {
  return Boolean(getConfig().apiKey);
}

async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { json?: boolean }
): Promise<string> {
  const { apiKey, baseUrl, model } = getConfig();
  if (!apiKey) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.3,
  };
  if (options?.json) {
    body.response_format = { type: 'json_object' };
  }

  const res = await Taro.request({
    url: `${baseUrl}/v1/chat/completions`,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    data: body,
    timeout: 60000,
  });

  if (res.statusCode !== 200) {
    const errText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    throw new Error(errText || `AI 请求失败 (${res.statusCode})`);
  }

  const data = res.data as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('AI 返回为空');
  return content;
}

async function chatJson<T>(system: string, user: string): Promise<T> {
  const content = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { json: true }
  );
  return JSON.parse(content) as T;
}

export async function streamChat(
  system: string,
  user: string,
  onChunk: (text: string) => void,
  _signal?: AbortSignal
): Promise<void> {
  const content = await chatCompletion(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]
  );

  // 模拟打字机效果：逐字输出
  for (const char of content) {
    onChunk(char);
    await new Promise((r) => setTimeout(r, 20));
  }
}

function normalizeLevel(raw: string): Todo['level'] {
  if (LEVELS.includes(raw as Todo['level'])) return raw as Todo['level'];
  const map: Record<string, Todo['level']> = {
    重要紧急: 'urgent-important',
    紧急不重要: 'urgent-not-important',
    重要不紧急: 'not-urgent-important',
    不重要不紧急: 'not-urgent-not-important',
  };
  return map[raw] || 'not-urgent-important';
}

function normalizeCategory(raw: string): string {
  return CATEGORIES.includes(raw) ? raw : '其他';
}

function inferEndTimeFromText(text: string): string | undefined {
  const now = new Date();
  const year = now.getFullYear();
  const match = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const d = new Date(year, parseInt(match[1], 10) - 1, parseInt(match[2], 10), 18, 0, 0);
    if (d < now) d.setFullYear(year + 1);
    return d.toISOString();
  }
  if (/明天|明日/.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }
  if (/下周|下星期/.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }
  return undefined;
}

function mockParseTodo(text: string): ParsedTodoDraft {
  const urgent = /紧急|马上|立刻|尽快/.test(text);
  const important = /重要|必须|关键/.test(text);
  let level: Todo['level'] = 'not-urgent-important';
  if (urgent && important) level = 'urgent-important';
  else if (urgent) level = 'urgent-not-important';
  else if (important) level = 'not-urgent-important';

  let priorityLabel: ParsedTodoDraft['priorityLabel'] = '中';
  if (level === 'urgent-important') priorityLabel = '高';
  else if (level === 'not-urgent-not-important') priorityLabel = '低';

  let category = '其他';
  if (/工作|会议|项目/.test(text)) category = '工作';
  else if (/学习|考试|作业/.test(text)) category = '学习';
  else if (/健身|健康|医院/.test(text)) category = '健康';

  return {
    title: text.slice(0, 80).trim() || '新任务',
    desc: text.length > 80 ? text : undefined,
    level,
    category,
    endTime: inferEndTimeFromText(text),
    priorityLabel,
  };
}

export async function parseTodoFromText(text: string): Promise<ParsedTodoDraft> {
  if (!text.trim()) throw new Error('请输入任务内容');
  if (!isAiConfigured()) {
    await new Promise((r) => setTimeout(r, 600));
    return mockParseTodo(text);
  }

  const today = new Date().toISOString().slice(0, 10);
  const result = await chatJson<{
    title: string;
    desc?: string;
    level: string;
    category: string;
    endTime?: string;
    priorityLabel: string;
  }>(
    `你是任务管理助手。根据用户自然语言输入解析任务，仅返回 JSON：
{"title":"任务标题","desc":"可选描述","level":"urgent-important|urgent-not-important|not-urgent-important|not-urgent-not-important","category":"工作|学习|生活|健康|娱乐|其他","endTime":"ISO8601或空","priorityLabel":"高|中|低"}
今天日期：${today}。相对时间请换算为 ISO8601。`,
    text
  );

  return {
    title: result.title || text.slice(0, 50),
    desc: result.desc,
    level: normalizeLevel(result.level),
    category: normalizeCategory(result.category),
    endTime: result.endTime || inferEndTimeFromText(text),
    priorityLabel: (['高', '中', '低'].includes(result.priorityLabel)
      ? result.priorityLabel
      : '中') as ParsedTodoDraft['priorityLabel'],
  };
}

export async function breakdownTodo(title: string, desc?: string): Promise<string[]> {
  if (!isAiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return [
      `明确「${title}」的目标与验收标准`,
      '拆分关键步骤并排期',
      '执行并记录进度',
      '完成后复盘总结',
    ];
  }

  const result = await chatJson<{ subtasks: string[] }>(
    '将任务拆解为 3-4 个可执行的子步骤。仅返回 JSON：{"subtasks":["步骤1","步骤2",...]}',
    `任务：${title}\n${desc ? `描述：${desc}` : ''}`
  );
  const items = result.subtasks?.filter(Boolean) || [];
  return items.slice(0, 4);
}

export interface ProactiveInsight {
  hasAlert: boolean;
  message: string;
  detail?: string;
}

export function analyzeProactiveContext(todos: Todo[]): ProactiveInsight {
  const now = new Date();
  const overdue = todos.filter(
    (t) => !t.completed && t.endTime && new Date(t.endTime) < now
  );
  const uiOverdue = overdue.filter((t) => t.level === 'urgent-important');

  if (uiOverdue.length >= 2) {
    return {
      hasAlert: true,
      message: `检测到「重要紧急」象限有 ${uiOverdue.length} 个逾期任务`,
      detail: '是否需要我帮您重新调整本周的时间表？',
    };
  }
  if (overdue.length >= 3) {
    return {
      hasAlert: true,
      message: `您有 ${overdue.length} 个任务已逾期`,
      detail: '建议优先处理重要紧急事项，或拆分大任务降低压力。',
    };
  }

  const stuck = todos.filter(
    (t) =>
      !t.completed &&
      t.level === 'not-urgent-important' &&
      t.createdAt &&
      now.getTime() - new Date(t.createdAt).getTime() > 7 * 24 * 3600 * 1000
  );
  if (stuck.length >= 2) {
    return {
      hasAlert: true,
      message: `「重要不紧急」象限有 ${stuck.length} 个任务停留超过一周`,
      detail: '可以为这些任务设定具体截止时间，避免一直拖延。',
    };
  }

  return {
    hasAlert: false,
    message: '当前节奏不错，继续保持！',
    detail: '有需要可以随时问我如何优化安排。',
  };
}

export async function getProactiveAiReply(
  insight: ProactiveInsight,
  todos: Todo[]
): Promise<string> {
  if (!isAiConfigured()) {
    return insight.detail
      ? `${insight.message}。${insight.detail}`
      : insight.message;
  }

  const summary = todos
    .filter((t) => !t.completed)
    .slice(0, 12)
    .map((t) => `- ${t.title}（${t.level}）`)
    .join('\n');

  return chatJson<{ reply: string }>(
    '你是温和高效的时间管理教练。用 2-3 句中文给出可执行建议，语气亲切。',
    `情况：${insight.message}\n${insight.detail || ''}\n\n未完成任务：\n${summary}\n\n请返回 JSON：{"reply":"建议内容"}`
  ).then((r) => r.reply);
}

function buildStatsSummary(ctx: AiContext): string {
  const { todos, period } = ctx;
  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const overdue = todos.filter(
    (t) => !t.completed && t.endTime && new Date(t.endTime) < new Date()
  ).length;

  const byLevel = todos.reduce(
    (acc, t) => {
      acc[t.level] = (acc[t.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return `周期：${period === 'week' ? '本周' : '本月'}
任务总数：${total}，已完成：${completed}，完成率：${rate}%
逾期未完成：${overdue}
四象限分布：${JSON.stringify(byLevel)}`;
}

export async function streamEfficiencyDiagnosis(
  ctx: AiContext,
  onChunk: (text: string) => void,
  _signal?: AbortSignal
): Promise<void> {
  const summary = buildStatsSummary(ctx);

  if (!isAiConfigured()) {
    const mock = `【AI 效率诊断 · 演示模式】

${summary}

整体完成率${ctx.todos.length ? Math.round((ctx.todos.filter((t) => t.completed).length / ctx.todos.length) * 100) : 0}%。建议将「重要不紧急」任务拆成小步并设定截止日期；逾期任务优先集中在今明两天处理。配置 AI API Key 后可获得个性化诊断。`;
    for (const char of mock) {
      onChunk(char);
      await new Promise((r) => setTimeout(r, 12));
    }
    return;
  }

  await streamChat(
    '你是效率教练。根据用户任务数据写一份 150-250 字的中文周报式诊断：亮点、问题、3 条可执行建议。不要用 markdown 标题符号。',
    summary,
    onChunk,
    _signal
  );
}

// —— 目标 AI 多轮规划 ——

export interface TargetWizardOption {
  id: string;
  label: string;
}

export interface TargetWizardQuestion {
  id: string;
  type: 'text' | 'single' | 'multi';
  label: string;
  options?: TargetWizardOption[];
  placeholder?: string;
}

export interface TargetDraft {
  title: string;
  desc: string;
  beginTime: string;
  endTime: string;
  weight: number;
}

export interface SuggestedTargetTodo {
  id: string;
  title: string;
  desc?: string;
  category: string;
  level: Todo['level'];
}

export interface TargetWizardTurn {
  status: 'asking' | 'ready';
  message: string;
  question?: TargetWizardQuestion | null;
  draft?: TargetDraft | null;
  suggestedTodos?: SuggestedTargetTodo[];
  syncTodosRecommended?: boolean;
}

export interface TargetWizardChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const TARGET_WIZARD_SYSTEM = `你是目标规划教练，通过多轮对话帮用户制定可执行的目标（SMART）。
层级说明：目标(Target)是长期方向；其下可拆计划(Plan)与具体任务(Todo)。健身等目标通常需要同步创建周期性任务到任务列表。

每次仅返回 JSON（不要 markdown）：
{
  "status": "asking" 或 "ready",
  "message": "给用户的中文回复，语气亲切",
  "question": {
    "id": "唯一标识",
    "type": "text" | "single" | "multi",
    "label": "问题描述",
    "options": [{"id":"opt1","label":"游泳"}],
    "placeholder": "仅 type=text 时使用"
  } 或 null,
  "draft": {
    "title": "目标标题",
    "desc": "目标描述，含关键指标与运动方式等",
    "beginTime": "yyyy-MM-dd",
    "endTime": "yyyy-MM-dd",
    "weight": 1-5
  } 或 null,
  "suggestedTodos": [
    {"id":"t1","title":"任务标题","desc":"可选","category":"健康|工作|学习|生活|娱乐|其他","level":"not-urgent-important"}
  ],
  "syncTodosRecommended": true/false
}

规则：
- 信息不足时 status=asking，每次只问一个 question；需要选项时用 single/multi 并提供 options。
- 信息充分时 status=ready，填满 draft；健身/学习等可执行目标应给出 3-6 条 suggestedTodos（如每周游泳、跑步等），syncTodosRecommended 一般为 true。
- 日期相对「今天」换算为 yyyy-MM-dd。`;

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function mockTargetWizardTurn(
  history: TargetWizardChatMessage[],
  userInput: string,
  selectedLabels: string[]
): TargetWizardTurn {
  const today = new Date();
  const begin = today.toISOString().slice(0, 10);
  const end = addDays(today, 30);
  const combined = `${userInput} ${selectedLabels.join(' ')}`;
  const turnIndex = history.filter((m) => m.role === 'user').length;

  if (turnIndex <= 1 && !/\d{2,3}/.test(combined) && !/瘦|减|斤|公斤|kg/i.test(combined)) {
    return {
      status: 'asking',
      message: '好的，一个月健身计划很棒！请先告诉我更具体的目标，例如体重从多少减到多少，或每周运动几次？',
      question: {
        id: 'metric',
        type: 'text',
        label: '具体目标（体重、频次等）',
        placeholder: '例如：从 140 斤减到 125 斤，每周运动 4 次',
      },
    };
  }

  if (turnIndex <= 2 && selectedLabels.length === 0 && !/游泳|跑步|跳绳|健身|瑜伽|骑行/.test(combined)) {
    return {
      status: 'asking',
      message: '了解你的目标了。你更倾向于哪些运动方式？可多选，我会据此生成每周任务。',
      question: {
        id: 'sports',
        type: 'multi',
        label: '选择运动项目',
        options: [
          { id: 'swim', label: '游泳' },
          { id: 'run', label: '跑步' },
          { id: 'rope', label: '跳绳' },
          { id: 'gym', label: '力量训练' },
          { id: 'yoga', label: '瑜伽' },
          { id: 'bike', label: '骑行' },
        ],
      },
    };
  }

  const sports =
    selectedLabels.length > 0
      ? selectedLabels
      : ['游泳', '跑步', '跳绳'].filter((s) => combined.includes(s.slice(0, 1)) || combined.includes(s));

  const sportText = sports.length ? sports.join('、') : '游泳、跑步';
  const metricMatch = combined.match(/(\d{2,3})\s*(?:斤|kg|公斤)?\s*(?:到|至|->|→)\s*(\d{2,3})/i);
  const descMetric = metricMatch
    ? `体重目标：${metricMatch[1]} → ${metricMatch[2]}（斤）`
    : '结合饮食与运动规律减脂';

  const suggestedTodos: SuggestedTargetTodo[] = sports.slice(0, 4).map((s, i) => ({
    id: `mock-${i}`,
    title: `每周${s}训练`,
    desc: '每次 30-45 分钟，计入本月健身目标',
    category: '健康',
    level: 'not-urgent-important' as Todo['level'],
  }));

  if (suggestedTodos.length === 0) {
    suggestedTodos.push(
      {
        id: 'mock-0',
        title: '每周游泳 2 次',
        desc: '每次 30 分钟',
        category: '健康',
        level: 'not-urgent-important',
      },
      {
        id: 'mock-1',
        title: '每周跑步 2 次',
        desc: '每次 5 公里或 30 分钟',
        category: '健康',
        level: 'not-urgent-important',
      }
    );
  }

  return {
    status: 'ready',
    message: `已为你整理好「一个月健身」目标方案，运动方式：${sportText}。请确认下方信息，并可选择同步到任务列表。`,
    question: null,
    draft: {
      title: '一个月健身减重计划',
      desc: `${descMetric}。主要运动：${sportText}。建议配合饮食控制与睡眠。`,
      beginTime: begin,
      endTime: end,
      weight: 4,
    },
    suggestedTodos,
    syncTodosRecommended: true,
  };
}

function normalizeTargetWizardTurn(raw: TargetWizardTurn): TargetWizardTurn {
  const weight = Math.min(5, Math.max(1, Number(raw.draft?.weight) || 3));
  return {
    status: raw.status === 'ready' ? 'ready' : 'asking',
    message: raw.message || '请继续补充信息。',
    question: raw.question || undefined,
    draft: raw.draft
      ? {
          title: raw.draft.title || '新目标',
          desc: raw.draft.desc || '',
          beginTime: raw.draft.beginTime || new Date().toISOString().slice(0, 10),
          endTime: raw.draft.endTime || addDays(new Date(), 30),
          weight,
        }
      : undefined,
    suggestedTodos: (raw.suggestedTodos || []).map((t, i) => ({
      id: t.id || `todo-${i}`,
      title: t.title,
      desc: t.desc,
      category: normalizeCategory(t.category),
      level: normalizeLevel(t.level),
    })),
    syncTodosRecommended: Boolean(raw.syncTodosRecommended),
  };
}

export async function nextTargetWizardTurn(
  history: TargetWizardChatMessage[],
  userInput: string,
  selectedOptionLabels: string[] = []
): Promise<TargetWizardTurn> {
  const input = userInput.trim();
  const labels = selectedOptionLabels.filter(Boolean);

  if (!input && labels.length === 0 && history.length === 0) {
    throw new Error('请先描述你的目标');
  }

  if (!isAiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return normalizeTargetWizardTurn(mockTargetWizardTurn(history, input || labels.join(' '), labels));
  }

  const today = new Date().toISOString().slice(0, 10);
  const transcript = history
    .map((m) => `${m.role === 'user' ? '用户' : '助手'}：${m.content}`)
    .join('\n');

  const payload = [
    transcript && `【对话记录】\n${transcript}`,
    input && `【用户最新文字】\n${input}`,
    labels.length && `【用户本次选择】\n${labels.join('、')}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const raw = await chatJson<TargetWizardTurn>(
    `${TARGET_WIZARD_SYSTEM}\n今天日期：${today}。`,
    payload || input
  );

  return normalizeTargetWizardTurn(raw);
}
