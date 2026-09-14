import React, { useState, useEffect } from 'react';
import { ContactInfo } from '../types';
import { initialContactInfo } from '../data/initialData';

interface EditContactModalProps {
  isOpen?: boolean;
  contactInfo?: ContactInfo;
  currentContact?: ContactInfo;
  onSave: (updated: ContactInfo) => void;
  onClose: () => void;
}

export const EditContactModal: React.FC<EditContactModalProps> = ({
  isOpen = true,
  contactInfo,
  currentContact,
  onSave,
  onClose,
}) => {
  const activeData: ContactInfo = contactInfo || currentContact || initialContactInfo;

  const [title, setTitle] = useState(activeData?.title || 'ศูนย์ช่วยเหลือนักเรียนและบริการวิชาการ');
  const [subtitle, setSubtitle] = useState(activeData?.subtitle || '');
  const [officeLocation, setOfficeLocation] = useState(activeData?.officeLocation || '');
  const [phone, setPhone] = useState(activeData?.phone || '');
  const [email, setEmail] = useState(activeData?.email || '');
  const [workingHours, setWorkingHours] = useState(activeData?.workingHours || '');
  const [note, setNote] = useState(activeData?.note || '');
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (activeData) {
      setTitle(activeData.title || 'ศูนย์ช่วยเหลือนักเรียนและบริการวิชาการ');
      setSubtitle(activeData.subtitle || '');
      setOfficeLocation(activeData.officeLocation || '');
      setPhone(activeData.phone || '');
      setEmail(activeData.email || '');
      setWorkingHours(activeData.workingHours || '');
      setNote(activeData.note || '');
    }
  }, [activeData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim() || 'ศูนย์ช่วยเหลือนักเรียนและบริการวิชาการ',
      subtitle: subtitle.trim() || 'หากลืมรหัสผ่านหรือไม่มีรายชื่อในฐานข้อมูล Google Sheets กรุณาติดต่อ:',
      officeLocation: officeLocation.trim() || 'ห้องวิชาการและเทคโนโลยีสารสนเทศ อาคาร 2 ชั้น 3',
      phone: phone.trim() || '032-337-1234 (ต่อ 104)',
      email: email.trim() || 'admin.satit@rb-muni.ac.th',
      workingHours: workingHours.trim() || 'จันทร์ - ศุกร์ 08:00 - 16:30 น.',
      note: note.trim() || '* นักเรียนสามารถขอรีเซ็ตรหัสผ่านได้โดยแจ้งเลขประจำตัวประชาชนหรือรหัสประจำตัวนักเรียน 5-6 หลักกับครูประจำชั้น',
    });
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#e6eeff] space-y-5 my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#e6eeff] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#00173b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">contact_phone</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#00173b]">
                แก้ไขข้อมูลติดต่อครูและศูนย์ช่วยเหลือ
              </h3>
              <p className="text-[11px] text-[#747780]">
                ข้อมูลนี้จะแสดงผลโดยตรงบนหน้าแรก (Home) และในป๊อปอัป "ติดต่อครู" ของนักเรียน
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {showSavedToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>บันทึกข้อมูลติดต่อเรียบร้อยแล้ว กำลังนำไปแสดงบนหน้าแรกทันที</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              หัวข้อศูนย์ช่วยเหลือ (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none font-medium"
              placeholder="เช่น ศูนย์ช่วยเหลือนักเรียนและบริการวิชาการ"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              คำแนะนำ / ข้อความนำ (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none"
              placeholder="เช่น หากลืมรหัสผ่านหรือไม่มีรายชื่อในฐานข้อมูล Google Sheets กรุณาติดต่อ:"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#00173b] block mb-1">
                สถานที่ / ห้องปฏิบัติการ *
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none"
                placeholder="เช่น ห้องวิชาการและเทคโนโลยีสารสนเทศ อาคาร 2 ชั้น 3"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-[#00173b] block mb-1">
                เบอร์โทรศัพท์ภายใน / ติดต่อ *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none"
                placeholder="เช่น 032-337-1234 (ต่อ 104)"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-[#00173b] block mb-1">
                อีเมลศูนย์บริการ / ครูผู้รับผิดชอบ *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none font-mono"
                placeholder="เช่น admin.satit@rb-muni.ac.th"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-[#00173b] block mb-1">
                เวลาทำการ / ช่วงเวลาติดต่อ *
              </label>
              <input
                type="text"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none"
                placeholder="เช่น จันทร์ - ศุกร์ 08:00 - 16:30 น."
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#00173b] block mb-1">
              หมายเหตุคำแนะนำเพิ่มเติม (Note)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#c4c6d0] focus:ring-2 focus:ring-[#00173b] outline-none"
              placeholder="เช่น * นักเรียนสามารถขอรีเซ็ตรหัสผ่านได้โดยแจ้งเลขประจำตัวประชาชนหรือรหัสประจำตัวนักเรียน 5-6 หลักกับครูประจำชั้น"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#dce9ff] space-y-1 text-xs">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#00173b] block mb-1">
              ตัวอย่างการแสดงผล (Preview):
            </span>
            <p className="font-bold text-[#00173b]">{officeLocation || 'ห้องวิชาการ...'}</p>
            <p className="text-[#44474f]">โทรศัพท์ภายใน: {phone || '-'}</p>
            <p className="text-[#44474f]">อีเมล: {email || '-'}</p>
            <p className="text-[#44474f]">เวลาทำการ: {workingHours || '-'}</p>
            <p className="text-[11px] text-[#747780] italic pt-1">{note || '-'}</p>
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
              className="px-5 py-2 bg-[#00173b] hover:bg-[#0f2c59] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              id="btn-save-contact-info"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>บันทึกข้อมูลติดต่อ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
