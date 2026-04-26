# 服务架构设计

## 1. 技术选型

- 小程序端：Taro + React + TypeScript + Zustand
- 服务端：NestJS + Prisma + MySQL + Redis + JWT
- 文件存储：预留 COS / OSS / S3 兼容对象存储
- 部署建议：Nginx + Node.js PM2 / Docker Compose

## 2. 分层架构

### 小程序端

- `pages`：页面入口与路由编排
- `services`：按领域拆分 API 调用
- `store`：用户登录态、角色、基础资料缓存
- `utils`：token 存储、请求封装、日期转换

### 服务端

- `modules/auth`：微信登录、手机号绑定、JWT 签发
- `modules/users`：用户基础信息、个人资料、目标设定
- `modules/body-records`：身体指标、照片、体测报告
- `modules/training`：训练记录、动作、组次与趋势汇总
- `modules/coaches`：教练申请、审批状态、学员关系
- `modules/dashboard`：首页看板聚合查询
- `common`：Prisma、权限守卫、公共装饰器与 DTO

## 3. 领域对象

- `User`：账号主体，承载微信标识、手机号、角色、状态
- `UserProfile`：年龄、身高、训练阶段等资料
- `UserGoal`：减脂/增肌/塑形等阶段目标
- `BodyRecord`：体重、体脂率、围度等时序数据
- `BodyReport`：图片/PDF 体测报告
- `ProgressPhoto`：正面/侧面/背面照片记录
- `TrainingSession`：一次训练主记录
- `TrainingExercise`：训练内的单个动作
- `ExerciseSet`：动作下每组重量/次数/RPE
- `CoachApplication`：教练申请与审批流
- `CoachStudentRelation`：教练与学员绑定关系

## 4. 核心业务流

### 4.1 登录

1. 小程序调用 `wx.login` 获取 `code`
2. 请求后端 `/auth/wechat/login`
3. 服务端换取 `openid/unionid`，查找或创建用户
4. 生成 JWT，回传用户基础信息与角色
5. 小程序缓存 token，并拉取首页/个人信息

### 4.2 身体记录

1. 用户进入记录页填写指标
2. 小程序调用 `/body-records`
3. 服务端自动计算 BMI 等衍生字段
4. Prisma 落库并返回标准化数据

### 4.3 训练记录

1. 用户创建训练主记录
2. 逐个提交动作与组次数据
3. 服务端汇总总容量、动作最佳重量、估算 1RM
4. 趋势查询按日期区间聚合返回

### 4.4 教练关系

1. 用户提交教练申请 `/coaches/applications`
2. 管理端审批后变更用户角色
3. 管理员或后端服务建立教练-学员关系
4. 教练带学员查询与代录都走权限校验

## 5. API 规划

### Auth

- `POST /auth/wechat/login`
- `POST /auth/bind-phone`
- `GET /auth/me`

### Users

- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/goal`
- `PUT /users/goal`

### Body Records

- `GET /body-records`
- `POST /body-records`
- `GET /body-records/:id`
- `PATCH /body-records/:id`
- `DELETE /body-records/:id`

### Training

- `GET /training/sessions`
- `POST /training/sessions`
- `GET /training/sessions/:id`
- `PATCH /training/sessions/:id`
- `DELETE /training/sessions/:id`

### Coaches

- `POST /coaches/applications`
- `GET /coaches/applications/current`
- `GET /coaches/students`
- `POST /coaches/students/:studentId/body-records`
- `POST /coaches/students/:studentId/training-sessions`

### Dashboard

- `GET /dashboard/home`

## 6. 数据库设计要点

- 所有业务表统一使用 `id + createdAt + updatedAt`
- 账户和资料分表，减少核心账号表频繁变更
- 训练数据拆为三层，避免字段爆炸并兼容复杂动作
- 照片、报告只存元数据与对象存储路径
- 教练-学员关系单独建表，支持未来一对多扩展
- 审批类业务通过枚举状态保证可追踪性

## 7. 安全与扩展

- JWT 做登录态，角色守卫做资源权限拦截
- 敏感图片/报告建议使用后端签名 URL 访问
- Redis 可用于验证码、登录态黑名单、热点缓存
- 后续可拆 `admin-api` 或直接在当前服务内通过角色隔离管理端接口
