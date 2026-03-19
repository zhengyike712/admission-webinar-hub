// Kollegers Chrome Extension - Popup Script

const API_BASE = 'https://www.kollegers.com';

// 状态管理
let notificationEnabled = false;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadNotificationSetting();
  await fetchTodayEvents();
  setupEventListeners();
});

// 加载通知设置
async function loadNotificationSetting() {
  const result = await chrome.storage.local.get(['notificationEnabled']);
  notificationEnabled = result.notificationEnabled || false;
  updateToggleUI();
}

// 更新开关 UI
function updateToggleUI() {
  const toggle = document.getElementById('notificationToggle');
  if (notificationEnabled) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
}

// 切换通知
document.getElementById('notificationToggle').addEventListener('click', async () => {
  notificationEnabled = !notificationEnabled;
  await chrome.storage.local.set({ notificationEnabled });
  updateToggleUI();
  
  if (notificationEnabled) {
    // 请求通知权限
    const permission = await chrome.permissions.request({
      permissions: ['notifications']
    });
    if (!permission) {
      notificationEnabled = false;
      updateToggleUI();
      alert('需要通知权限才能开启提醒');
    }
  }
});

// 获取今日活动
async function fetchTodayEvents() {
  const eventList = document.getElementById('eventList');
  const todayCount = document.getElementById('todayCount');
  const weekCount = document.getElementById('weekCount');
  const schoolCount = document.getElementById('schoolCount');
  
  try {
    // 获取今日活动
    const todayRes = await fetch(`${API_BASE}/api/public/sessions?upcoming=true&limit=50`);
    const todayData = await todayRes.json();
    
    // 解析今日和本周活动
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const todayEvents = [];
    const weekEvents = [];
    
    if (Array.isArray(todayData)) {
      todayData.forEach(session => {
        const dates = session.dates || [];
        const sessionDate = new Date(dates[0] + 'T00:00:00');
        
        if (sessionDate >= today && sessionDate < tomorrow) {
          todayEvents.push(session);
        }
        if (sessionDate >= today && sessionDate < nextWeek) {
          weekEvents.push(session);
        }
      });
    }
    
    // 更新统计
    todayCount.textContent = todayEvents.length;
    weekCount.textContent = weekEvents.length;
    schoolCount.textContent = '70+';
    
    // 渲染活动列表
    if (todayEvents.length === 0) {
      eventList.innerHTML = '<div class="empty">今日暂无活动，看看本周有什么吧 👇</div>';
    } else {
      renderEvents(todayEvents.slice(0, 5));
    }
    
  } catch (error) {
    console.error('Failed to fetch events:', error);
    eventList.innerHTML = '<div class="empty">加载失败，请检查网络</div>';
    todayCount.textContent = '-';
    weekCount.textContent = '-';
  }
}

// 渲染活动列表
function renderEvents(events) {
  const eventList = document.getElementById('eventList');
  
  const html = events.map(event => {
    const school = event.school || {};
    const schoolName = school.shortName || school.name || event.schoolId || '未知学校';
    const dateStr = event.dates?.[0] || '';
    const formattedDate = formatDate(dateStr);
    const link = school.registrationPage || `${API_BASE}/events`;
    
    return `
      <div class="event-item" data-link="${link}">
        <span class="event-date">${formattedDate}</span>
        <span class="event-school">${schoolName}</span>
        <span class="event-arrow">→</span>
      </div>
    `;
  }).join('');
  
  eventList.innerHTML = html;
  
  // 添加点击事件
  eventList.querySelectorAll('.event-item').forEach(item => {
    item.addEventListener('click', () => {
      const link = item.dataset.link;
      chrome.tabs.create({ url: link });
    });
  });
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '待定';
  
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.getTime() === today.getTime()) return '今天';
  if (date.getTime() === tomorrow.getTime()) return '明天';
  
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${month}/${day} (${weekday})`;
}

// 事件监听
function setupEventListeners() {
  // 打开完整网站
  document.getElementById('openFull').addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE });
  });
  
  // 刷新数据
  document.getElementById('refreshBtn').addEventListener('click', () => {
    const btn = document.getElementById('refreshBtn');
    btn.textContent = '🔄 加载中...';
    fetchTodayEvents().finally(() => {
      btn.textContent = '🔄 刷新数据';
    });
  });
}
