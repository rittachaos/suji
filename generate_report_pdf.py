from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


OUTPUT_FILE = "塑迹_MVP方案报告.pdf"


def register_fonts():
    pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))


def build_styles():
    styles = getSampleStyleSheet()

    title = ParagraphStyle(
        "TitleCN",
        parent=styles["Title"],
        fontName="STSong-Light",
        fontSize=20,
        leading=28,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F2937"),
        spaceAfter=12,
    )
    heading1 = ParagraphStyle(
        "Heading1CN",
        parent=styles["Heading1"],
        fontName="STSong-Light",
        fontSize=15,
        leading=22,
        textColor=colors.HexColor("#111827"),
        spaceBefore=10,
        spaceAfter=8,
    )
    heading2 = ParagraphStyle(
        "Heading2CN",
        parent=styles["Heading2"],
        fontName="STSong-Light",
        fontSize=12.5,
        leading=18,
        textColor=colors.HexColor("#1F2937"),
        spaceBefore=8,
        spaceAfter=6,
    )
    body = ParagraphStyle(
        "BodyCN",
        parent=styles["BodyText"],
        fontName="STSong-Light",
        fontSize=10.5,
        leading=16,
        textColor=colors.HexColor("#374151"),
        spaceAfter=4,
    )
    bullet = ParagraphStyle(
        "BulletCN",
        parent=body,
        leftIndent=14,
        firstLineIndent=-10,
        bulletIndent=0,
        spaceAfter=3,
    )
    return title, heading1, heading2, body, bullet


REPORT = [
    ("title", "塑迹 MVP 方案报告"),
    ("h1", "1. 项目概述"),
    ("bullet", "项目名称：塑迹"),
    ("bullet", "产品形态：微信小程序 + 后台管理系统"),
    ("bullet", "核心目标：帮助健身用户长期记录身体变化与训练表现，同时支撑管理员完成用户、角色、学员关系和数据运营管理。"),
    ("bullet", "首版定位：MVP（最小可用版本），面向小范围真实用户上线使用。"),
    ("bullet", "首版不含内容：社区互动、课程体系、会员体系、电商功能、AI 智能建议、蓝牙设备接入。"),
    ("h1", "2. 产品目标与价值"),
    ("h2", "2.1 面向用户"),
    ("bullet", "集中记录体重、体脂、围度、训练表现、照片和体测报告。"),
    ("bullet", "形成长期趋势与阶段回顾。"),
    ("bullet", "降低记录门槛，增强训练坚持感。"),
    ("h2", "2.2 面向教练"),
    ("bullet", "管理名下学员。"),
    ("bullet", "查看学员记录和趋势。"),
    ("bullet", "代录学员身体与训练数据。"),
    ("h2", "2.3 面向管理员"),
    ("bullet", "完成用户管理、角色审批、学员关系配置、全量数据查看、数据导出和删除申请处理。"),
    ("h2", "2.4 面向后续迭代"),
    ("bullet", "沉淀结构化健身数据，为后续智能分析、教练协同和更多报表能力打基础。"),
    ("h1", "3. 角色与权限模型"),
    ("h2", "3.1 普通用户"),
    ("bullet", "查看和管理本人数据，维护个人资料与目标，记录身体指标、训练数据、照片和报告。"),
    ("bullet", "查看趋势、日历、阶段总结，提交教练申请和删除申请。"),
    ("h2", "3.2 教练"),
    ("bullet", "拥有普通用户全部能力，可查看和管理名下学员，代录学员身体记录与训练记录，并查看学员趋势。"),
    ("h2", "3.3 管理员"),
    ("bullet", "查看全平台用户和数据，审批教练申请，设置和变更角色，管理教练与学员关系，导出数据，处理删除申请。"),
    ("h2", "3.4 权限边界"),
    ("bullet", "普通用户仅访问本人数据；教练仅访问自己名下学员数据；管理员访问全量数据。"),
    ("bullet", "照片、报告、手机号等敏感信息必须走权限校验。"),
    ("h1", "4. MVP 功能拆解"),
    ("h2", "4.1 P0 必做功能"),
    ("bullet", "账号体系：微信一键登录、手机号授权绑定、首次登录创建普通用户账号。"),
    ("bullet", "个人资料与目标：个人资料维护、健身目标创建与编辑。"),
    ("bullet", "身体记录：新增、编辑、删除，支持补录历史数据，自动计算 BMI。"),
    ("bullet", "训练记录：支持一训多动作、多组数据，自动计算最大重量、总容量、估算 1RM。"),
    ("bullet", "照片与报告：上传身体照片、上传体测报告（图片/PDF）、关联日期和备注，并做权限控制。"),
    ("bullet", "趋势分析：支持身体指标趋势、力量趋势、时间范围筛选。"),
    ("bullet", "教练能力：教练申请、审批状态查看、学员列表与详情、代录学员数据。"),
    ("bullet", "后台管理：用户管理、角色管理、教练申请审批、教练/学员关系管理、数据查看、数据导出、删除申请处理。"),
    ("h2", "4.2 P1 建议纳入首版但可稍后补齐"),
    ("bullet", "首页看板、训练日历、提醒开关、阶段总结、后台仪表盘、基础数据报表、操作日志。"),
    ("h2", "4.3 P2 预留扩展"),
    ("bullet", "OCR 识别体测报告、分享海报、多管理员权限体系、教练授权数据导出、更复杂的消息提醒机制。"),
    ("h1", "5. MVP 上线判断标准"),
    ("bullet", "用户可完成登录、绑定手机号、个人资料维护和目标设定。"),
    ("bullet", "用户可记录并管理身体指标和训练记录，可上传照片和报告，并查看基础趋势分析。"),
    ("bullet", "教练可申请、被审批并进入教练能力页，可查看学员并代录数据。"),
    ("bullet", "管理员可完成用户、角色、申请、关系和数据管理，数据导出与删除申请流程可闭环。"),
    ("bullet", "合规页面与隐私机制可正常使用。"),
    ("h1", "6. 小程序端信息架构"),
    ("bullet", "一级导航：首页、记录、趋势、日历、我的。"),
    ("bullet", "首页：最新身体指标、最近一次训练摘要、目标进度、连续打卡、待办提醒、快捷入口。"),
    ("bullet", "记录：身体记录、训练记录、照片管理、报告管理。"),
    ("bullet", "趋势：身体趋势、力量趋势、阶段总结。"),
    ("bullet", "日历：每日训练记录状态、每日身体记录状态、日期详情、快速补录。"),
    ("bullet", "我的：个人资料、目标设定、手机号绑定、提醒设置、教练申请、学员管理、数据导出、隐私政策、用户协议、删除申请。"),
    ("h1", "7. 小程序端页面清单"),
    ("bullet", "登录与账号：登录授权页、手机号绑定页。"),
    ("bullet", "首页：首页看板页。"),
    ("bullet", "身体记录：列表页、新增/编辑页、详情页。"),
    ("bullet", "训练记录：列表页、新增/编辑页、详情页、动作历史表现页。"),
    ("bullet", "照片与报告：照片列表页、照片上传页、照片对比页、报告列表页、报告上传页、报告详情页。"),
    ("bullet", "趋势分析：身体趋势页、力量趋势页、阶段总结列表页、阶段总结详情页。"),
    ("bullet", "日历：训练日历页、日期详情页。"),
    ("bullet", "我的：我的主页、个人资料页、目标设定页、提醒设置页、数据导出页、教练申请页、教练申请状态页、删除申请页、用户协议页、隐私政策页。"),
    ("bullet", "教练端页面：学员列表页、学员详情页、代录身体记录页、代录训练记录页。"),
    ("h1", "8. 后台管理端信息架构"),
    ("bullet", "一级模块：仪表盘、用户管理、角色管理、教练申请审批、教练/学员关系管理、数据管理、数据报表、数据导出、删除申请处理、操作日志、系统配置（预留）。"),
    ("bullet", "数据管理包含：身体记录管理、训练记录管理、照片与报告查看。"),
    ("bullet", "数据报表包含：用户增长、活跃统计、记录统计、覆盖率统计。"),
    ("bullet", "数据导出包含：用户基础信息、身体记录、训练记录、教练申请、关系数据导出。"),
    ("h1", "9. 后台管理端页面清单"),
    ("bullet", "管理后台登录页、仪表盘页、用户列表页、用户详情页、角色设置页、教练申请列表页、教练申请审批页。"),
    ("bullet", "教练列表页、学员绑定/变更页、身体记录列表页、身体记录详情页、训练记录列表页、训练记录详情页。"),
    ("bullet", "照片/报告查看页、数据报表页、导出任务页、删除申请列表页、删除申请处理页、操作日志页、系统配置页。"),
    ("h1", "10. 数据库设计原则"),
    ("bullet", "账号信息、业务档案、记录数据、关系数据、文件数据、审计数据分层设计。"),
    ("bullet", "所有核心业务表支持 created_at、updated_at、deleted_at。"),
    ("bullet", "手机号等敏感字段采用加密存储，文件只存元数据，实体文件存对象存储。"),
    ("bullet", "所有代录和后台关键动作均记录操作人信息；优先逻辑删除，保证运营可追溯。"),
    ("h1", "11. 核心数据库表设计"),
    ("bullet", "账号与用户域：users、user_profiles、user_roles。"),
    ("bullet", "目标与档案域：user_goals。"),
    ("bullet", "身体记录域：body_records、body_record_items（扩展）。"),
    ("bullet", "训练记录域：training_records、training_exercises、training_sets。"),
    ("bullet", "文件域：reports、progress_photos。"),
    ("bullet", "审批与关系域：coach_applications、coach_student_relations。"),
    ("bullet", "运营与审计域：delete_requests、export_tasks、admin_operation_logs。"),
    ("bullet", "字典与配置域：dict_exercises、dict_body_metrics、notification_settings、summary_snapshots。"),
    ("h1", "12. 核心实体关系说明"),
    ("bullet", "一个 users 对应一个 user_profiles，可对应多个 user_roles、user_goals、body_records、training_records、coach_applications、delete_requests。"),
    ("bullet", "一条 body_records 可关联多个 reports；一条 training_records 可包含多条 training_exercises；一条 training_exercises 可包含多条 training_sets。"),
    ("bullet", "一个教练可关联多个学员，但一个学员同一时刻仅归属一个主教练。"),
    ("bullet", "管理员关键操作都应落到 admin_operation_logs。"),
    ("h1", "13. 技术方案建议"),
    ("bullet", "小程序端推荐 Taro + React + TypeScript，便于组件化和未来扩展。"),
    ("bullet", "后台管理端推荐 React + Ant Design Pro，适合快速搭建中后台。"),
    ("bullet", "后端推荐 NestJS + TypeScript，适合模块化业务拆分、权限守卫和 DTO 校验。"),
    ("bullet", "基础设施推荐 MySQL 8.0、Redis、腾讯云 COS、BullMQ 或定时调度。"),
    ("bullet", "图表推荐小程序使用 uCharts 或 F2，后台使用 ECharts。"),
    ("bullet", "部署建议采用 Nginx + 容器化后端 + 静态资源托管 + 私有对象存储。"),
    ("h1", "14. 系统架构设计"),
    ("bullet", "客户端层：微信小程序、后台 Web 管理端。"),
    ("bullet", "接入层：Nginx / API 网关。"),
    ("bullet", "应用服务层：统一业务 API 服务。"),
    ("bullet", "业务模块层：认证、用户、角色、目标、身体记录、训练记录、文件、趋势、教练申请、教练学员关系、导出、删除申请、审计日志、仪表盘/报表。"),
    ("bullet", "基础设施层：MySQL、Redis、对象存储、任务调度、日志监控。"),
    ("h1", "15. 核心接口设计方向"),
    ("bullet", "认证与用户：POST /auth/wx-login、POST /auth/bind-phone、GET /me、PUT /me/profile、GET/POST/PUT /me/goals。"),
    ("bullet", "身体记录：GET/POST /body-records、GET/PUT/DELETE /body-records/:id。"),
    ("bullet", "训练记录：GET/POST /training-records、GET/PUT/DELETE /training-records/:id。"),
    ("bullet", "文件上传：POST/GET/DELETE /photos、POST/GET/DELETE /reports、GET /files/sign-url。"),
    ("bullet", "趋势与日历：GET /trends/body、GET /trends/training、GET /calendar。"),
    ("bullet", "教练相关：POST /coach-applications、GET /coach-applications/me、GET /coach/students、GET /coach/students/:id、POST /coach/students/:id/body-records、POST /coach/students/:id/training-records。"),
    ("bullet", "后台管理：/admin/users、/admin/coach-applications、/admin/relations、/admin/data、/admin/exports、/admin/export-tasks、/admin/delete-requests。"),
    ("h1", "16. 权限与安全设计"),
    ("bullet", "所有业务接口必须校验登录态。"),
    ("bullet", "基于 RBAC 做角色能力控制。"),
    ("bullet", "教练和用户访问数据时必须检查资源归属。"),
    ("bullet", "文件访问不直接暴露真实地址，使用签名链接或服务端中转。"),
    ("bullet", "手机号加密存储，只保留脱敏展示值。"),
    ("bullet", "高风险动作包括设为管理员、删除用户、数据导出、删除申请执行，均需加强控制和记录。"),
    ("h1", "17. 趋势、统计与导出实现建议"),
    ("bullet", "趋势图在 MVP 阶段优先采用实时查询聚合。"),
    ("bullet", "高频查询结果可做 Redis 缓存。"),
    ("bullet", "阶段总结可先按需生成，后续再做定时快照。"),
    ("bullet", "导出功能采用异步任务，不阻塞前台请求。"),
    ("bullet", "后台统计后续可增加日汇总表，减少大表直接扫描。"),
    ("h1", "18. 合规与隐私落地要求"),
    ("bullet", "首版必须具备：用户协议、隐私政策、微信授权说明、手机号授权说明、删除申请入口。"),
    ("bullet", "上传身体照片前展示隐私提示。"),
    ("bullet", "管理员可见范围需在隐私政策中明确。"),
    ("bullet", "用户删除申请必须支持审核和处理闭环。"),
    ("h1", "19. 推荐开发优先级与排期顺序"),
    ("bullet", "阶段 1：账号登录、用户/角色模型、个人资料、身体记录、训练记录。"),
    ("bullet", "阶段 2：趋势分析、照片/报告上传、教练申请、学员关系、代录能力。"),
    ("bullet", "阶段 3：后台用户管理、后台角色管理、教练审批、数据管理、数据导出。"),
    ("bullet", "阶段 4：首页看板、日历、提醒设置、阶段总结、删除申请、操作日志与基础报表。"),
    ("bullet", "阶段 5：联调测试、权限测试、导出压测、合规检查、小范围试运营。"),
    ("h1", "20. 结论"),
    ("bullet", "该项目的 MVP 边界清晰，适合先形成记录与管理闭环，再做体验增强。"),
    ("bullet", "产品核心不是复杂社交，而是个人记录 + 教练协作 + 后台管理的数据型工具。"),
    ("bullet", "技术上建议优先保证账号体系、权限体系、数据模型和文件鉴权正确，避免后续返工。"),
    ("bullet", "数据库应从首版开始按可扩展方式设计，尤其是角色、关系、记录和文件表。"),
    ("bullet", "如果以真实上线为目标，建议先做稳定可用版本，不在首版引入 OCR、AI 建议、复杂运营能力。"),
]


def build_pdf(output_file: str):
    register_fonts()
    title_style, h1_style, h2_style, body_style, bullet_style = build_styles()

    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="塑迹 MVP 方案报告",
        author="OpenCode",
    )

    story = []
    for kind, text in REPORT:
        safe_text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        if kind == "title":
            story.append(Paragraph(safe_text, title_style))
            story.append(Spacer(1, 4))
        elif kind == "h1":
            story.append(Paragraph(safe_text, h1_style))
        elif kind == "h2":
            story.append(Paragraph(safe_text, h2_style))
        elif kind == "body":
            story.append(Paragraph(safe_text, body_style))
        elif kind == "bullet":
            story.append(Paragraph(safe_text, bullet_style, bulletText="-"))

    doc.build(story)


if __name__ == "__main__":
    build_pdf(OUTPUT_FILE)
