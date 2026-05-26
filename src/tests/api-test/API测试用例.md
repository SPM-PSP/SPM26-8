# 接口测试用例（API Test Cases）

对应文档：`ddl-master 系统需求规格说明书.doc` 第 3.4 节「接口汇总分析」

> **注意：PASS 不代表代码无缺陷。** 测试如实反映代码当前行为，有问题处已在"备注"列标注，详见「缺陷汇总」Sheet。

---

## 测试范围总览

| 模块 | 控制器 | 端点数 | 用例数 | 通过 | 关联缺陷 |
|------|--------|:-----:|:-----:|:----:|------|
| 待办事项 | TodoController | 2 | 14 | 14 | BUG-002, BUG-006 |
| 目标 | TargetController | 2 | 9 | 9 | BUG-002 |
| 计划 | PlanController | 2 | 9 | 9 | BUG-002 |
| 笔记 | NoteController | 3 | 11 | 11 | BUG-002, BUG-004 |
| 用户 | UserController | 5 | 16 | 16 | BUG-002 |
| 提醒 | ReminderController | 2 | 16 | 16 | BUG-002, BUG-003, BUG-005 |
| **后端小计** | **6** | **16** | **75** | **75** | **6个缺陷** |
| AI 服务 | (前端 Vitest) | - | 20 | 20 | - |
| **总计** | | | **95** | **95** | |

---

## 1. 待办事项 (`/api/todo`)

### GET `/api/todo/list`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| TODO-API-001 | 用户有任务 | 200, data返回 | PASS | |
| TODO-API-002 | 用户无任务 | 200, data=[] | PASS | |
| TODO-API-003 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| TODO-API-004 | Service抛异常 | code=500 | PASS | |

### POST `/api/todo/backup`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| TODO-API-005 | 默认replace模式 | code=200 | PASS | |
| TODO-API-006 | mode=append | code=200 | PASS | |
| TODO-API-007 | mode=append,空数组 | code=200 | PASS | |
| TODO-API-008 | Service返回false | code=500 | PASS | |
| TODO-API-009 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| TODO-API-010 | 空数组 | code=200 | PASS | |
| TODO-API-011 | Service抛异常 | code=500 | PASS | |
| TODO-API-012 | mode=REPLACE | code=200 | PASS | |
| TODO-API-013 | mode=invalid | code=200 | PASS | **BUG-006**: 应报错,静默fallback |
| TODO-API-014 | append+Service异常 | code=500 | PASS | |

---

## 2. 目标 (`/api/target`)

### GET `/api/target/restore`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| TARGET-API-001 | 用户有目标 | 200, data返回 | PASS | |
| TARGET-API-002 | 用户无目标 | 200, data=[] | PASS | |
| TARGET-API-003 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| TARGET-API-004 | Service抛异常 | code=500 | PASS | |

### POST `/api/target/backup`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| TARGET-API-005 | 正常同步2条 | code=200 | PASS | |
| TARGET-API-006 | Service返回false | code=500 | PASS | |
| TARGET-API-007 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| TARGET-API-008 | 空数组 | code=200 | PASS | |
| TARGET-API-009 | Service抛异常 | code=500 | PASS | |

---

## 3. 计划 (`/api/plan`)

### GET `/api/plan/restore`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| PLAN-API-001 | 用户有计划 | 200, data返回 | PASS | |
| PLAN-API-002 | 用户无计划 | 200, data=[] | PASS | |
| PLAN-API-003 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| PLAN-API-004 | Service抛异常 | code=500 | PASS | |

### POST `/api/plan/backup`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| PLAN-API-005 | 正常同步2条 | code=200 | PASS | |
| PLAN-API-006 | Service返回false | code=500 | PASS | |
| PLAN-API-007 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| PLAN-API-008 | 空数组 | code=200 | PASS | |
| PLAN-API-009 | Service抛异常 | code=500 | PASS | |

---

## 4. 笔记 (`/api/note`)

### GET `/api/note/restore`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| NOTE-API-001 | 用户有笔记 | 200, data返回 | PASS | |
| NOTE-API-002 | 用户无笔记 | 200, data=[] | PASS | |
| NOTE-API-003 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| NOTE-API-004 | Service抛异常 | code=500 | PASS | |

### POST `/api/note/backup`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| NOTE-API-005 | 正常同步2条 | code=200 | PASS | |
| NOTE-API-006 | Service返回false | code=500 | PASS | |
| NOTE-API-007 | 缺userId | code=500 | PASS | **BUG-002**: 应400实际200 |
| NOTE-API-008 | Service抛异常 | code=500 | PASS | |

### POST `/api/note/save`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| NOTE-API-009 | 正常保存笔记 | 200, data返回 | PASS | **BUG-004**: 未判断返回值 |
| NOTE-API-010 | 请求体为空 | code=500 | PASS | **BUG-002**: 应400实际200 |
| NOTE-API-011 | Service抛异常 | code=500 | PASS | |

---

## 5. 用户 (`/api/user`)

### POST `/api/user/login/mock`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| USER-API-001 | 正常登录 | 200, data返回 | PASS | |
| USER-API-002 | 请求体为空 | code=500 | PASS | **BUG-002**: 应400实际200 |
| USER-API-003 | Service抛异常 | code=500 | PASS | |

### POST `/api/user/update`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| USER-API-004 | 正常更新 | code=200 | PASS | |
| USER-API-005 | 请求体为空 | code=500 | PASS | **BUG-002**: 应400实际200 |
| USER-API-006 | Service抛异常 | code=500 | PASS | |

### GET `/api/user/list` (main分支特有)

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| USER-API-007 | 返回全部用户 | 200, data.length=2 | PASS | |
| USER-API-008 | 无用户 | 200, data=[] | PASS | |
| USER-API-009 | Service抛异常 | code=500 | PASS | |

### GET `/api/user/profile`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| USER-API-010 | 用户存在 | 200, data返回 | PASS | |
| USER-API-011 | 不存在(自动注册) | 200, data返回 | PASS | |
| USER-API-012 | 缺openid | code=500 | PASS | **BUG-002**: 应400实际200 |
| USER-API-013 | Service抛异常 | code=500 | PASS | |

### POST `/api/user/reminder-settings`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| USER-API-014 | 正常保存 | 200, data返回 | PASS | |
| USER-API-015 | 请求体为空 | code=500 | PASS | **BUG-002**: 应400实际200 |
| USER-API-016 | Service抛异常 | code=500 | PASS | |

---

## 6. 提醒 (`/api/reminder`)

### POST `/api/reminder/scan`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| REMINDER-API-001 | 正常扫描,3条 | 200, data=3 | PASS | |
| REMINDER-API-002 | 扫描无结果 | 200, data=0 | PASS | |
| REMINDER-API-003 | 用户不存在 | code=500 | PASS | |
| REMINDER-API-004 | 邮箱为null | code=500 | PASS | |
| REMINDER-API-005 | 邮箱为空 | code=500 | PASS | |
| REMINDER-API-006 | isReminderOn=0 | code=500 | PASS | |
| REMINDER-API-007 | isReminderOn=null | code=500 | PASS | **BUG-005**: 只判!=1,不严谨 |
| REMINDER-API-008 | 缺openid | code=500 | PASS | **BUG-002**: 应400实际200 |
| REMINDER-API-009 | Service抛异常 | code=500 | PASS | |

### POST `/api/reminder/test`

| 用例ID | 场景 | 预期 | 结果 | 备注 |
|--------|------|------|:--:|------|
| REMINDER-API-010 | 正常发送 | code=200 | PASS | **BUG-003**: 未校验提醒开关 |
| REMINDER-API-011 | 用户不存在 | code=500 | PASS | |
| REMINDER-API-012 | 邮箱为null | code=500 | PASS | |
| REMINDER-API-013 | 邮箱为空 | code=500 | PASS | |
| REMINDER-API-014 | 缺openid | code=500 | PASS | **BUG-002**: 应400实际200 |
| REMINDER-API-015 | 演示模式 | code=200 | PASS | |
| REMINDER-API-016 | SMTP发送异常 | code=500 | PASS | |

---

## 7. 前端 AI 服务

| 用例ID | 函数 | 场景 | 预期 | 结果 |
|--------|------|------|------|:--:|
| AI-UNIT-001 | isAiConfigured | 无API Key | false | PASS |
| AI-UNIT-002 | parseTodoFromText | 正常解析 | 标题+截止时间 | PASS |
| AI-UNIT-003 | parseTodoFromText | 紧急重要 | priority=1 | PASS |
| AI-UNIT-004 | parseTodoFromText | 分类 | category含"生活" | PASS |
| AI-UNIT-005 | parseTodoFromText | 空文本 | [] | PASS |
| AI-UNIT-006 | parseTodoFromText | 超长截断 | len≤100 | PASS |
| AI-UNIT-007 | parseTodoFromText | 数字时间 | 日期正确 | PASS |
| AI-UNIT-008 | breakdownTodo | 任务拆解 | 子步骤数组 | PASS |
| AI-UNIT-009 | breakdownTodo | 空文本 | [] | PASS |
| AI-UNIT-010 | analyzeProactiveContext | 无过期 | null | PASS |
| AI-UNIT-011 | analyzeProactiveContext | 紧急≥2 | 紧急重要 | PASS |
| AI-UNIT-012 | analyzeProactiveContext | 过期≥3 | 积压提醒 | PASS |
| AI-UNIT-013 | analyzeProactiveContext | 停滞>1周 | 停滞提醒 | PASS |
| AI-UNIT-014 | getProactiveAiReply | mock回复 | 字符串 | PASS |
| AI-UNIT-015 | streamEfficiencyDiagnosis | 流式诊断 | 逐块+统计 | PASS |
| AI-UNIT-016 | streamEfficiencyDiagnosis | Abort中止 | 取消无异常 | PASS |
| AI-UNIT-017 | nextTargetWizardTurn | asking | 下轮回复 | PASS |
| AI-UNIT-018 | nextTargetWizardTurn | ready | suggestedTodos | PASS |
| AI-UNIT-019 | nextTargetWizardTurn | 空输入 | 错误提示 | PASS |
| AI-UNIT-020 | nextTargetWizardTurn | 完整结束 | 待办建议 | PASS |

---

## 缺陷汇总

| 编号 | 严重 | 模块 | 描述 |
|------|:--:|------|------|
| BUG-001 | **高** | IR-02-07 | 权限同步接口缺失,代码中无对应实现 |
| BUG-002 | **中** | 全部Controller | HTTP状态码不规范,异常统一返回200,应返回4xx/5xx |
| BUG-003 | **中** | ReminderController | /testMail未校验isReminderOn,可绕过提醒开关发送测试邮件 |
| BUG-004 | 低 | NoteController | save忽略saveOrUpdate返回值,失败时仍返回成功 |
| BUG-005 | 低 | ReminderController | isReminderOn只判!=1,未来扩展可能误拦 |
| BUG-006 | 低 | TodoController | backup非法mode静默fallback,应报错提示 |

---

## 未实现接口

| 需求编号 | 接口名称 | 说明 |
|----------|---------|------|
| IR-02-07 | 权限同步接口 | 规格书有,main分支无 (BUG-001) |
| IR-02-10 | WebSocket弹窗提醒 | MVP未实现 |
| IR-03-01 | 微信订阅消息 | 需真机环境 |

---

## 测试文件

| 文件 | 用例数 |
|------|:-----:|
| `TodoControllerTest.java` | 14 |
| `TargetControllerTest.java` | 9 |
| `PlanControllerTest.java` | 9 |
| `NoteControllerTest.java` | 11 |
| `UserControllerTest.java` | 16 |
| `ReminderControllerTest.java` | 16 |
| `ai.test.ts` | 20 |

---

## 结论

- **后端 75 用例 + 前端 20 用例 = 95 全部 PASS**
- **PASS 不等于无缺陷**，已发现 6 个问题在备注列标注
- 全部 16 个 REST 端点覆盖：成功路径 / 空数据 / 参数缺失 / Service 异常
- Standalone MockMvc + Mockito，无需数据库或外部服务
