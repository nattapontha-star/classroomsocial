import React, { useState, useMemo } from 'react';
import { SCHOOL_LOGO_URL } from '../data/initialData';
import { StudentScore } from '../types';

interface ScorePortalScreenProps {
  scores: StudentScore[];
  onNavigateHome: () => void;
  onNavigateClassroom: () => void;
  onNavigateAdmin: () => void;
  schoolName: string;
}

export const ScorePortalScreen: React.FC<ScorePortalScreenProps> = ({
  scores,
  onNavigateHome,
  onNavigateClassroom,
  onNavigateAdmin,
  schoolName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('เมื่อสักครู่');

  const filteredScores = useMemo(() => {
    return scores.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentNo.includes(searchQuery);

      const matchClass = selectedClass === 'all' || item.classRoom === selectedClass;

      return matchSearch && matchClass;
    });
  }, [scores, searchQuery, selectedClass]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncTime(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' น.');
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['เลขที่', 'รหัสนักเรียน', 'ชื่อ', 'นามสกุล', 'ระดับชั้น', 'วิชา', 'หน่วยที่ 1 (15)', 'หน่วยที่ 2 (15)', 'สอบย่อย (20)', 'รวม (50)', 'สถานะการประเมิน'];
    const rows = filteredScores.map((s) => [
      s.studentNo,
      s.studentId,
      s.firstName,
      s.lastName,
      s.classRoom,
      s.subject,
      s.unit1Score.toFixed(1),
      s.unit2Score.toFixed(1),
      s.quizScore.toFixed(1),
      s.totalScore.toFixed(1),
      s.status,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `satit_scores_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-[#f8f9ff]">
      <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pt-4 pb-16">
        
        {/* Top Navigation & Brand Header */}
        <header className="w-full bg-white rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#e6eeff]">
          <div className="flex items-center gap-4 w-full md:w-auto cursor-pointer" onClick={onNavigateHome}>
            <div className="w-20 h-24 md:w-24 md:h-28 flex-shrink-0 flex items-center justify-center p-1.5 bg-white rounded-xl shadow-sm border border-[#dce9ff] transition-transform hover:scale-105">
              <img
                alt="ตราสัญลักษณ์โรงเรียนสาธิตเทศบาลเมืองราชบุรี"
                className="w-full h-full object-contain filter drop-shadow-sm"
                src={SCHOOL_LOGO_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#bb0112] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#bb0112] ring-4 ring-[#bb0112]/20 animate-pulse"></span>
                ระบบการเรียนรู้ดิจิทัล (LMS PORTAL)
              </span>
              <h1 className="text-2xl md:text-3xl text-[#00173b] leading-tight font-bold">
                {schoolName}
              </h1>
              <p className="text-sm text-[#44474f]">
                ระบบจัดการการเรียนรู้ เชื่อมโยงฐานข้อมูลการประเมินผลแบบเรียลไทม์
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav aria-label="เมนูหลัก" className="flex items-center bg-[#eff4ff] p-1.5 rounded-xl w-full md:w-auto overflow-x-auto border border-[#e6eeff]">
            <button
              onClick={onNavigateClassroom}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-[#0d1c2e] hover:text-[#00173b] whitespace-nowrap"
              id="score-nav-classroom"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>1. เข้าสู่บทเรียน</span>
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-[#00173b] text-white shadow-sm whitespace-nowrap"
              id="score-nav-scores"
            >
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              <span>2. เช็คคะแนน</span>
            </button>
          </nav>
        </header>

        {/* Academic Context Banner */}
        <div className="w-full bg-white rounded-xl p-4 md:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#e6eeff]">
          <div>
            <span className="text-xs font-bold text-[#bb0112] tracking-wider uppercase">
              SCORE PORTAL • ปีการศึกษา 2567 • ภาคเรียนที่ 1
            </span>
            <h2 className="text-lg md:text-xl font-bold text-[#00173b]">
              ระบบค้นหาและเช็คคะแนนนักเรียน
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eff4ff] text-[#00173b] border border-[#dce9ff]">
              <span className="w-2 h-2 rounded-full bg-[#bb0112] animate-ping"></span>
              ซิงค์ฐานข้อมูลอัตโนมัติ
            </span>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-[#eff4ff] text-[#00173b] hover:bg-[#dce9ff] transition-all"
              title="รีเฟรชข้อมูลจาก Google Sheets"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* Search & Filter Card */}
        <div className="w-full bg-[#00173b] text-white rounded-xl shadow-md p-6 border border-[#0f2c59] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-[#bb0112] rounded-full"></span>
              <h3 className="font-bold text-base md:text-lg text-white">
                ค้นหาคะแนนสอบและผลการเรียน
              </h3>
            </div>
            <span className="text-xs text-[#d8e2ff]">
              กรอกข้อมูลเพื่อค้นหาคะแนนรายบุคคล หรือเลือกดูตามระดับชั้น
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
            {/* Search Input */}
            <div className="md:col-span-6 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ, นามสกุล หรือรหัสนักเรียน (เช่น กิตติศักดิ์ หรือ ST-40121)"
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-white/10 border border-white/15 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#bb0112] focus:bg-white/15 transition-all"
                id="input-score-search"
              />
            </div>

            {/* Class Dropdown */}
            <div className="md:col-span-3 relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">
                class
              </span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-11 pr-8 py-3 rounded-lg bg-white/10 border border-white/15 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#bb0112] focus:bg-white/15 transition-all appearance-none cursor-pointer"
                id="select-score-class"
              >
                <option value="all" className="text-gray-900">ทุกระดับชั้น (All Classes)</option>
                <option value="ม.3/1" className="text-gray-900">มัธยมศึกษาปีที่ 3/1</option>
                <option value="ม.3/2" className="text-gray-900">มัธยมศึกษาปีที่ 3/2</option>
                <option value="ม.2/1" className="text-gray-900">มัธยมศึกษาปีที่ 2/1</option>
                <option value="ป.6/1" className="text-gray-900">ประถมศึกษาปีที่ 6/1</option>
                <option value="ม.4/1" className="text-gray-900">มัธยมศึกษาปีที่ 4/1</option>
                <option value="ม.4/2" className="text-gray-900">มัธยมศึกษาปีที่ 4/2</option>
                <option value="ม.4/3" className="text-gray-900">มัธยมศึกษาปีที่ 4/3</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 text-gray-400 pointer-events-none text-[20px]">
                expand_more
              </span>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-3 flex items-center gap-2">
              <button
                onClick={() => {}}
                className="flex-1 py-3 px-4 rounded-lg bg-[#bb0112] hover:bg-[#93000b] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                id="btn-score-search-apply"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>ค้นหา</span>
                <span className="bg-black/25 text-white text-[11px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {filteredScores.length} คน
                </span>
              </button>

              {(searchQuery || selectedClass !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedClass('all');
                  }}
                  className="py-3 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                  title="รีเซ็ตตัวกรอง"
                >
                  รีเซ็ต
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Gradebook Table Container */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-[#e6eeff] overflow-hidden flex flex-col">
          {/* Table Header Controls */}
          <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6eeff]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00173b] text-[22px]">table_chart</span>
              <h3 className="font-bold text-base text-[#00173b]">
                ตารางสรุปผลการเรียนและคะแนนเก็บรายบุคคล
              </h3>
              <span className="text-xs bg-[#eff4ff] text-[#00173b] px-2.5 py-0.5 rounded-full font-semibold">
                {filteredScores.length} รายการ
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#44474f]">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#00173b]"></span>
              <span>เกณฑ์ผ่าน 60% (30.0 คะแนนขึ้นไป)</span>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse" id="table-score-records">
              <thead>
                <tr className="bg-[#eff4ff] text-[#00173b] text-xs font-bold uppercase tracking-wider border-b border-[#dce9ff]">
                  <th className="py-3.5 px-4 w-16 text-center">เลขที่</th>
                  <th className="py-3.5 px-4 w-28">รหัสนักเรียน</th>
                  <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3.5 px-4 text-center">ระดับชั้น</th>
                  <th className="py-3.5 px-3 text-right">หน่วยที่ 1 (15)</th>
                  <th className="py-3.5 px-3 text-right">หน่วยที่ 2 (15)</th>
                  <th className="py-3.5 px-3 text-right">สอบย่อย (20)</th>
                  <th className="py-3.5 px-4 text-right font-bold text-[#00173b]">รวม (50)</th>
                  <th className="py-3.5 px-4 text-center">สถานะการประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6eeff]">
                {filteredScores.length > 0 ? (
                  filteredScores.map((row, idx) => (
                    <tr
                      key={row.studentId + idx}
                      className="hover:bg-[#f8f9ff] transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono text-xs text-[#44474f]">
                        {row.studentNo}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-xs text-[#00173b]">
                        {row.studentId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0d1c2e]">{row.firstName} {row.lastName}</div>
                        <div className="text-[11px] text-[#747780]">{row.subject}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eff4ff] text-[#0f2c59] border border-[#dce9ff]">
                          {row.classRoom}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-[#44474f]">
                        {row.unit1Score.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-[#44474f]">
                        {row.unit2Score.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-xs text-[#44474f]">
                        {row.quizScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#00173b]">
                        {row.totalScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.status === 'ผ่านเกณฑ์ดีเยี่ยม' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            {row.status}
                          </span>
                        )}
                        {row.status === 'ผ่านเกณฑ์ดีมาก' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            {row.status}
                          </span>
                        )}
                        {row.status === 'ผ่านเกณฑ์' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            {row.status}
                          </span>
                        )}
                        {(row.status === 'ต้องสอบซ่อมเสริม' || row.status === 'รอสอบแก้ตัว') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            {row.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#747780]">
                      <span className="material-symbols-outlined text-[36px] text-[#c4c6d0] block mb-2">
                        search_off
                      </span>
                      <p className="font-semibold text-sm text-[#00173b]">
                        ไม่พบข้อมูลผลการเรียนที่ตรงกับเงื่อนไขการค้นหา
                      </p>
                      <p className="text-xs text-[#747780] mt-1">
                        ลองค้นหาด้วยคำอื่น หรือเลือก "ทุกระดับชั้น"
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer & Export Controls */}
          <div className="p-4 bg-[#f8f9ff] border-t border-[#e6eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#44474f]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00173b] text-[18px]">cloud_done</span>
              <span>เชื่อมโยงข้อมูลจาก Google Sheets: <strong>Satit_Grade_Book_2567_T1</strong> (อัปเดตล่าสุด: {lastSyncTime})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#c4c6d0] text-[#00173b] font-semibold hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
                id="btn-score-export-csv"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">download</span>
                <span>ส่งออก CSV</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#c4c6d0] text-[#00173b] font-semibold hover:bg-[#eff4ff] transition-all flex items-center gap-1.5 shadow-xs"
                id="btn-score-print"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>พิมพ์ใบรายงานคะแนน</span>
              </button>
            </div>
          </div>
        </div>

        {/* Institutional Footer */}
        <footer className="w-full bg-white rounded-xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between text-xs text-[#44474f] gap-3 border border-[#e6eeff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00173b] text-[20px]">account_balance</span>
            <span>{schoolName} (สังกัดเทศบาลเมืองราชบุรี)</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span>กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</span>
            <span>•</span>
            <span>ระบบประเมินผลการเรียนรู้มาตรฐาน</span>
          </div>
        </footer>

      </div>
    </div>
  );
};
