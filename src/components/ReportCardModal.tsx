import React, { useRef, useState } from 'react';
import { StudentScore } from '../types';
import { SCHOOL_LOGO_URL } from '../data/initialData';
import { downloadElementAsPdf } from '../utils/pdfExport';

interface ReportCardModalProps {
  score: StudentScore | null;
  onClose: () => void;
  schoolName?: string;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  score,
  onClose,
  schoolName = 'โรงเรียนสาธิตเทศบาลเมืองราชบุรี',
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!score) return null;

  const percentage = ((score.totalScore / 50) * 100).toFixed(1);
  const gradeValue =
    score.totalScore >= 40
      ? '4.0 (ดีเยี่ยม)'
      : score.totalScore >= 35
      ? '3.5 (ดีมาก)'
      : score.totalScore >= 30
      ? '3.0 (ผ่านเกณฑ์)'
      : '1.5 (ต้องสอบซ่อมเสริม)';

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const filename = `ใบรายงานผลการเรียน_${score.firstName}_${score.lastName}_${score.studentId}.pdf`;
      await downloadElementAsPdf(reportRef.current, {
        filename,
        orientation: 'portrait',
        scale: 2,
      });
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  /**
   * Export individual student score for Google Sheets
   */
  const handleDownloadGoogleSheet = () => {
    const headers = [
      'รหัสนักเรียน',
      'เลขที่',
      'ชื่อ-นามสกุล',
      'ระดับชั้น',
      'วิชา',
      'หน่วยที่ 1 (15 คะแนน)',
      'หน่วยที่ 2 (15 คะแนน)',
      'สอบย่อย (20 คะแนน)',
      'รวม (50 คะแนน)',
      'ร้อยละ',
      'ระดับผลการเรียน',
      'สถานะการประเมิน',
      'วันที่ออกรายงาน',
    ];
    const exportDateStr = new Date().toLocaleDateString('th-TH');
    const row = [
      score.studentId,
      score.studentNo,
      `${score.firstName} ${score.lastName}`,
      score.classRoom,
      score.subject,
      score.unit1Score.toFixed(1),
      score.unit2Score.toFixed(1),
      score.quizScore.toFixed(1),
      score.totalScore.toFixed(1),
      percentage + '%',
      gradeValue,
      score.status,
      exportDateStr,
    ];

    const csvContent =
      '\uFEFF' +
      [headers.join(','), row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `คะแนนรายบุคคล_${score.studentId}_${score.firstName}_GoogleSheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const currentDateStr = new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#e6eeff] overflow-hidden flex flex-col my-auto print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-[#00173b]">
            <span className="material-symbols-outlined text-[20px]">badge</span>
            <span className="font-bold text-sm">ใบรายงานผลการเรียนรายบุคคล</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Google Sheets Download Button */}
            <button
              onClick={handleDownloadGoogleSheet}
              type="button"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              id="btn-download-googlesheet-report-card"
              title="ดาวน์โหลดข้อมูลคะแนนรายบุคคลสำหรับ Google Sheets (.csv)"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>ดาวน์โหลด Google Sheets</span>
            </button>

            {/* PDF Download Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              type="button"
              className="px-4 py-2 bg-[#00173b] hover:bg-[#0f2c59] disabled:opacity-75 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              id="btn-download-pdf-report-card"
              title="ดาวน์โหลดรายงานผลการเรียนเป็นไฟล์ PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>ดาวน์โหลด PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors ml-1"
              title="ปิดหน้าต่าง"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable Official Report Card Document */}
        <div
          ref={reportRef}
          id="report-card-document"
          className="p-8 md:p-10 space-y-6 text-[#0d1c2e] bg-white print:p-6"
        >
          {/* Header Section */}
          <div className="flex items-center justify-between border-b-2 border-[#00173b] pb-5 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={SCHOOL_LOGO_URL}
                alt="ตราสัญลักษณ์โรงเรียน"
                referrerPolicy="no-referrer"
                className="w-16 h-16 object-contain shrink-0"
              />
              <div>
                <h2 className="font-bold text-lg text-[#00173b] tracking-tight">{schoolName}</h2>
                <p className="text-xs text-[#44474f]">
                  สังกัดสำนักการศึกษา เทศบาลเมืองราชบุรี จังหวัดราชบุรี
                </p>
                <p className="text-xs font-semibold text-[#bb0112] mt-0.5">
                  ใบรายงานผลการเรียนและการวัดผลสัมฤทธิ์ทางการเรียนรายบุคคล
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-[#44474f] shrink-0">
              <div className="font-bold text-[#00173b]">ภาคเรียนที่ 1 ปีการศึกษา 2567</div>
              <div>ระบบบริหารจัดการสารสนเทศวิชาการ</div>
              <div className="text-[11px] text-[#747780] mt-1">พิมพ์เมื่อ: {currentDateStr}</div>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#eff4ff]/60 rounded-xl border border-[#dce9ff] text-xs">
            <div>
              <span className="text-[#747780] block text-[11px]">ชื่อ - นามสกุล:</span>
              <span className="font-bold text-[#00173b] text-sm">
                {score.firstName} {score.lastName}
              </span>
            </div>
            <div>
              <span className="text-[#747780] block text-[11px]">รหัสนักเรียน:</span>
              <span className="font-bold font-mono text-[#00173b] text-sm">{score.studentId}</span>
            </div>
            <div>
              <span className="text-[#747780] block text-[11px]">ระดับชั้น / ห้อง:</span>
              <span className="font-bold text-[#00173b] text-sm">{score.classRoom}</span>
            </div>
            <div>
              <span className="text-[#747780] block text-[11px]">เลขที่:</span>
              <span className="font-bold font-mono text-[#00173b] text-sm">{score.studentNo}</span>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-[#747780] block text-[11px]">รายวิชา:</span>
              <span className="font-bold text-[#00173b]">
                {score.subject || 'ว30101 วิทยาการคำนวณและระบบสารสนเทศดิจิทัล'}
              </span>
            </div>
            <div>
              <span className="text-[#747780] block text-[11px]">สถานะการประเมิน:</span>
              <span
                className={`inline-block font-bold text-xs ${
                  score.status.includes('ดีเยี่ยม')
                    ? 'text-emerald-700'
                    : score.status.includes('ซ่อม')
                    ? 'text-rose-700'
                    : 'text-blue-700'
                }`}
              >
                {score.status}
              </span>
            </div>
          </div>

          {/* Detailed Score Table */}
          <div>
            <h4 className="font-bold text-xs text-[#00173b] mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00173b]">analytics</span>
              <span>รายละเอียดคะแนนเก็บและผลการวัดผลสัมฤทธิ์</span>
            </h4>
            <div className="border border-[#dce9ff] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#00173b] font-bold border-b border-[#dce9ff]">
                    <th className="py-2.5 px-3">รายการประเมิน / หน่วยการเรียนรู้</th>
                    <th className="py-2.5 px-3 text-center w-24">คะแนนเต็ม</th>
                    <th className="py-2.5 px-3 text-right w-24">คะแนนที่ได้</th>
                    <th className="py-2.5 px-3 text-center w-28">ร้อยละ (%)</th>
                    <th className="py-2.5 px-3 text-center w-28">ผลการตัดสิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eeff]">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      หน่วยที่ 1: การวิเคราะห์โครงสร้างข้อมูลและอัลกอริทึม
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">15.0</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00173b]">
                      {score.unit1Score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {((score.unit1Score / 15) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-700 font-bold">ผ่าน</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      หน่วยที่ 2: นวัตกรรมดิจิทัลและการเชื่อมต่อระบบสารสนเทศ
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">15.0</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00173b]">
                      {score.unit2Score.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {((score.unit2Score / 15) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-700 font-bold">ผ่าน</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      แบบทดสอบวัดผลการเรียนรู้ / สอบย่อยประจำภาคเรียน
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">20.0</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00173b]">
                      {score.quizScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {((score.quizScore / 20) * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-emerald-700 font-bold">ผ่าน</span>
                    </td>
                  </tr>
                  <tr className="bg-[#eff4ff]/80 font-bold border-t-2 border-[#00173b] text-[#00173b]">
                    <td className="py-3 px-3 text-sm">รวมคะแนนทั้งหมด (Total Score)</td>
                    <td className="py-3 px-3 text-center font-mono text-sm">50.0</td>
                    <td className="py-3 px-3 text-right font-mono text-base text-[#bb0112]">
                      {score.totalScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-sm">{percentage}%</td>
                    <td className="py-3 px-3 text-center text-sm">{score.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Competency & Characteristic Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
              <span className="font-bold text-[#00173b] block">การประเมินคุณลักษณะอันพึงประสงค์:</span>
              <div className="flex justify-between text-[#44474f]">
                <span>1. มีวินัยและความรับผิดชอบ</span>
                <span className="font-bold text-emerald-700">ดีเยี่ยม (3)</span>
              </div>
              <div className="flex justify-between text-[#44474f]">
                <span>2. ใฝ่เรียนรู้และแสวงหาความรู้</span>
                <span className="font-bold text-emerald-700">ดีเยี่ยม (3)</span>
              </div>
              <div className="flex justify-between text-[#44474f]">
                <span>3. มุ่งมั่นในการทำงาน</span>
                <span className="font-bold text-emerald-700">ดีเยี่ยม (3)</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
              <span className="font-bold text-[#00173b] block">สรุประดับผลการเรียน (Grade):</span>
              <div className="flex justify-between text-[#44474f]">
                <span>ระดับผลการเรียนเฉลี่ย:</span>
                <span className="font-bold text-[#00173b] font-mono text-sm">{gradeValue}</span>
              </div>
              <div className="flex justify-between text-[#44474f]">
                <span>เกณฑ์การตัดสิน:</span>
                <span>ร้อยละ 60 ขึ้นไป (ผ่านเกณฑ์มาตรฐาน)</span>
              </div>
              <div className="flex justify-between text-[#44474f]">
                <span>การสอบแก้ตัว / ปรับปรุง:</span>
                <span>{score.totalScore < 30 ? 'ต้องเข้ารับการสอนเสริม' : 'ไม่มี'}</span>
              </div>
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-6 border-t border-[#e6eeff] grid grid-cols-3 gap-4 text-center text-xs">
            <div className="space-y-8">
              <p className="text-[#747780]">ลงชื่อ ......................................................</p>
              <div>
                <p className="font-bold text-[#00173b]">ครูผู้สอน / ครูประจำวิชา</p>
                <p className="text-[11px] text-[#747780]">กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</p>
              </div>
            </div>
            <div className="space-y-8">
              <p className="text-[#747780]">ลงชื่อ ......................................................</p>
              <div>
                <p className="font-bold text-[#00173b]">หัวหน้ากลุ่มบริหารวิชาการ</p>
                <p className="text-[11px] text-[#747780]">{schoolName}</p>
              </div>
            </div>
            <div className="space-y-8">
              <p className="text-[#747780]">ลงชื่อ ......................................................</p>
              <div>
                <p className="font-bold text-[#00173b]">ผู้อำนวยการสถานศึกษา</p>
                <p className="text-[11px] text-[#747780]">{schoolName}</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-[#747780] pt-2 border-t border-dashed border-gray-200">
            เอกสารฉบับนี้พิมพ์จากระบบสารสนเทศวิชาการและการจัดการเรียนรู้ {schoolName} (Google Workspace for Education Verified)
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <span className="text-xs text-[#747780] text-center sm:text-left">
            สามารถเลือกดาวน์โหลดไฟล์เป็น <span className="font-bold text-emerald-700">Google Sheets (.csv)</span> หรือ <span className="font-bold text-[#00173b]">PDF</span> ได้โดยตรง
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleDownloadGoogleSheet}
              type="button"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all"
              id="btn-download-googlesheet-bottom"
            >
              <span className="material-symbols-outlined text-[16px]">table_chart</span>
              <span>ดาวน์โหลด Google Sheets</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              type="button"
              className="px-5 py-2 bg-[#00173b] hover:bg-[#0f2c59] disabled:opacity-75 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              id="btn-download-pdf-bottom"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                  <span>ดาวน์โหลดเป็นไฟล์ PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
