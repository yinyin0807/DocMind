# DocMind

面向研究人员的论文管理与智能分析平台。

当前仓库已完成第一版项目骨架，目标是先支撑 MVP 闭环：

1. 导入和解析论文
2. 管理论文库
3. 查看原始摘要与论文总结
4. 支持中英翻译
5. 支持问答、对比、综述和引文任务的后续扩展

## 目录结构

```text
DocMind/
  apps/
    api/          FastAPI 后端
    web/          React + Vite 前端
  docs/           项目说明和架构文档
  storage/        本地文件存储预留目录
  需求分析文档.md
```

## 技术选型

- 前端：React + TypeScript + Vite
- 后端：FastAPI + Pydantic
- 存储：SQLite/ PostgreSQL 预留，当前先留接口边界
- 文件处理：PDF 解析、OCR、翻译、总结任务后续接入

## 快速开始

### 1. 启动后端

```powershell
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

### 2. 启动前端

```powershell
cd apps/web
npm install
npm run dev
```

## 文档

- [需求分析文档](D:\projects\DocMind\需求分析文档.md)
- [项目骨架搭建说明](D:\projects\DocMind\docs\项目骨架搭建说明.md)
