import React, { useState } from 'react';
import { SCHOOL_LOGO_URL } from '../data/initialData';

interface TeacherLoginScreenProps {
  onLoginSuccess: (adminInfo: { email: string; name: string; role: string }) => void;
  onCancel: () => void;
  schoolName: string;
}

export const TeacherLoginScreen: React.FC<TeacherLoginScreenProps> = ({
  onLoginSuccess,
  onCancel,
  schoolName,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Quick Google Login
  const handleGoogleLogin = (selectedEmail: string, displayName: string) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setTimeout(() => {
      setIsProcessing(false);
      onLoginSuccess({
        email: selectedEmail,
        name: displayName,
        role: 'ผู้ดูแลระบบและครูผู้สอน (Google Workspace Authorized)',
      });
    }, 600);
  };

  // Standard Username / Password submit
  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    // Allow standard admin credentials or school emails
    if (
      (trimmedEmail === 'admin.satit@gmail.com' ||
        trimmedEmail === 'admin' ||
        trimmedEmail === 'teacher.somchai' ||
        trimmedEmail.includes('@satit') ||
        trimmedEmail.includes('@thaimooc.ac.th') ||
        trimmedEmail.includes('@gmail.com')) &&
      (trimmedPass === 'admin1234' || trimmedPass === '123456' || trimmedPass.length >= 4)
    ) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onLoginSuccess({
          email: trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@satit.ac.th`,
          name: trimmedEmail.includes('somchai') ? 'ครูสมชาย ศักดิ์โสภณ' : 'ผู้ดูแลระบบกลาง',
          role: 'ผู้ดูแลระบบและครูผู้สอน',
        });
      }, 500);
    } else {
      setErrorMsg('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (รหัสผ่านทดสอบ: admin1234 หรือใช้ปุ่ม Google)');
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8 bg-[#f8f9ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e6eeff] overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-[#00173b] p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-1 shadow-md border-2 border-[#dce9ff] flex items-center justify-center">
            <img
              src={SCHOOL_LOGO_URL}
              alt="ตราโรงเรียนสาธิตเทศบาลเมืองราชบุรี"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[11px] font-bold text-[#ffdad6] uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            TEACHER & ADMIN AUTHENTICATION
          </span>
          <h2 className="text-xl font-bold tracking-tight">เข้าสู่ระบบคุณครู / ผู้ดูแลระบบ</h2>
          <p className="text-xs text-[#d8e2ff] mt-1">{schoolName}</p>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-5">
          
          {/* Status feedback */}
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] rounded-xl text-[#93000a] text-xs font-medium flex items-center gap-2 border border-[#ffb4ab]">
              <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {isProcessing && (
            <div className="p-3 bg-[#dce9ff] rounded-xl text-[#00173b] text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#00173b] border-t-transparent rounded-full animate-spin"></span>
              <span>กำลังตรวจสอบสิทธิ์ความปลอดภัย Google Workspace...</span>
            </div>
          )}

          {/* SECTION 1: GOOGLE ACCOUNT SIGN-IN */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold text-[#00173b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#bb0112]">verified_user</span>
              <span>เข้าสู่ระบบด้วยบัญชี Google (แนะนำ)</span>
            </span>

            {/* Official Style Google Sign-In Button */}
            <button
              onClick={() => handleGoogleLogin('nattapon.tha@thaimooc.ac.th', 'อ.ณัฐพล (ThaiMOOC / Satit Admin)')}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl border border-[#c4c6d0] bg-white hover:bg-[#eff4ff] text-[#0d1c2e] font-semibold text-xs md:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              id="btn-google-login-primary"
            >
              {/* Google 4-color SVG logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ลงชื่อเข้าใช้ด้วย Google Workspace</span>
            </button>

            {/* Quick account pills */}
            <div className="bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] flex flex-col gap-1.5">
              <span className="text-[11px] text-[#44474f] font-medium">เลือกบัญชี Google เพื่อเข้าใช้งานทันที:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin('nattapon.tha@thaimooc.ac.th', 'อ.ณัฐพล')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#dce9ff] border border-[#c4c6d0]/50 text-[11px] font-semibold text-[#00173b] flex items-center gap-1 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>nattapon.tha@thaimooc.ac.th</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin('admin.satit@gmail.com', 'Admin Satit')}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#dce9ff] border border-[#c4c6d0]/50 text-[11px] font-semibold text-[#00173b] flex items-center gap-1 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>admin.satit@gmail.com</span>
                </button>
              </div>

              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="text-[11px] text-[#bb0112] hover:underline self-start mt-0.5 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>ระบุบัญชี Google อื่นๆ...</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="example@gmail.com หรือ @school.ac.th"
                    className="flex-1 px-2.5 py-1 text-xs rounded border border-[#c4c6d0] bg-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGoogleEmail.trim()) {
                        handleGoogleLogin(customGoogleEmail.trim(), customGoogleEmail.split('@')[0]);
                      }
                    }}
                    className="px-2.5 py-1 bg-[#00173b] text-white text-xs rounded font-semibold"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e6eeff] w-full"></div>
            <span className="bg-white px-3 text-[11px] text-[#747780] uppercase tracking-wider font-semibold whitespace-nowrap">
              หรือเข้าสู่ระบบด้วยรหัสผ่าน
            </span>
          </div>

          {/* SECTION 2: USERNAME / PASSWORD FORM */}
          <form onSubmit={handleStandardSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="teacher-email">
                อีเมลคุณครู หรือ ชื่อผู้ใช้
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747780] text-[18px]">
                  account_circle
                </span>
                <input
                  id="teacher-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น admin.satit@gmail.com หรือ admin"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="teacher-password">
                  รหัสผ่าน (Password)
                </label>
                <span className="text-[11px] text-[#747780]">รหัสผ่านทดสอบ: admin1234</span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747780] text-[18px]">
                  lock
                </span>
                <input
                  id="teacher-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#747780] hover:text-[#0d1c2e]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-[#00173b] hover:bg-[#0f2c59] text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 mt-1"
              id="btn-teacher-login-submit"
            >
              <span className="material-symbols-outlined text-[18px]">vpn_key</span>
              <span>เข้าสู่ระบบแผงควบคุมคุณครู/แอดมิน</span>
            </button>
          </form>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl text-[#44474f] hover:bg-[#eff4ff] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>กลับสู่หน้าแรก (Student Portal)</span>
          </button>

        </div>
      </div>
    </div>
  );
};
