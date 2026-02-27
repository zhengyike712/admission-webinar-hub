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
