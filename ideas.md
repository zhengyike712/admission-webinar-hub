# 设计方案探索

## 项目背景
美国本科招生 Webinar 导航站，面向中国留学生，收录 US News 综合大学 Top 50 和文理学院 Top 30 的官方招生视频资源。

---

<response>
<probability>0.07</probability>
<idea>

**Design Movement**: 学术档案馆 × 新闻编辑室（Editorial Archive）

**Core Principles**:
1. 信息密度优先——像《经济学人》一样，用排版本身传递专业感
2. 克制的色彩——以黑白为主调，用深藏青（Deep Teal）作为唯一强调色
3. 网格即秩序——严格的列式布局，每个学校卡片像档案夹一样整齐排列
4. 文字即设计——标题用衬线体，正文用无衬线体，形成强烈对比

**Color Philosophy**:
- 主背景：米白色 #F7F4EF（羊皮纸感，减少屏幕疲劳）
- 主文字：深炭黑 #1A1A1A
- 强调色：深藏青 #1B4F72（代表学术、可信赖）
- 辅助色：淡金 #C9A84C（用于排名徽章）

**Layout Paradigm**: 左侧固定筛选栏（学校类型/排名区间/是否有视频），右侧瀑布式卡片列表，顶部横幅展示精选 Webinar

**Signature Elements**:
1. 每张卡片左侧有一条 3px 的藏青色竖线，像档案夹标签
2. 排名用带边框的数字徽章显示，仿印章风格
3. 学校名称用大号衬线体，副信息用小号无衬线体

**Interaction Philosophy**: 悬停时卡片轻微上浮，左侧竖线变为金色，强调"选中"状态

**Animation**: 页面加载时卡片从下向上依次淡入（stagger 效果），筛选时卡片平滑过渡

**Typography System**: 标题用 Playfair Display，正文用 Source Sans Pro，中文用系统字体

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Design Movement**: 现代科技 × 数据可视化仪表盘（Data Dashboard）

**Core Principles**:
1. 深色背景——降低视觉疲劳，突出内容
2. 数据驱动的视觉层级——排名、学校类型通过颜色编码快速识别
3. 卡片式布局——每所学校是一个独立的信息单元
4. 功能性动效——动画服务于信息传递，不是装饰

**Color Philosophy**:
- 背景：深海军蓝 #0D1B2A
- 卡片背景：稍浅的蓝黑 #1B2838
- 强调色：电光蓝 #4FC3F7 + 翡翠绿 #26C6DA
- 文字：纯白 + 浅灰

**Layout Paradigm**: 顶部搜索栏 + 标签筛选，下方网格卡片（3列），卡片内嵌视频缩略图预览

**Signature Elements**:
1. 学校 Logo 圆形头像 + 发光边框
2. 视频数量用小型进度条可视化
3. 排名用渐变色数字标签

**Interaction Philosophy**: 卡片悬停时显示视频预览缩略图，点击直接展开内嵌播放器

**Animation**: 卡片进入时有轻微的缩放弹性动画，筛选时用 layout animation

**Typography System**: 标题用 Space Grotesk，正文用 DM Sans

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Design Movement**: 日式简约 × 留白美学（Zen Minimalism）

**Core Principles**:
1. 极度克制——每个元素都有存在的理由
2. 留白即内容——大量空白传递高端感
3. 单色调为主——用一种颜色的深浅变化构建整个界面
4. 内容优先——学校信息和视频链接是唯一主角

**Color Philosophy**:
- 背景：纯白 #FFFFFF
- 主色：深靛蓝 #2C3E7A（代表学术权威）
- 辅助：浅灰 #F0F2F5
- 强调：珊瑚红 #E8533A（用于 CTA 按钮）

**Layout Paradigm**: 全宽横向列表，每行一所学校，信息从左到右排列（排名、校名、类型、视频数量、链接）

**Signature Elements**:
1. 超细的分割线（0.5px）
2. 学校名称悬停时下划线从左向右展开
3. 顶部有一个极简的统计数字展示（共收录 X 所学校，X 个视频）

**Interaction Philosophy**: 极简交互，点击行展开详情，没有多余的弹窗

**Animation**: 只有必要的 fade-in，拒绝任何炫技动画

**Typography System**: 标题用 Cormorant Garamond（优雅衬线），正文用 Outfit

</idea>
</response>

---

## 选择方案

**选择方案一：学术档案馆 × 新闻编辑室**

理由：
- 最符合目标用户（中国留学生）对"专业、可信赖"的信息平台的期待
- 米白色背景 + 藏青色调在视觉上传递学术权威感
- 衬线体标题 + 档案卡片风格，与"大学招生"这一主题高度契合
- 筛选 + 卡片列表的布局对于 80 所学校的数据量来说最易用
