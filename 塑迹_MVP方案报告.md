# 塑迹 MVP 方案报告

## 1. 项目概述

- 项目名称：塑迹
- 产品形态：微信小程序 + 后台管理系统
- 核心目标：帮助健身用户长期记录身体变化与训练表现，同时支撑管理员完成用户、角色、学员关系和数据运营管理
- 首版定位：MVP（最小可用版本），面向小范围真实用户上线使用
- 首版不含内容：社区互动、课程体系、会员体系、电商功能、AI 智能建议、蓝牙设备接入

## 2. 产品目标与价值

### 2.1 面向用户

- 集中记录体重、体脂、围度、训练表现、照片和体测报告
- 形成长期趋势与阶段回顾
- 降低记录门槛，增强训练坚持感

### 2.2 面向教练

- 管理名下学员
- 查看学员记录和趋势
- 代录学员身体与训练数据

### 2.3 面向管理员

- 完成用户管理、角色审批、学员关系配置、全量数据查看、数据导出和删除申请处理

### 2.4 面向后续迭代

- 沉淀结构化健身数据
- 为后续智能分析、教练协同和更多报表能力打基础

## 3. 角色与权限模型

### 3.1 普通用户

- 查看和管理本人数据
- 维护个人资料与目标
- 记录身体指标、训练数据、照片和报告
- 查看趋势、日历、阶段总结
- 提交教练申请和删除申请

### 3.2 教练

- 拥有普通用户全部能力
- 查看和管理名下学员
- 代录学员身体记录与训练记录
- 查看学员趋势

### 3.3 管理员

- 查看全平台用户和数据
- 审批教练申请
- 设置和变更角色
- 管理教练与学员关系
- 导出数据
- 处理删除申请

### 3.4 权限边界

- 普通用户仅访问本人数据
- 教练仅访问自己名下学员数据
- 管理员访问全量数据
- 照片、报告、手机号等敏感信息必须走权限校验

## 4. MVP 功能拆解

### 4.1 P0 必做功能

#### 4.1.1 账号体系

- 微信一键登录
- 手机号授权绑定
- 首次登录创建普通用户账号

#### 4.1.2 个人资料与目标

- 个人资料维护
- 健身目标创建与编辑

#### 4.1.3 身体记录

- 新增、编辑、删除身体记录
- 支持补录历史数据
- 自动计算 BMI

#### 4.1.4 训练记录

- 新增、编辑、删除训练记录
- 一次训练支持多个动作
- 一个动作支持多组重量/次数记录
- 自动计算单动作最大重量、总容量、估算 1RM

#### 4.1.5 照片与报告

- 上传身体照片
- 上传体测报告（图片/PDF）
- 关联日期和备注
- 权限控制访问

#### 4.1.6 趋势分析

- 身体指标趋势
- 力量趋势
- 时间范围筛选

#### 4.1.7 教练能力

- 教练申请
- 审批状态查看
- 学员列表与学员详情
- 代录学员数据

#### 4.1.8 后台管理

- 用户管理
- 角色管理
- 教练申请审批
- 教练/学员关系管理
- 数据查看
- 数据导出
- 删除申请处理

### 4.2 P1 建议纳入首版但可稍后补齐

- 首页看板
- 训练日历
- 提醒开关
- 阶段总结
- 后台仪表盘
- 基础数据报表
- 操作日志

### 4.3 P2 预留扩展

- OCR 识别体测报告
- 分享海报
- 多管理员权限体系
- 教练授权数据导出
- 更复杂的消息提醒机制

## 5. MVP 上线判断标准

- 用户能完成登录、绑定手机号、个人资料维护和目标设定
- 用户能记录并管理身体指标和训练记录
- 用户能上传照片和报告
- 用户能查看基础趋势分析
- 教练能申请、被审批并进入教练能力页
- 教练能查看学员并代录数据
- 管理员能完成用户、角色、申请、关系和数据管理
- 数据导出和删除申请流程可闭环
- 合规页面与隐私机制可正常使用

## 6. 小程序端信息架构

### 6.1 一级导航

- 首页
- 记录
- 趋势
- 日历
- 我的

### 6.2 结构说明

#### 首页

- 最新身体指标
- 最近一次训练摘要
- 目标进度
- 连续打卡
- 待办提醒
- 快捷入口

#### 记录

- 身体记录
- 训练记录
- 照片管理
- 报告管理

#### 趋势

- 身体趋势
- 力量趋势
- 阶段总结

#### 日历

- 每日训练记录状态
- 每日身体记录状态
- 日期详情
- 快速补录

#### 我的

- 个人资料
- 目标设定
- 手机号绑定
- 提醒设置
- 教练申请
- 学员管理
- 数据导出
- 隐私政策
- 用户协议
- 删除申请

## 7. 小程序端页面清单

### 7.1 登录与账号

- 登录授权页
- 手机号绑定页

### 7.2 首页

- 首页看板页

### 7.3 身体记录

- 身体记录列表页
- 身体记录新增/编辑页
- 身体记录详情页

### 7.4 训练记录

- 训练记录列表页
- 训练记录新增/编辑页
- 训练记录详情页
- 动作历史表现页

### 7.5 照片与报告

- 照片列表页
- 照片上传页
- 照片对比页
- 报告列表页
- 报告上传页
- 报告详情页

### 7.6 趋势分析

- 身体趋势页
- 力量趋势页
- 阶段总结列表页
- 阶段总结详情页

### 7.7 日历

- 训练日历页
- 日期详情页

### 7.8 我的

- 我的主页
- 个人资料页
- 目标设定页
- 提醒设置页
- 数据导出页
- 教练申请页
- 教练申请状态页
- 删除申请页
- 用户协议页
- 隐私政策页

### 7.9 教练端页面

- 学员列表页
- 学员详情页
- 代录身体记录页
- 代录训练记录页

## 8. 后台管理端信息架构

### 8.1 一级模块

- 仪表盘
- 用户管理
- 角色管理
- 教练申请审批
- 教练/学员关系管理
- 数据管理
- 数据报表
- 数据导出
- 删除申请处理
- 操作日志
- 系统配置（预留）

### 8.2 模块说明

#### 仪表盘

- 总用户数
- 教练数
- 学员数
- 活跃用户数
- 身体/训练记录总量
- 趋势图

#### 用户管理

- 用户列表、搜索、详情、删除

#### 角色管理

- 普通用户/教练/管理员设置

#### 教练申请审批

- 查看申请、审批通过、审批驳回

#### 教练/学员关系管理

- 绑定、变更、解绑

#### 数据管理

- 身体记录管理
- 训练记录管理
- 照片与报告查看

#### 数据报表

- 用户增长
- 活跃统计
- 记录统计
- 覆盖率统计

#### 数据导出

- 用户数据导出
- 身体记录导出
- 训练记录导出
- 教练申请与关系数据导出

#### 删除申请处理

- 查看申请
- 审核与执行

#### 操作日志

- 审批、角色设置、删除、导出、关系变更留痕

## 9. 后台管理端页面清单

- 管理后台登录页
- 仪表盘页
- 用户列表页
- 用户详情页
- 角色设置页
- 教练申请列表页
- 教练申请审批页
- 教练列表页
- 学员绑定/变更页
- 身体记录列表页
- 身体记录详情页
- 训练记录列表页
- 训练记录详情页
- 照片/报告查看页
- 数据报表页
- 导出任务页
- 删除申请列表页
- 删除申请处理页
- 操作日志页
- 系统配置页（预留动作字典、指标字典）

## 10. 数据库设计原则

- 账号信息、业务档案、记录数据、关系数据、文件数据、审计数据分层设计
- 所有核心业务表支持 `created_at`、`updated_at`、`deleted_at`
- 手机号等敏感字段采用加密存储
- 文件只存元数据，实体文件存对象存储
- 所有代录和后台关键动作均记录操作人信息
- 角色与关系设计需要支持后续扩展
- 优先逻辑删除，保证运营可追溯

## 11. 核心数据库表设计

### 11.1 账号与用户域

#### users

- 用户账号主表
- 核心字段：`id`、`wechat_openid`、`wechat_unionid`、`phone_encrypted`、`phone_masked`、`nickname`、`avatar_url`、`status`、`last_login_at`

#### user_profiles

- 用户档案
- 核心字段：`user_id`、`gender`、`age`、`height_cm`、`training_stage`、`remark`

#### user_roles

- 用户角色关系
- 核心字段：`user_id`、`role_code`、`status`、`granted_by`、`granted_at`、`revoked_at`

### 11.2 目标与档案域

#### user_goals

- 健身目标
- 核心字段：`user_id`、`goal_type`、`target_weight`、`target_body_fat`、`target_measurement_json`、`target_strength_json`、`start_date`、`end_date`、`status`

### 11.3 身体记录域

#### body_records

- 单次身体记录主表
- 核心字段：`user_id`、`record_date`、`height_cm`、`weight_kg`、`body_fat_rate`、`skeletal_muscle_kg`、`bmi`、`chest_cm`、`waist_cm`、`hip_cm`、`arm_cm`、`thigh_cm`、`calf_cm`、`shoulder_cm`、`remark`、`created_by`、`created_by_role`

#### body_record_items（可选扩展）

- 用于扩展更多体测指标
- 核心字段：`body_record_id`、`metric_code`、`metric_name`、`metric_value`

### 11.4 训练记录域

#### training_records

- 一次训练主记录
- 核心字段：`user_id`、`record_date`、`body_part`、`note`、`total_volume`、`created_by`、`created_by_role`

#### training_exercises

- 一次训练中的动作记录
- 核心字段：`training_record_id`、`exercise_code`、`exercise_name`、`sort_order`、`max_weight`、`total_volume`、`estimated_one_rm`

#### training_sets

- 动作下的组数据
- 核心字段：`training_exercise_id`、`set_no`、`weight_kg`、`reps`、`volume`

### 11.5 文件域

#### reports

- 体测报告
- 核心字段：`user_id`、`body_record_id`、`report_date`、`file_url`、`file_type`、`file_name`、`remark`、`uploaded_by`

#### progress_photos

- 身体照片
- 核心字段：`user_id`、`shot_date`、`photo_type`、`file_url`、`remark`、`uploaded_by`

### 11.6 审批与关系域

#### coach_applications

- 教练申请
- 核心字段：`user_id`、`application_text`、`status`、`submitted_at`、`reviewed_by`、`reviewed_at`、`review_remark`

#### coach_student_relations

- 教练与学员关系
- 核心字段：`coach_user_id`、`student_user_id`、`status`、`bound_by`、`bound_at`、`unbound_at`

### 11.7 运营与审计域

#### delete_requests

- 删除申请
- 核心字段：`user_id`、`reason`、`status`、`submitted_at`、`reviewed_by`、`reviewed_at`、`review_remark`、`completed_at`

#### export_tasks

- 导出任务
- 核心字段：`requester_id`、`requester_role`、`export_type`、`filter_json`、`file_url`、`status`、`error_message`

#### admin_operation_logs

- 后台操作日志
- 核心字段：`operator_id`、`operator_role`、`action_type`、`target_type`、`target_id`、`detail_json`、`ip`

### 11.8 字典与配置域

- `dict_exercises`：动作字典
- `dict_body_metrics`：身体指标字典
- `notification_settings`：提醒设置
- `summary_snapshots`：阶段总结快照，可作为后续增强

## 12. 核心实体关系说明

- 一个 `users` 对应一个 `user_profiles`
- 一个 `users` 可对应多个 `user_roles`
- 一个 `users` 可对应多个 `user_goals`
- 一个 `users` 可对应多条 `body_records`
- 一条 `body_records` 可关联多个 `reports`
- 一个 `users` 可对应多条 `training_records`
- 一条 `training_records` 可包含多条 `training_exercises`
- 一条 `training_exercises` 可包含多条 `training_sets`
- 一个 `users` 可提交多个 `coach_applications`
- 一个教练可关联多个学员，但一个学员同一时刻仅归属一个主教练
- 一个 `users` 可提交多个 `delete_requests`
- 管理员关键操作都应落到 `admin_operation_logs`

## 13. 技术方案建议

### 13.1 前端技术

#### 小程序端

- 推荐：Taro + React + TypeScript
- 原因：便于组件化、状态管理和未来可能的多端扩展

#### 后台管理端

- 推荐：React + Ant Design Pro
- 原因：后台模板成熟、表格筛选和权限布局效率高

### 13.2 后端技术

- 推荐：NestJS + TypeScript
- 原因：模块化强，适合多业务模块拆分；权限守卫、DTO 校验、拦截器机制成熟；与前端 TypeScript 技术栈统一，开发效率高

### 13.3 数据与基础设施

- `MySQL 8.0`：存储核心业务数据
- `Redis`：登录态缓存、验证码、频控、任务状态缓存
- `对象存储`：推荐腾讯云 COS，存储照片、报告、导出文件
- `消息/任务系统`：用于导出任务、阶段总结生成、提醒任务，可选 BullMQ 或 NestJS 自带调度方案

### 13.4 图表与数据展示

- 小程序端：uCharts 或 F2
- 后台端：ECharts

### 13.5 部署方案

- 后端：容器化部署
- 网关：Nginx
- 前端后台：静态资源部署到 CDN 或 Nginx
- 文件：对象存储私有桶
- 运行环境：测试、预发、生产分环境隔离

## 14. 系统架构设计

### 14.1 总体架构

- 客户端层：微信小程序、后台 Web 管理端
- 接入层：Nginx / API 网关
- 应用服务层：统一业务 API 服务
- 业务模块层：认证模块、用户模块、角色模块、目标模块、身体记录模块、训练记录模块、文件模块、趋势模块、教练申请模块、教练学员关系模块、导出模块、删除申请模块、审计日志模块、仪表盘/报表模块
- 基础设施层：MySQL、Redis、对象存储、任务调度、日志监控

### 14.2 后端模块建议

- `auth`
- `users`
- `profiles`
- `roles`
- `goals`
- `body-records`
- `training-records`
- `files`
- `trends`
- `coach-applications`
- `coach-student-relations`
- `exports`
- `delete-requests`
- `notifications`
- `admin-logs`
- `dashboard`

## 15. 核心接口设计方向

### 15.1 认证与用户

- `POST /auth/wx-login`
- `POST /auth/bind-phone`
- `GET /me`
- `PUT /me/profile`
- `GET /me/goals`
- `POST /me/goals`
- `PUT /me/goals/:id`

### 15.2 身体记录

- `GET /body-records`
- `POST /body-records`
- `GET /body-records/:id`
- `PUT /body-records/:id`
- `DELETE /body-records/:id`

### 15.3 训练记录

- `GET /training-records`
- `POST /training-records`
- `GET /training-records/:id`
- `PUT /training-records/:id`
- `DELETE /training-records/:id`

### 15.4 文件上传

- `POST /photos`
- `GET /photos`
- `DELETE /photos/:id`
- `POST /reports`
- `GET /reports`
- `DELETE /reports/:id`
- `GET /files/sign-url`

### 15.5 趋势与日历

- `GET /trends/body`
- `GET /trends/training`
- `GET /calendar`

### 15.6 教练相关

- `POST /coach-applications`
- `GET /coach-applications/me`
- `GET /coach/students`
- `GET /coach/students/:id`
- `POST /coach/students/:id/body-records`
- `POST /coach/students/:id/training-records`

### 15.7 后台管理

- `GET /admin/users`
- `GET /admin/users/:id`
- `PUT /admin/users/:id/role`
- `GET /admin/coach-applications`
- `POST /admin/coach-applications/:id/approve`
- `POST /admin/coach-applications/:id/reject`
- `GET /admin/relations`
- `POST /admin/relations`
- `PUT /admin/relations/:id`
- `DELETE /admin/relations/:id`
- `GET /admin/data/body-records`
- `GET /admin/data/training-records`
- `POST /admin/exports`
- `GET /admin/export-tasks`
- `GET /admin/delete-requests`
- `POST /admin/delete-requests/:id/process`

## 16. 权限与安全设计

- 登录态校验：所有业务接口必须校验用户身份
- 角色校验：基于 RBAC 做角色能力控制
- 数据归属校验：教练和用户访问数据时必须检查资源归属
- 文件鉴权：文件访问不直接暴露真实地址，使用签名链接或服务端中转
- 手机号加密：数据库只存密文和脱敏值
- 高风险动作控制：设为管理员、删除用户、数据导出、删除申请执行
- 审计留痕：角色变更、审批、绑定关系、导出、删除均记录日志

## 17. 趋势、统计与导出实现建议

- 趋势图在 MVP 阶段优先采用实时查询聚合
- 高频查询结果可做 Redis 缓存
- 阶段总结可先按需生成，后续再做定时快照
- 导出功能采用异步任务，不阻塞前台请求
- 后台统计后续可增加日汇总表，减少大表直接扫描

## 18. 合规与隐私落地要求

- 首版必须具备：用户协议、隐私政策、微信授权说明、手机号授权说明、删除申请入口
- 上传身体照片前展示隐私提示
- 管理员可见范围需在隐私政策中明确
- 用户删除申请必须支持审核和处理闭环

## 19. 推荐开发优先级与排期顺序

### 19.1 阶段 1

- 账号登录
- 用户/角色模型
- 个人资料
- 身体记录
- 训练记录

### 19.2 阶段 2

- 趋势分析
- 照片/报告上传
- 教练申请
- 学员关系
- 代录能力

### 19.3 阶段 3

- 后台用户管理
- 后台角色管理
- 教练审批
- 数据管理
- 数据导出

### 19.4 阶段 4

- 首页看板
- 日历
- 提醒设置
- 阶段总结
- 删除申请
- 操作日志与基础报表

### 19.5 阶段 5

- 联调测试
- 权限测试
- 导出压测
- 合规检查
- 小范围试运营

## 20. 结论

- 该项目的 MVP 边界清晰，适合采用先形成记录与管理闭环，再做体验增强的策略推进
- 产品核心不是复杂社交，而是个人记录 + 教练协作 + 后台管理的数据型工具
- 技术上建议优先保证账号体系、权限体系、数据模型和文件鉴权正确，避免后续返工
- 数据库应从首版开始按可扩展方式设计，尤其是角色、关系、记录和文件表
- 如果以真实上线为目标，建议先做稳定可用版本，不在首版引入 OCR、AI 建议、复杂运营能力
