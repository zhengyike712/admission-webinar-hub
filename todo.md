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
