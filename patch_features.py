with open('client/src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''  const features = lang === "zh" ? [
    { icon: "🎓", title: "招生官亲自出席", desc: "每场活动均由各校 Admissions Officer 主持，直接解答申请疑问" },
    { icon: "🌍", title: "覆盖全球顶校", desc: "美国、英国、香港、澳大利亚顶尖院校，持续扩展中" },
    { icon: "🕐", title: "自动时区转换", desc: "活动时间自动转换为你的本地时区，无需手动换算" },
    { icon: "📅", title: "日历导出 · 支持批量", desc: "勾选多场活动一键批量导出 .ics，或单独添加至 Google / Apple / Outlook" },
  ] : [
    { icon: "🎓", title: "Direct AO Access", desc: "Every session is hosted by Admissions Officers who answer real questions" },
    { icon: "🌍", title: "Global Coverage", desc: "US, UK, Hong Kong, Australia — and growing" },
    { icon: "🕐", title: "Auto Timezone", desc: "Event times are automatically converted to your local timezone" },
    { icon: "📅", title: "Calendar Export · Batch", desc: "Select multiple events and export as one .ics, or add individually to Google / Apple / Outlook" },
  ];'''

new_block = '''  const aoCard = lang === "zh" ? {
    icon: "🎓",
    title: "为什么要参加 Info Session？",
    points: [
      { label: "直接对话招生官", detail: "每场均由 Admissions Officer 主持，可当场提问、了解录取偏好和当年申请季的实际动态" },
      { label: "深入了解校园文化", detail: "听招生官讲述学校特色、学生生活和社区氛围，这些内容是官网找不到的" },
      { label: "展示 Demonstrated Interest", detail: "部分院校会记录出席情况，参加官方活动是向学校传递真实兴趣的有效方式" },
    ]
  } : {
    icon: "🎓",
    title: "Why Attend an Info Session?",
    points: [
      { label: "Talk Directly to Admissions Officers", detail: "Every session is AO-hosted. Ask real questions and learn about selection criteria directly from the source" },
      { label: "Understand Campus Culture", detail: "Hear firsthand about student life, community, and what makes each school unique — beyond rankings" },
      { label: "Demonstrate Genuine Interest", detail: "Some schools track attendance. Showing up signals real commitment and can support your application" },
    ]
  };

  const features = lang === "zh" ? [
    { icon: "🌍", title: "覆盖全球顶校", desc: "美国、英国、香港、澳大利亚顶尖院校，持续扩展中" },
    { icon: "🕐", title: "自动时区转换", desc: "活动时间自动转换为你的本地时区，无需手动换算" },
    { icon: "📅", title: "日历导出 · 支持批量", desc: "勾选多场活动一键批量导出 .ics，或单独添加至 Google / Apple / Outlook" },
  ] : [
    { icon: "🌍", title: "Global Coverage", desc: "US, UK, Hong Kong, Australia — and growing" },
    { icon: "🕐", title: "Auto Timezone", desc: "Event times are automatically converted to your local timezone" },
    { icon: "📅", title: "Calendar Export · Batch", desc: "Select multiple events and export as one .ics, or add individually to Google / Apple / Outlook" },
  ];'''

assert old_block in content, "Block not found!"
content = content.replace(old_block, new_block, 1)

with open('client/src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
