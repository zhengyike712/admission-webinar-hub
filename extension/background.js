// Kollegers Chrome Extension - Background Service Worker

const API_BASE = 'https://www.kollegers.com';

// 定时检查（每小时）
const CHECK_INTERVAL = 60 * 60 * 1000;

// 存储
let lastCheckTime = 0;

// 监听安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Kollegers Extension 安装成功');
    
    // 设置默认设置
    chrome.storage.local.set({
      notificationEnabled: false,
      lastNotifyDate: null,
      schools: []
    });
  }
});

// 定时任务
chrome.alarms.create('checkEvents', {
  periodInMinutes: 60
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkEvents') {
    await checkAndNotify();
  }
});

// 检查并通知
async function checkAndNotify() {
  const result = await chrome.storage.local.get(['notificationEnabled']);
  
  if (!result.notificationEnabled) {
    return;
  }
  
  try {
    // 获取今日活动
    const res = await fetch(`${API_BASE}/api/public/sessions?upcoming=true&limit=50`);
    const data = await res.json();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 找今日活动
    const todayEvents = [];
    if (Array.isArray(data)) {
      data.forEach(session => {
        const dates = session.dates || [];
        if (dates[0]) {
          const sessionDate = new Date(dates[0] + 'T00:00:00');
          if (sessionDate >= today && sessionDate < tomorrow) {
            todayEvents.push(session);
          }
        }
      });
    }
    
    // 检查是否需要通知
    const lastNotify = await chrome.storage.local.get(['lastNotifyDate']);
    const todayStr = today.toDateString();
    
    if (todayEvents.length > 0 && lastNotify.lastNotifyDate !== todayStr) {
      // 发送通知
      const schools = todayEvents.map(e => e.school?.shortName || e.school?.name || e.schoolId).join('、');
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: '🎓 Kollegers - 今日有活动！',
        message: `今天有 ${todayEvents.length} 场招生宣讲：${schools}`,
        buttons: [
          { title: '查看详情' }
        ]
      });
      
      // 记录已通知
      await chrome.storage.local.set({ lastNotifyDate: todayStr });
    }
    
  } catch (error) {
    console.error('Check events failed:', error);
  }
}

// 点击通知处理
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    chrome.tabs.create({ url: API_BASE });
  }
});

// 监听图标点击（可选：快速打开）
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: API_BASE });
});
