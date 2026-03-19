// Canada U15 Page Component
import { canadaU15Schools, canadaProvinces } from "../data/canada-u15-seed";

export default function CanadaU15Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🇨🇦 加拿大本科申请
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            U15 加拿大研究型大学联盟 - 15所顶尖加拿大大学申请攻略
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#u15-list"
              className="px-6 py-3 bg-white text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              查看全部 U15 学校 →
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">15</div>
            <div className="text-gray-600">U15 成员</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">7</div>
            <div className="text-gray-600">省份覆盖</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">3</div>
            <div className="text-gray-600">英语授课</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-gray-600">含 Co-op</div>
          </div>
        </div>
      </div>

      {/* Province Filter */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">按省份浏览</h2>
        <div className="flex flex-wrap gap-3">
          {canadaProvinces.map((province) => {
            const schoolCount = canadaU15Schools.filter(
              (s) => s.province === province.code
            ).length;
            return (
              <a
                key={province.code}
                href={`/canada/${province.code.toLowerCase()}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-2"
              >
                <span className="font-medium">{province.nameCn}</span>
                <span className="text-sm text-gray-500">({province.code})</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {schoolCount}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* U15 Schools List */}
      <div id="u15-list" className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>🎓</span> U15 大学联盟成员
        </h2>
        <div className="grid gap-4">
          {canadaU15Schools
            .sort((a, b) => (a.u15Rank || "99").localeCompare(b.u15Rank || "99"))
            .map((school, index) => (
              <a
                key={school.id}
                href={`/canada/schools/${school.slug}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-300">
                        #{school.u15Rank}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {school.nameCn}
                      </h3>
                      <span className="text-gray-500">{school.nameEn}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                        {school.province}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                        {school.language === "english" ? "英语授课" : school.language === "french" ? "法语授课" : "双语"}
                      </span>
                      {school.coOpSupported && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
                          Co-op
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      📍 {school.city} · 💰 学费约 {school.tuitionRange.international}
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium">
                    查看详情 →
                  </div>
                </div>
              </a>
            ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">快速入口</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/canada/tuition"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-green-300 transition"
          >
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-2">学费对比</h3>
            <p className="text-gray-600 text-sm">15所U15大学学费一览</p>
          </a>
          <a
            href="/canada/deadlines"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-red-300 transition"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold text-lg mb-2">申请截止日期</h3>
            <p className="text-gray-600 text-sm">2024-2025 申请季截止日期汇总</p>
          </a>
          <a
            href="/canada/scholarships"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-yellow-300 transition"
          >
            <div className="text-3xl mb-3">🎁</div>
            <h3 className="font-bold text-lg mb-2">奖学金</h3>
            <p className="text-gray-600 text-sm">国际生奖学金申请指南</p>
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            🎯 了解更多招生宣讲
          </h2>
          <p className="text-blue-100 mb-8">
            订阅加拿大大学招生宣讲活动，第一时间获取申请信息
          </p>
          <a
            href="/events"
            className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-bold hover:bg-blue-50 transition"
          >
            查看活动日历 →
          </a>
        </div>
      </div>
    </div>
  );
}
