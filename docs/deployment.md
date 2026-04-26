# 部署与交付说明

## 1. 环境准备

- Node.js 20+
- MySQL 8+
- Redis 7+
- 微信小程序正式 `AppID / AppSecret`
- 可选：Docker / Docker Compose

## 2. 后端启动

```bash
cp server/.env.example server/.env
cd server
npm install
npx prisma generate
npm run prisma:push
npm run prisma:seed
npm run build
npm run start:prod
```

### 关键环境变量

- `DATABASE_URL`：MySQL 连接串
- `JWT_SECRET`：JWT 密钥
- `WECHAT_APP_ID` / `WECHAT_APP_SECRET`：正式微信登录配置
- `WECHAT_MOCK_LOGIN`：本地联调可为 `true`，生产应设为 `false`
- `APP_BASE_URL`：服务自身对外地址

## 3. 小程序启动

```bash
cd miniapp
npm install
npm run build:weapp
```

### API 地址

- 开发环境：`miniapp/config/dev.js`
- 生产环境：`miniapp/config/prod.js`

通过 `TARO_APP_API_BASE` 注入 API 基地址。

## 4. Docker 启动

```bash
docker compose up -d mysql redis
docker compose up -d --build server
```

## 5. 管理控制台

- 小程序管理员入口：`pages/admin/index`
- 桌面管理台：直接打开 `admin-console/index.html`
- 需要先粘贴管理员 Bearer Token

## 6. 上线前必做检查

- 关闭 `WECHAT_MOCK_LOGIN`
- 配置真实数据库和 Redis
- 跑通 `/api/health`
- 用管理员账号完成一次审批、关系创建、教练代录验证
- 在微信开发者工具和真机验证登录、记录、趋势、日历、我的、教练、管理台链路

## 7. 仍建议补充

- Prisma migration 文件化管理
- 对象存储上传
- 接口自动化测试
- 监控、日志、告警
