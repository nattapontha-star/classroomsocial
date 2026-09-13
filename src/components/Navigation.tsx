import React from 'react';
import { SCHOOL_LOGO_URL } from '../data/initialData';
import { Student } from '../types';

interface NavigationProps {
  currentScreen: 'home' | 'scores' | 'classroom' | 'admin';
  setCurrentScreen: (screen: 'home' | 'scores' | 'classroom' | 'admin') => void;
  currentUser: Student | null;
  onLogout: () => void;
  schoolName: string;
  isAdminLoggedIn?: boolean;
  adminUser?: { email: string; name: string; role: string } | null;
  onAdminLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  setCurrentScreen,
  currentUser,
  onLogout,
  schoolName,
  isAdminLoggedIn,
  adminUser,
}) => {
  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(15,44,89,0.06)] border-b border-[#e6eeff]">
        <div className="h-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo & School Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentScreen('home')}
            id="nav-brand-header"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 shadow-sm border border-[#dce9ff] overflow-hidden group-hover:scale-105 transition-transform">
              <img
                src={SCHOOL_LOGO_URL}
                alt="ตราโรงเรียนสาธิตเทศบาลเมืองราชบุรี"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base md:text-lg text-[#00173b] tracking-tight leading-snug">
                {schoolName}
              </span>
              <span className="text-xs text-[#44474f] font-normal">
                ระบบจัดการเรียนการสอนออนไลน์ (Satit E-Learning)
              </span>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav aria-label="เมนูหลัก" className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentScreen('classroom')}
              id="nav-btn-classroom"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentScreen === 'classroom'
                  ? 'bg-[#0f2c59] text-white shadow-sm'
                  : 'text-[#0d1c2e] hover:bg-[#eff4ff] hover:text-[#00173b]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span>1. เข้าสู่บทเรียน</span>
            </button>

            <button
              onClick={() => setCurrentScreen('scores')}
              id="nav-btn-scores"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentScreen === 'scores'
                  ? 'bg-[#00173b] text-white shadow-sm'
                  : 'text-[#0d1c2e] hover:bg-[#eff4ff] hover:text-[#00173b]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
              <span>2. เช็คคะแนน</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('admin')}
              id="nav-btn-admin"
              className={`px-3 py-1.5 text-xs md:text-sm rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                currentScreen === 'admin'
                  ? 'bg-[#00173b] text-white border-[#00173b] shadow-xs'
                  : isAdminLoggedIn
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'text-[#44474f] bg-white border-[#c4c6d0]/60 hover:bg-[#eff4ff] hover:text-[#00173b]'
              }`}
              title="เข้าสู่ระบบผู้ดูแลและครูผู้สอน"
            >
              {isAdminLoggedIn ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">admin_panel_settings</span>
                  <span className="hidden sm:inline">
                    {adminUser?.name?.split(' ')[0] || 'แผงควบคุมคุณครู'}
                  </span>
                  <span className="sm:hidden">แอดมิน</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] text-[#bb0112]">vpn_key</span>
                  <span className="hidden sm:inline">เข้าสู่ระบบคุณครู/แอดมิน</span>
                  <span className="sm:hidden">แอดมิน</span>
                </>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <div
                  onClick={() => setCurrentScreen('classroom')}
                  className="hidden md:flex flex-col text-right cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#00173b]">{currentUser.firstName} {currentUser.lastName}</span>
                  <span className="text-[11px] text-[#44474f]">{currentUser.classRoom} • เลขที่ {currentUser.number}</span>
                </div>
                <button
                  onClick={onLogout}
                  id="nav-btn-logout"
                  className="p-2 rounded-lg bg-[#ffdad6] text-[#bb0112] hover:bg-[#bb0112] hover:text-white transition-colors"
                  title="ออกจากระบบ"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentScreen('home')}
                id="nav-btn-register"
                className="px-3 md:px-4 py-2 rounded-lg bg-[#bb0112] text-white hover:bg-[#93000b] text-xs md:text-sm font-semibold transition-all shadow-[0_2px_6px_rgba(187,1,18,0.2)] whitespace-nowrap"
              >
                ลงทะเบียนใหม่
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Quick Screen Switcher Pill Toolbar (Sticky Floating Footer Bar for easy reviewing across all 4 screens) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#00173b]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-1.5 text-xs font-medium">
        <span className="text-white/60 text-[11px] px-2 hidden sm:inline">สลับหน้าจอ:</span>
        <button
          onClick={() => setCurrentScreen('home')}
          id="quick-switch-home"
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            currentScreen === 'home'
              ? 'bg-[#bb0112] text-white font-bold shadow-md'
              : 'hover:bg-white/10 text-white/90'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">login</span>
          <span>1. หน้าพอร์ทัล / สมัคร</span>
        </button>
        <button
          onClick={() => setCurrentScreen('scores')}
          id="quick-switch-scores"
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            currentScreen === 'scores'
              ? 'bg-[#bb0112] text-white font-bold shadow-md'
              : 'hover:bg-white/10 text-white/90'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">fact_check</span>
          <span>2. เช็คคะแนน</span>
        </button>
        <button
          onClick={() => setCurrentScreen('classroom')}
          id="quick-switch-classroom"
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            currentScreen === 'classroom'
              ? 'bg-[#bb0112] text-white font-bold shadow-md'
              : 'hover:bg-white/10 text-white/90'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">school</span>
          <span>3. ห้องเรียน & สอบ</span>
        </button>
        <button
          onClick={() => setCurrentScreen('admin')}
          id="quick-switch-admin"
          className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${
            currentScreen === 'admin'
              ? 'bg-[#bb0112] text-white font-bold shadow-md'
              : 'hover:bg-white/10 text-white/90'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
          <span>4. แผงควบคุมครู</span>
        </button>
      </div>
    </>
  );
};
