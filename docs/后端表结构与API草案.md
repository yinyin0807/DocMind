# DocMind 后端表结构与 API 草案

## 1. 文档目标

本文档是《后端收敛方案》的下一层细化，用于明确：

- 第一阶段后端核心表结构草案；
- 第一阶段 API 请求与响应草案；
- 前后端对接时的字段边界；
- 后续代码实现时的直接参考依据。

当前定位仍然是：

- 先支撑现有前端主工作台；
- 先围绕单篇论文工作流；
- 先做可演进的结构，不追求一次性做满全部能力。

## 2. 第一阶段范围

本阶段只覆盖以下核心链路：

1. 获取论文列表
2. 获取单篇论文详情
3. 获取单篇论文分析结果
4. 获取单篇论文问答历史
5. 提交单篇论文问题
6. 创建总结任务
7. 创建翻译任务
8. 查询任务状态

## 3. 表结构草案

## 3.1 `papers`

用途：存储论文本体与基础元数据。

建议字段如下：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | integer / uuid | 主键 |
| `title` | string | 论文标题 |
| `authors` | string | 作者列表，第一阶段可先存文本 |
| `year` | integer | 年份 |
| `venue` | string | 期刊、会议或来源 |
| `doi` | string nullable | DOI |
| `abstract_raw` | text nullable | 原始摘要 |
| `full_text` | text nullable | 论文全文文本 |
| `language` | string | 论文语言，如 `en`、`zh` |
| `focus` | string nullable | 研究焦点，用于前端右侧元信息 |
| `parse_status` | string | 解析状态，如 `pending`、`done` |
| `is_favorite` | boolean | 是否收藏 |
| `reading_status` | string | 阅读状态，如 `unread`、`reading`、`done` |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

第一阶段说明：

- `authors` 先不拆作者表，避免过早复杂化；
- `focus` 可先作为普通字段存在，后续再考虑是否由分析结果生成；
- `tags` 第一阶段可以先不单独建表，先用 mock 或简单字段过渡。

## 3.2 `paper_analyses`

用途：存储单篇论文的结构化分析结果。

建议字段如下：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | integer / uuid | 主键 |
| `paper_id` | fk -> papers.id | 关联论文 |
| `summary_short` | text nullable | 简洁总结 |
| `summary_long` | text nullable | 详细总结 |
| `research_problem` | text nullable | 研究问题 |
| `method` | text nullable | 核心方法 |
| `dataset` | text nullable | 数据与实验 |
| `results` | text nullable | 主要结果 |
| `innovation` | text nullable | 创新点 |
| `limitations` | text nullable | 局限性 |
| `title_translation_zh` | text nullable | 标题中译文 |
| `abstract_translation_zh` | text nullable | 摘要中译文 |
| `summary_translation_zh` | text nullable | 总结中译文 |
| `citation_gbt` | text nullable | GB/T 7714 引文 |
| `citation_apa` | text nullable | APA 引文 |
| `citation_ieee` | text nullable | IEEE 引文 |
| `citation_mla` | text nullable | MLA 引文 |
| `version` | integer | 分析版本 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

第一阶段说明：

- 一篇论文第一阶段默认只维护一条最新分析记录也可以；
- 但表结构里保留 `version`，方便未来保留历史版本；
- 引文字段先直接存在分析表中，后续若要扩展可拆独立表。

## 3.3 `chat_sessions`

用途：按论文管理问答会话。

建议字段如下：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | integer / uuid | 主键 |
| `paper_id` | fk -> papers.id | 关联论文 |
| `title` | string nullable | 会话标题 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

第一阶段说明：

- 先默认每篇论文只有一个主会话也可以；
- 但保留 session 表，后续方便扩展多线程问答。

## 3.4 `chat_messages`

用途：存储问答消息流。

建议字段如下：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | integer / uuid | 主键 |
| `session_id` | fk -> chat_sessions.id | 关联会话 |
| `role` | string | `user` 或 `assistant` |
| `content` | text | 消息内容 |
| `evidence_json` | json / text nullable | 证据片段，第一阶段可为空 |
| `created_at` | datetime | 创建时间 |

第一阶段说明：

- 即使暂时没有真实证据返回，也建议先保留 `evidence_json` 字段；
- 后续接入问答证据定位时不需要改接口结构。

## 3.5 `tasks`

用途：统一管理总结、翻译和后续扩展任务。

建议字段如下：

| 字段名 | 类型 | 说明 |
|---|---|---|
| `id` | integer / uuid | 主键 |
| `task_type` | string | 如 `summary`、`translation` |
| `target_type` | string | 如 `paper` |
| `target_id` | string | 目标对象 ID |
| `status` | string | `pending`、`running`、`done`、`failed` |
| `input_payload` | json / text nullable | 输入参数 |
| `result_payload` | json / text nullable | 输出结果 |
| `error_message` | text nullable | 错误信息 |
| `created_at` | datetime | 创建时间 |
| `updated_at` | datetime | 更新时间 |

第一阶段说明：

- 先把任务模型设计出来；
- 是否立即接入真实异步执行器，可以后置；
- 第一阶段也可以先由接口创建任务并写入假结果。

## 4. API 草案

以下 API 草案以 REST 风格组织，目标是让当前前端最容易接入。

## 4.1 获取论文列表

### 接口

```http
GET /api/papers
```

### 查询参数建议

| 参数名 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `q` | string | 否 | 搜索标题、作者或关键词 |
| `status` | string | 否 | 阅读/分析状态过滤 |
| `favorite` | boolean | 否 | 是否只看收藏 |
| `page` | integer | 否 | 页码 |
| `page_size` | integer | 否 | 每页数量 |

### 响应示例

```json
{
  "items": [
    {
      "id": 1,
      "title": "Graph Contrastive Learning for Scientific Literature Retrieval",
      "authors": "Lina Zhao, Wei Sun, Hao Li",
      "year": 2024,
      "venue": "ACL Findings",
      "tags": ["图学习", "检索", "待精读"],
      "status": "已总结",
      "note": "有 6 条问答记录"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20
}
```

### 说明

- 该接口直接对应前端左侧论文列表；
- `tags`、`status`、`note` 是为了减少前端再拼装显示逻辑；
- 第一阶段可以接受返回更偏 UI 的字段。

## 4.2 获取单篇论文详情

### 接口

```http
GET /api/papers/{paper_id}
```

### 响应示例

```json
{
  "id": 1,
  "title": "Graph Contrastive Learning for Scientific Literature Retrieval",
  "authors": "Lina Zhao, Wei Sun, Hao Li",
  "year": 2024,
  "venue": "ACL Findings",
  "doi": null,
  "language": "en",
  "focus": "围绕科研语料检索与表示学习",
  "is_favorite": false,
  "reading_status": "reading",
  "tags": ["图学习", "检索", "待精读"]
}
```

### 说明

- 该接口只负责右侧头部和元数据，不返回大段分析结果；
- 和 `analysis` 分开，避免单接口过重。

## 4.3 获取单篇论文分析结果

### 接口

```http
GET /api/papers/{paper_id}/analysis
```

### 响应示例

```json
{
  "paper_id": 1,
  "abstract_raw": "This paper studies scientific literature retrieval with graph contrastive learning.",
  "summary_short": "论文提出结合语义表征与引文图结构的检索框架。",
  "summary_long": "作者构建了结合文本语义与引文关系的图对比学习框架。",
  "research_problem": "如何在监督较弱、论文关系复杂的情况下提升科研文献检索质量。",
  "method": "构建 citation-aware graph，并通过 graph contrastive learning 联合建模。",
  "dataset": "SciDocs、OpenAlex 子集、自建引文图数据。",
  "results": "在 Recall@20 与 nDCG 指标上优于基线模型。",
  "innovation": "把引文结构视为重要监督来源。",
  "limitations": "依赖引文图质量；训练成本较高。",
  "translations": {
    "title_zh": "面向科研文献检索的图对比学习方法",
    "abstract_zh": "本文研究了科研文献检索任务。",
    "summary_zh": "该论文通过联合学习文本语义和引文图关系，提高了检索效果。"
  },
  "citations": {
    "gbt": "Zhao L, Sun W, Li H...",
    "apa": "Zhao, L., Sun, W., & Li, H. (2024)...",
    "ieee": "L. Zhao, W. Sun, and H. Li...",
    "mla": "Zhao, Lina, et al..."
  },
  "records": [
    "2026-03-10 20:10 生成第一版结构化总结",
    "2026-03-10 20:24 生成中译文摘要"
  ]
}
```

### 说明

- 该接口直接支撑右侧“概览 / 原始摘要 / AI 总结 / 翻译 / 引文 / 记录”；
- `translations` 和 `citations` 用嵌套结构会比平铺字段更利于前端使用；
- `records` 第一阶段可以先简单返回字符串数组。

## 4.4 获取单篇论文聊天历史

### 接口

```http
GET /api/papers/{paper_id}/chat
```

### 响应示例

```json
{
  "session": {
    "id": 1001,
    "paper_id": 1,
    "title": "默认会话"
  },
  "messages": [
    {
      "id": 1,
      "role": "assistant",
      "content": "你正在查看这篇论文。可以直接问我它的研究问题、方法、数据集、结果或局限性。",
      "created_at": "2026-03-10T20:10:00+08:00",
      "evidence": []
    },
    {
      "id": 2,
      "role": "user",
      "content": "这篇论文的核心贡献是什么？",
      "created_at": "2026-03-10T20:11:00+08:00",
      "evidence": []
    }
  ]
}
```

### 说明

- 该接口直接对应前端底部问答区；
- 第一阶段可只保留单 session；
- `evidence` 先留空数组也可以。

## 4.5 提交单篇论文问题

### 接口

```http
POST /api/papers/{paper_id}/chat
```

### 请求体示例

```json
{
  "question": "这篇论文的核心贡献是什么？"
}
```

### 响应示例

```json
{
  "session": {
    "id": 1001,
    "paper_id": 1,
    "title": "默认会话"
  },
  "user_message": {
    "id": 3,
    "role": "user",
    "content": "这篇论文的核心贡献是什么？",
    "created_at": "2026-03-12T20:40:00+08:00"
  },
  "assistant_message": {
    "id": 4,
    "role": "assistant",
    "content": "核心贡献在于把引文图结构引入检索表示学习。",
    "created_at": "2026-03-12T20:40:01+08:00",
    "evidence": []
  }
}
```

### 说明

- 第一阶段可以先返回 mock 回答；
- 后续接模型时，接口结构尽量不变，只替换生成逻辑；
- 前端可以直接把返回的两条消息追加到消息流中。

## 4.6 创建总结任务

### 接口

```http
POST /api/papers/{paper_id}/summary-tasks
```

### 请求体示例

```json
{
  "mode": "standard"
}
```

### 响应示例

```json
{
  "task_id": 9001,
  "task_type": "summary",
  "status": "pending",
  "target_type": "paper",
  "target_id": 1
}
```

### 说明

- 前端点击“生成总结”时可以先调这个接口；
- 第一阶段任务可以是伪任务，但接口要按真实任务方式设计。

## 4.7 创建翻译任务

### 接口

```http
POST /api/papers/{paper_id}/translation-tasks
```

### 请求体示例

```json
{
  "target_language": "zh",
  "fields": ["title", "abstract", "summary"]
}
```

### 响应示例

```json
{
  "task_id": 9002,
  "task_type": "translation",
  "status": "pending",
  "target_type": "paper",
  "target_id": 1
}
```

## 4.8 查询任务状态

### 接口

```http
GET /api/tasks/{task_id}
```

### 响应示例

```json
{
  "id": 9002,
  "task_type": "translation",
  "status": "done",
  "target_type": "paper",
  "target_id": 1,
  "result": {
    "updated_analysis": true
  },
  "error_message": null
}
```

## 5. Schema 建议

为了让 API 更清晰，建议在 Pydantic 中拆出以下 schema：

- `PaperListItem`
- `PaperListResponse`
- `PaperDetailResponse`
- `PaperAnalysisResponse`
- `ChatSessionResponse`
- `ChatMessageResponse`
- `ChatHistoryResponse`
- `ChatAskRequest`
- `ChatAskResponse`
- `TaskCreateResponse`
- `TaskDetailResponse`

这样做的好处是：

- 前后端字段更稳定；
- 路由函数签名更清楚；
- 后续扩展不会让单个 schema 过大。

## 6. 第一阶段字段取舍建议

### 6.1 先接受一定的“面向前端字段”

第一阶段建议允许返回一些更偏 UI 的字段，例如：

- `note`
- `status`
- `records`
- `tags`

原因是当前重点是快速支撑主工作台，而不是过早做完美的领域抽象。

### 6.2 不急着把 `tags` 完全建模

当前前端已经使用标签，但第一阶段可以先：

- 用简单字符串数组返回；
- 后续再决定是否拆 `tags`、`paper_tags` 表。

### 6.3 `records` 可以先简化

当前前端右侧“记录”标签只需要展示时间线。

因此第一阶段可以先返回字符串列表，后续再升级为结构化记录对象。

## 7. 第一阶段开发顺序建议

建议严格按下面顺序推进：

1. 建立 `papers` 模型和列表/详情接口
2. 建立 `paper_analyses` 模型和分析接口
3. 建立 `chat_sessions`、`chat_messages` 和问答历史接口
4. 建立 `POST chat` 接口
5. 建立 `tasks` 模型和任务状态接口

这条顺序的意义是：

- 先把页面读出来；
- 再把页面写起来；
- 最后把任务边界补完整。

## 8. 结论

当前最适合 DocMind 第一阶段后端落地的接口组合是：

- `GET /api/papers`
- `GET /api/papers/{paper_id}`
- `GET /api/papers/{paper_id}/analysis`
- `GET /api/papers/{paper_id}/chat`
- `POST /api/papers/{paper_id}/chat`
- `POST /api/papers/{paper_id}/summary-tasks`
- `POST /api/papers/{paper_id}/translation-tasks`
- `GET /api/tasks/{task_id}`

只要先把这 8 个接口和对应表结构定下来，当前前端主工作台就已经有明确的后端承接方案，后续实现会顺很多。
