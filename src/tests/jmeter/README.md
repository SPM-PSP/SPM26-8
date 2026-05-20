# DDL-Master JMeter 性能测试指南

## 项目概述

本项目包含针对 DDL-Master 后端服务的性能测试脚本，主要测试以下单业务场景：
- 模拟登录
- 获取任务列表
- 备份/添加任务

## 前置条件

1. **安装 JMeter**：确保已安装 JMeter 5.x 版本（推荐 5.6.3）
2. **启动后端服务**：确保后端服务运行在 `http://localhost:8080`
3. **MySQL 数据库**：确保数据库已正确配置并启动

## 测试脚本结构

```
ddl_performance_test.jmx
├── 测试计划 (TestPlan)
│   └── 用户定义变量
│       ├── base_url: 后端服务基础URL
│       └── mock_user_id: 模拟登录用户ID
├── 性能测试线程组 (ThreadGroup)
│   ├── 1. 模拟登录 (POST /api/user/login/mock)
│   │   ├── 登录响应断言
│   │   └── 提取用户ID (JSON Extractor)
│   ├── 2. 获取任务列表 (GET /api/todo/list)
│   │   ├── 任务列表响应断言
│   │   └── 提取第一个任务ID
│   ├── 3. 备份/添加任务 (POST /api/todo/backup)
│   │   └── 备份响应断言
│   ├── 思考时间 (1秒)
│   ├── 查看结果树
│   ├── 摘要报告
│   ├── 聚合报告
│   └── 打印用户ID (JSR223 Sampler)
```

## 运行方式

### 方式一：JMeter GUI 模式（推荐用于调试）

1. 打开 JMeter
2. 点击 `File` -> `Open`，选择 `ddl_performance_test.jmx`
3. 点击工具栏上的绿色三角形按钮开始运行
4. 在"查看结果树"中查看每个请求的详细结果

### 方式二：命令行模式（推荐用于正式性能测试）

```bash
# Windows 命令行
jmeter -n -t ddl_performance_test.jmx -l result.jtl -e -o report

# 参数说明：
# -n: 非GUI模式运行
# -t: 指定测试计划文件
# -l: 指定结果文件
# -e: 测试结束后生成HTML报告
# -o: 指定报告输出目录
```

## 测试场景说明

### 场景1：模拟登录

**接口**：`POST /api/user/login/mock`

**请求体**：
```json
{
  "mockId": "test_user_001"
}
```

**响应**：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "uuid": "用户唯一标识",
    "nickname": "昵称",
    "avatar": "头像URL"
  }
}
```

### 场景2：获取任务列表

**接口**：`GET /api/todo/list?userId={userId}`

**响应**：
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "uuid": "任务ID",
      "title": "任务标题",
      "content": "任务内容",
      "status": 0,
      "priority": 1,
      "createdAt": "创建时间"
    }
  ]
}
```

### 场景3：备份/添加任务

**接口**：`POST /api/todo/backup?userId={userId}`

**请求体**：
```json
[
  {
    "title": "性能测试任务",
    "content": "JMeter测试生成的任务",
    "status": 0,
    "priority": 1,
    "createdAt": "2024-01-01T10:00:00",
    "planId": "",
    "targetId": "",
    "userId": "${user_id}"
  }
]
```

**响应**：
```json
{
  "code": 200,
  "message": "同步成功",
  "data": null
}
```

## 性能指标关注

### 常用指标

| 指标 | 说明 |
|------|------|
| **吞吐量 (Throughput)** | 每秒处理的请求数 |
| **平均响应时间 (Average)** | 请求的平均响应时间 |
| **90%响应时间 (90% Line)** | 90%请求的响应时间 |
| **错误率 (Error Rate)** | 请求失败的比例 |

### 预期基准

根据业务需求，建议关注以下基准：
- 平均响应时间 < 500ms
- 90%响应时间 < 1000ms
- 错误率 < 1%
- 吞吐量根据并发用户数调整

## 配置调整

### 调整线程数

1. 打开测试计划
2. 点击"性能测试线程组"
3. 修改以下参数：
   - **Number of Threads (users)**: 并发用户数
   - **Ramp-Up Period (seconds)**: 线程启动时间
   - **Duration (seconds)**: 测试持续时间

### 修改用户ID

在"用户定义变量"中修改 `mock_user_id` 的值。

### 添加更多测试场景

可以通过复制现有的 HTTP 请求并修改以下内容来添加新场景：
- 请求路径
- 请求方法
- 请求参数
- 响应断言

## 结果分析

### 报告解读

1. **摘要报告**：提供总体性能指标概览
2. **聚合报告**：提供更详细的性能统计
3. **查看结果树**：调试时查看每个请求的详细信息

### 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 连接拒绝 | 后端服务未启动 | 检查后端服务状态 |
| 数据库连接失败 | MySQL未启动或配置错误 | 检查MySQL连接配置 |
| 响应超时 | 服务器性能不足 | 增加超时时间或优化代码 |
| 高错误率 | 接口逻辑问题 | 检查接口实现 |

## 扩展建议

1. **参数化测试数据**：使用 CSV Data Set Config 实现多用户测试
2. **添加更多场景**：测试其他接口（如笔记、计划、目标等）
3. **分布式测试**：使用 JMeter 分布式测试功能进行大规模压测
4. **监控集成**：结合 Prometheus/Grafana 进行实时性能监控

## 注意事项

1. 性能测试会产生大量请求，请在测试环境进行
2. 建议逐步增加并发用户数，避免一次性过大压力
3. 测试前确保数据库中有足够的测试数据
4. 测试期间关闭不必要的日志以提高性能
