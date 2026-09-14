import React, { useState } from 'react';
import { StudentScore } from '../types';

interface EditScoreModalProps {
  score: StudentScore | null;
  onSave: (updated: StudentScore) => void;
  onClose: () => void;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({ score, onSave, onClose }) => {
  if (!score) return null;

  const [unit1, setUnit1] = useState(score.unit1Score);
  const [unit2, setUnit2] = useState(score.unit2Score);
  const [quiz, setQuiz] = useState(score.quizScore);

  const total = Number((unit1 + unit2 + quiz).toFixed(1));

  const calculateStatus = (tot: number): StudentScore['status'] => {
    if (tot >= 40) return 'ผ่านเกณฑ์ดีเยี่ยม';
    if (tot >= 35) return 'ผ่านเกณฑ์ดีมาก';
    if (tot >= 30) return 'ผ่านเกณฑ์';
    return 'ต้องสอบซ่อมเสริม';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...score,
      unit1Score: unit1,
      unit2Score: unit2,
      quizScore: quiz,
      totalScore: total,
      status: calculateStatus(total),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e6eeff] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e6eeff] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#00173b]">edit_note</span>
            <h3 className="font-bold text-sm text-[#00173b]">แก้ไขคะแนนเก็บนักเรียน</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 rounded"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#eff4ff] rounded-xl text-xs space-y-0.5">
          <p className="font-bold text-[#00173b]">
            {score.firstName} {score.lastName}
          </p>
          <p className="text-[#44474f]">
            รหัส: <span className="font-mono">{score.studentId}</span> | ชั้น: {score.classRoom} | เลขที่: {score.studentNo}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              คะแนนหน่วยที่ 1 (เต็ม 15.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="15"
              value={unit1}
              onChange={(e) => setUnit1(Math.min(15, Math.max(0, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] font-mono font-bold text-[#00173b] focus:ring-2 focus:ring-[#00173b] outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              คะแนนหน่วยที่ 2 (เต็ม 15.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="15"
              value={unit2}
              onChange={(e) => setUnit2(Math.min(15, Math.max(0, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] font-mono font-bold text-[#00173b] focus:ring-2 focus:ring-[#00173b] outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              คะแนนแบบทดสอบ / สอบย่อย (เต็ม 20.0)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={quiz}
              onChange={(e) => setQuiz(Math.min(20, Math.max(0, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] font-mono font-bold text-[#00173b] focus:ring-2 focus:ring-[#00173b] outline-none"
              required
            />
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <span className="font-bold text-[#44474f]">คะแนนรวมคำนวณสุทธิ (เต็ม 50):</span>
            <span className="text-base font-bold font-mono text-[#bb0112]">{total.toFixed(1)}</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6eeff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00173b] hover:bg-[#0f2c59] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              บันทึกคะแนน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
