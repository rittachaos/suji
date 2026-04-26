# 塑迹技术骨架

本项目已经从需求文档推进到“小范围真实可试运行”的形态，包含微信小程序端、NestJS 服务端、Prisma/MySQL 数据模型、移动端管理台以及一个桌面端轻量管理控制台。当前可以支撑内部测试、运营试跑和后续上线准备。

## 目录说明

- `server/`：NestJS 后端服务，负责账号、用户、身体记录、训练记录、教练申请与学员关系等核心能力
- `server/prisma/`：Prisma 数据模型与初始化 SQL
- `miniapp/`：Taro 小程序端骨架，包含 API 请求层、用户状态管理、页面结构与业务服务模块
- `docs/architecture.md`：整体服务架构、领域划分、核心接口与数据库设计说明

## 目录说明

- `server/`：NestJS 后端服务，负责账号、用户、身体记录、训练记录、教练申请、学员关系、管理员接口、健康检查
- `server/prisma/`：Prisma 数据模型与初始化 SQL
- `miniapp/`：Taro 小程序端，包含首页看板、记录、趋势、日历、我的、教练管理、管理台
- `admin-console/`：桌面浏览器可直接打开的轻量运营控制台
- `docs/architecture.md`：整体服务架构、领域划分、接口与数据库设计说明

## 快速启动

1. 进入 `server/` 配置 `.env`
2. 执行 Prisma migrate / db push 初始化数据库
3. 启动 NestJS 服务
4. 进入 `miniapp/` 安装依赖并配置后端地址
5. 用微信开发者工具打开 Taro 输出目录或按团队习惯接入 CI

### 本地开发

```bash
cp server/.env.example server/.env
cd server && npm install && npx prisma generate && npm run prisma:push && npm run start:dev
cd ../miniapp && npm install && npm run build:weapp
```

### Docker 启动基础环境

```bash
docker compose up -d mysql redis
```

如果希望连服务一起启动：

```bash
docker compose up -d --build
```

### 健康检查

```bash
curl http://localhost:3000/api/health
```

## 当前已覆盖

- 微信登录/手机号绑定服务（支持真实 `code2Session`，也支持 mock fallback）
- RBAC 角色模型（用户/教练/管理员）
- 身体记录、训练记录、教练申请、学员关系、管理员审批/关系配置接口
- Prisma 数据库模型与 MySQL 初始化脚本
- 小程序端统一请求层、登录态管理、业务模块 API、首页聚合看板、教练与管理流
- 桌面端轻量管理控制台

## 生产前建议

- 在 `server/.env` 中关闭 `WECHAT_MOCK_LOGIN`，填入真实微信小程序 `AppID/AppSecret`
- 使用 Prisma migration 维护正式库结构，而不是只用 `db push`
- 为图片/报告接入对象存储，并补签名访问逻辑
- 接入日志、错误监控和接口限流
- 按环境设置 `TARO_APP_API_BASE`，避免小程序写死本地地址

## 管理控制台

- 小程序管理员入口：`miniapp/src/pages/admin/index.tsx`
- 桌面版管理台：打开 `admin-console/index.html`
- 使用前需要粘贴管理员账号的 Bearer Token
- 可直接审批教练申请、创建教练-学员关系、查询用户和关系数据

## 仍建议继续完善的部分

- 对象存储上传、报告/照片页面闭环
- 单元测试 / E2E 测试
- 正式 Web 后台工程（如果后续管理动作继续变复杂）
- 审计日志、操作日志和发布部署流水线
