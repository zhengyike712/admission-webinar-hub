# AdmitLens TODO

## 已完成

- [x] 基础活动日程页面（静态数据）
- [x] 学校目录页面
- [x] 多地区筛选（美国、英国、香港、澳大利亚）
- [x] 活动类型筛选
- [x] 搜索功能
- [x] 自动时区转换
- [x] 单场活动添加到 Google Calendar / Apple Calendar (.ics)
- [x] 批量导出日历（多选 + 浮动操作栏 + 批量 .ics）
- [x] Onboarding 弹窗（首次使用引导）
- [x] Onboarding 弹窗更新：日历功能明确说明批量导出
- [x] Footer 覆盖计划更新（英国/香港/澳大利亚已上线，加拿大即将，研究生规划中）
- [x] 项目升级为全栈（后端 + 数据库）
- [x] 数据库表设计（sessions + crawl_logs + subscribers）
- [x] 静态数据导入数据库（seed）
- [x] 后端爬虫服务（crawler.ts）：每日自动爬取各校官网 + AI 解析活动日期
- [x] 每日定时调度器（scheduler.ts）：UTC 02:00 自动触发全量爬取
- [x] 前端从数据库 API 读取活动数据（优先 DB，降级静态数据）
- [x] 数据库扩展：subscribers 表，crawl_logs 添加 consecutiveFailures 字段
- [x] 后端：邮件订阅 tRPC 路由（subscribe / unsubscribe / list / count）
- [x] 后端：爬取发现新活动时向订阅者发送 Manus 通知摘要
- [x] 后端：连续 3 次爬取失败自动发送 Manus 告警通知
- [x] 前端：/admin 路由（爬取日志表格 + 统计 + 手动触发，仅管理员可见）
- [x] 前端：订阅组件接入后端 API（替换 localStorage）

## 待完成

- [ ] 导航栏地区标签添加"即将"角标
- [ ] 已过期活动自动降权（低透明度 + 移至底部）
- [ ] 全选当前筛选结果按钮
- [ ] 管理员页面：单校手动重新爬取按钮

## MVP 发布前修复

- [x] 设置 owner 账号为 admin 权限（登录后自动升级）
- [x] 过期活动自动降权（低透明度 + 移至底部）
- [x] 优化订阅成功提示文案

## Onboarding 卡片优化

- [ ] 扩充「招生官亲自出席」卡片文案，说明直接接触 AO 的具体价值

## 面试入口功能

- [x] 调研美国顶尖本科院校面试政策和报名入口链接（20 所学校：哈佛、耶鲁、普林斯顿、MIT、斯坦福、杜克、达特茅斯等）
- [x] 将面试数据整合到网站，添加「面试入口」第三标签页（含搜索/筛选、卡片展示、直达报名链接）

## 面试入口扩充（第二轮）

- [x] 扩充面试学校数据至 40+ 所（新增 Tufts、Colby、Hamilton、Vassar、Swarthmore、Colgate、Wellesley、Pomona 等，共 42 所）
- [x] 为主动申请面试的学校添加截止日期字段（deadline）
- [x] InterviewCard 组件：展示截止日期，支持添加到 Google Calendar / 下载 .ics
- [x] 更新 Onboarding 引导卡：加入「面试入口」功能介绍卡片（2x2 卡片布局）

## 面试入口扩充（第三轮 - US News Top 100）

- [x] 调研 US News Top 100 中尚未收录的学校面试政策（共 70 所，45 所提供面试）
- [x] 将新学校数据写入 interviews.ts
- [x] 侧边栏添加「近期截止（30天内）」快捷筛选器
- [x] 面试入口 UI 优先级优化（默认标签页改为面试入口，Tab 顺序调整）

## 面试入口 - 申请方式筛选器

- [x] 侧边栏添加「申请方式」筛选器（全部 / 学校主动联系 / 学生主动申请 / 必须）
- [x] i18n 中英文翻译
- [x] filteredInterviews 逻辑支持申请方式筛选

## 面试入口 - 分组展示

- [ ] 面试卡片按申请方式分组（需主动申请 / 学校主动联系 / 必须参加 / 不提供面试）
- [ ] 分组标题含学校数量徽章
- [ ] 空组自动隐藏
- [ ] 筛选器激活时退出分组模式，恢复平铺

## 面试入口 - 地区筛选 + 分组展示

- [x] 检查 interviews.ts 数据结构，确认是否有 region 字段
- [x] 为所有面试数据添加 region 字段（全部 70 所标记为 "US"）
- [x] filteredInterviews 逻辑加入 regionFilter 条件
- [x] 面试卡片按申请方式分组展示（学生主动申请 / 学校主动联系 / 必须参加 / 不提供面试）
- [x] 分组标题含学校数量徽章，空组自动隐藏
- [x] 筛选器激活时退出分组模式，恢复平铺

## Nav 分享功能

- [x] 删除 Nav 右侧地区切换按鈕（美国/英国/香港/澳大利亚）和语言切换按鈕（EN）
- [x] 添加「分享本站」按鈕：复制链接、微信二维码、Twitter/X 分享

## Nav 分享功能 - Web Share API

- [x] 移动端检测 navigator.share，优先调用系统原生分享菜单
- [x] 桌面端保留现有复制链接/微信二维码/Twitter 下拉菜单

## Nav 语言切换

- [x] 扩展 Lang 类型支持 "hi"（印地语）
- [x] 添加印地语完整 i18n 翻译
- [x] Nav 分享按鈕旁添加语言切换按鈕（中/EN/हिं）

## Onboarding 弹窗多语言

- [x] 读取 Onboarding 弹窗硬编码文本
- [x] 将所有文本替换为 i18n 翻译键（中/英/印地语）

## 移动端筛选入口修复

- [x] 在 Tab 栏下方添加「筛选」条形触发按钮（sm:hidden，三语言支持）
- [x] 侧边栏遮罩层已存在（点击关闭）
- [x] 侧边栏标题「筛选」文字接入 t.mobileFilterTitle（修复印地语硬编码）

## 语言持久化 + OG 标签 + 截止日期核实

- [x] 语言偏好 localStorage 持久化（刷新后恢复语言选择）
- [x] 添加 Open Graph meta 标签（og:title, og:image, og:description, og:locale, twitter:card）
- [x] 自动化截止日期核实：后端爬虫脚本 + 管理员触发 tRPC 接口 + 前端展示核实状态

## OG 图片多语言 + 截止日期核实定时化

- [x] 生成英文版 OG 分享图片（og-image-en.png）
- [x] 生成印地语版 OG 分享图片（og-image-hi.png）
- [x] index.html 添加 og:locale:alternate 多语言 meta 标签
- [x] scheduler.ts 添加每周一次截止日期核实定时任务

## 修复 404 爬虫 URL

- [x] 修复 Brown University crawlUrl（404）
- [x] 修复 California Institute of Technology crawlUrl（404）
- [x] 修复 Cornell University crawlUrl（404）
- [x] 修复 Dartmouth College crawlUrl（404）
- [x] 修复 Duke University crawlUrl（404）
- [x] 修复 Georgetown University crawlUrl（404）
- [x] 修复 Johns Hopkins University crawlUrl（404）
- [x] 修复 Massachusetts Institute of Technology crawlUrl（404）
- [x] 修复 Rice University crawlUrl（404）
- [x] 修复 UCLA crawlUrl（404）
- [x] 修复 University of Notre Dame crawlUrl（404）
- [x] 修复 University of Pennsylvania crawlUrl（404）
- [x] 修复 Vanderbilt University crawlUrl（404）
- [x] 修复 Washington University in St. Louis crawlUrl（404）

## 品牌名称国际化

- [x] 将所有硬编码「景深留学」接入 i18n T 对象，随语言切换显示对应翻试

## 国际化进一步完善

- [x] document.title 随语言切换动态更新
- [x] Onboarding 弹窗副标题优化（英文/印地语显示差异化描述）
- [x] 页脚版权行国际化（© 景深留学 / AdmitLens）

## 批量导出栏国际化

- [x] 批量导出浮动栏「已选 N 场活动」接入 T 对象，补充三语言翻试

## 分享弹窗国际化

- [x] 分享弹窗「复制链接」「微信」「X/Twitter」按鈕文案接入 T 对象，补充三语言翻试

## html lang 属性动态化

- [x] 主组件 useEffect 同步更新 document.documentElement.lang（zh/en/hi）

## 硬编码扫描与 meta 动态化

- [x] 扫描并修复所有残余 lang === "zh" 硬编码文案
- [x] useEffect 动态更新 meta[name="description"] content

## 面试分组标签国际化 + Notion 集成

- [x] 面试分组标题（学生主动申请/学校主动联系/必须参加）迁移到 T 对象
- [x] 手动触发全量爬取验证新 URL
- [x] Notion Embed 嵌入小窗口（/embed 路由，适配 Notion iframe 嵌入）
- [x] Notion Template 导入入口页（提供申请追踪模板下载 + 使用说明）

## 页脚 Notion 集成入口

- [x] 页脚添加 Notion 集成入口链接（指向 /notion-template，三语言支持）

## Notion 入口位置调整 + Onboarding 更新

- [x] 将 Notion 集成入口移至 Hero 区域下方横幅（好信息，早知道 胖吧位置）
- [x] Onboarding 弹窗加入 Notion 集成功能卡片（第五张）

## Hero 布局调整 + API + 徽章

- [x] Hero 区域改为左右布局，Notion 集成入口卡片置于右侧
- [x] 开放 /api/public/sessions 公共 JSON API（无需认证，支持 school/upcoming/limit 参数）
- [x] /embed 页面添加「数据每日更新 · 直连各校官方 Portal」徽章

## AI 可见性 + 集成扩展 + API 文档

- [x] 添加 llms.txt（含经济性定位：成本对比表格 + 使用场景指导）
- [x] 添加 JSON-LD 结构化数据（WebSite + Dataset + Organization schema）
- [x] robots.txt 明确允许 GPTBot/PerplexityBot/ClaudeBot/anthropic-ai 爬取
- [x] sitemap.xml 生成（主页/notion-template/api-docs/embed）
- [x] /notion-template 重构为集成中心（Notion/Obsidian/Anytype/API 四标签页）
- [x] Obsidian 集成：HTML 代码块 + Dataview dataviewjs 两种方案
- [x] Anytype 集成：嵌入块 + 链接生成器
- [x] 创建 /api-docs API 文档页（参数表、代码示例、响应字段说明、使用场景）

## 飞书/wolai 集成 + 面试分组折叠

- [x] /notion-template 添加飞书（Feishu）和 wolai 集成标签页（与 Notion 并列入口）
- [x] 面试分组：「不提供面试」默认折叠，提供展开按鈕
- [x] 面试分组：「学校主动联系」默认折叠，提供展开按鈕
- [x] 面试分组：「学生主动申请」默认显示合适数量（如 8 所），提供「展开全部 N 所」按鈕

## UI 优化第三批

- [x] 主页 Notion 集成卡片改为「集成中心」，用平台 favicon 展示支持的工具（Notion/飞书/Obsidian/Anytype/wolai）
- [x] onboarding 弹窗集成功能卡升级为多平台展示
- [x] 面试页面加「仅看学生可主动申请」快捷筛选按鈕
- [x] llms.txt 加 Sitemap 字段（robots.txt 已有）

## 集成中心浮层 + footer 更新

- [x] 集成中心改为主页内浮层（不跳转），用户可自行选择在新 tab 打开
- [x] footer Notion 集成卡片改为集成中心入口（展示 5 个平台 favicon）

## 集成中心二级浮层 + llms.txt MCP

- [x] 集成中心浮层：每个平台条目点击后在浮层内展开详细内容（二级面板），不跳转页面
- [x] llms.txt 添加 MCP Server 声明（工具列表 + Token 成本对比表）

## AI 预习材料 + 面试备考工具 + Chrome 扩展集成

- [x] tRPC 后端：AI 预习材料生成接口（含 IP 限次逻辑，Free 3次/天，超出显示升级提示）
- [x] session 卡片：添加「AI 预习」按鈕，展开面板显示话题摘要+建议提问+词汇表
- [x] 面试卡片：每所学校添加「备考工具」入口（按面试风格分类，默认折叠）
- [x] 集成中心浮层：新增 Chrome 扩展标签页（即将上线展示）

## OpenAPI Schema + ChatGPT Actions + Claude

- [ ] 生成 openapi.json 并部署到 /openapi.json 路由
- [ ] llms.txt 添加 OpenAPI schema 链接
- [ ] 注册 ChatGPT Actions（GPT Builder）
- [ ] 调研 Claude Tool Use / MCP 注册机制

## Claude 工具集成文档

- [x] 集成中心浮层添加 Claude 标签页（MCP 配置 + API tool_use 代码示例）
- [x] /api-docs 页面添加 Claude 集成专区（三种方式 + Python 代码示例 + openapi.json 下载链接）

## 手机端精简布局

- [ ] 手机端隐藏- [x] 手机端隐藏主内容区域（活动列表、筛选器、面试区等）
- [x] 手机端只显示：功能卡片 + 电脑端连接提示 + 集成快捷入口

## 手机端「发送到电脑」功能

- [x] 手机端电脑连接提示区域：添加二维码（QR code）展示当前 URL
- [x] 手机端：Web Share API 系统分享按鈕（优先调用系统原生分享菜单）
- [x] 手机端：邮件发送入口（输入邮箱，后端发送带链接的邮件）
- [x] 后端：sendLinkEmail tRPC 接口（调用 Manus 通知 API 发送邮件）

## 品牌名更改：景深留学 → 景深

- [x] 扫描并替换所有文件中的「景深留学」为「景深」

## Onboarding 弹窗文案优化

- [x] 将三条子要点文案调整为「直接信息获取」视角
- [x] 副标题改为「跳过中介，直达招生官」

## Onboarding 功能卡片优化

- [x] 将「自动时区转换」卡片替换为「集成到你的工作流」（支持嵌入 Notion/飞书/Obsidian）
- [x] 删除手机端页脚集成中心重复卡片，只保留一个

## 用户自带 API Key 的悬浮 AI 聊天助手

- [x] 数据库 schema：chat_sessions 和 chat_messages 表
- [x] 后端 tRPC 接口：保存/获取聊天记录
- [x] 前端行为追踪逻辑（记录学校类型/地区/活动类型浏览偏好）
- [x] 动态问题库（40 个问题，按场景分类）
- [x] 悬浮 AI 聊天窗口组件（API Key 设置、聊天界面、推荐问题卡片）
- [x] 单元测试

## AI 聊天助手优化

- [x] 添加预设 system prompt（美国本科申请场景）
- [x] 聊天窗口添加「清空记录」按鈕
- [x] 推荐问题支持印地语（textHi 字段）

## AI 助手引导式接入流程

- [x] 未接入时按鈕显示「接入 AI 助手」，接入后改为「 AI 助手」
- [x] 3 步引导向导：选服务商 → 粘贴 Key 并验证 → 进入对话

## 申请结果 Portal 汇总页面

- [x] 收集各校 applicant portal URL 和结果发布时间
- [x] 创建 portal 数据文件
- [x] 实现 /portals 页面（搜索、分类、portal 链接、结果时间）
- [x] 主页导航添加 Portals 入口

## Portal 状态自动化 + 结果提醒订阅

- [x] portals.ts 改为日期驱动（用 releaseDate 字段替代 released 布尔值）
- [x] 前端自动计算已出/待出状态
- [x] 数据库添加 portal_subscriptions 表
- [x] tRPC 接口：订阅/取消订阅
- [x] 定时任务：每天检测到期学校并发送邮件通知
- [x] /portals 页面添加订阅入口 UI

## UI 文案优化

- [ ] Tab 导航「结果 Portal」改为「Applicant Portal 入口」
- [ ] 删除面试页面统计数据区域（共 70 所学校面试信息· 45 提供面试· 25 不提供）

## 语言自动检测（系统语言随动）

- [x] 创建 client/src/lib/lang.ts 共享工具（detectBrowserLang / getInitialLang / saveLang）
- [x] Home.tsx：语言初始化改用 getInitialLang()，切换时改用 saveLang()
- [x] Portals.tsx：语言初始化改用 getInitialLang()，切换时改用 saveLang()
- [x] NotionTemplate.tsx：URL 参数优先，无参数时 getInitialLang()
- [x] NotionEmbed.tsx：URL 参数优先，无参数时 detectBrowserLang()
- [x] ApiDocs.tsx：URL 参数优先，无参数时 detectBrowserLang()（仅 zh/en）
