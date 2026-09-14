import React, { useState } from 'react';
import { SCHOOL_LOGO_URL, initialContactInfo } from '../data/initialData';
import { Student, ContactInfo } from '../types';

interface PortalAuthScreenProps {
  students: Student[];
  onLoginSuccess: (student: Student) => void;
  onRegisterStudent: (newStudent: Student) => boolean;
  onNavigateScores: () => void;
  schoolName: string;
  contactInfo?: ContactInfo;
}

export const PortalAuthScreen: React.FC<PortalAuthScreenProps> = ({
  students,
  onLoginSuccess,
  onRegisterStudent,
  onNavigateScores,
  schoolName,
  contactInfo,
}) => {
  const currentContact: ContactInfo = { ...initialContactInfo, ...(contactInfo || {}) };
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [levelFilter, setLevelFilter] = useState<'early' | 'late'>('early');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regClass, setRegClass] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConsent, setRegConsent] = useState(false);
  const [regFeedback, setRegFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Quick helper modal state for help desk
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    setLoginSuccessMessage(null);

    const trimmedUser = loginUsername.trim().toLowerCase();
    const trimmedPass = loginPassword.trim();

    const matched = students.find(
      (s) =>
        (s.username.toLowerCase() === trimmedUser || s.studentId.toLowerCase() === trimmedUser) &&
        s.password === trimmedPass
    );

    if (matched) {
      setLoginSuccessMessage(
        `เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ${matched.firstName} ${matched.lastName} (${matched.classRoom} เลขที่ ${matched.number}) กำลังนำท่านเข้าสู่ห้องเรียน...`
      );
      setTimeout(() => {
        onLoginSuccess(matched);
      }, 700);
    } else {
      setLoginError(true);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);

    if (!regConsent) {
      setRegFeedback({
        type: 'error',
        message: 'กรุณายืนยันการยินยอมข้อมูลก่อนทำการลงทะเบียน',
      });
      return;
    }

    const usernameTrimmed = regUsername.trim().toLowerCase();
    const existingUser = students.find((s) => s.username.toLowerCase() === usernameTrimmed);
    if (existingUser) {
      setRegFeedback({
        type: 'error',
        message: `ชื่อผู้ใช้ (Username: ${regUsername}) มีอยู่ในระบบแล้ว กรุณาตั้งใหม่`,
      });
      return;
    }

    const existingClassNum = students.find(
      (s) => s.classRoom === regClass && s.number === regNumber.trim()
    );
    if (existingClassNum) {
      setRegFeedback({
        type: 'error',
        message: `ระดับชั้น ${regClass} เลขที่ ${regNumber} ถูกลงทะเบียนในระบบแล้ว`,
      });
      return;
    }

    const newStudent: Student = {
      studentId: 'ST-' + Math.floor(10000 + Math.random() * 90000),
      username: regUsername.trim(),
      password: regPassword.trim(),
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      classRoom: regClass,
      number: regNumber.trim(),
      registeredAt: new Date().toLocaleDateString('th-TH') + ' ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      email: `${regUsername.trim()}@satit.ac.th`,
      progressPercent: 0,
    };

    const success = onRegisterStudent(newStudent);
    if (success) {
      setRegFeedback({
        type: 'success',
        message: 'ลงทะเบียนสำเร็จ! ได้รับสิทธิ์เข้าสู่บทเรียนออนไลน์แล้ว กำลังเตรียมนำเข้าสู่ระบบ...',
      });

      setTimeout(() => {
        setAuthMode('login');
        setLoginUsername(newStudent.username);
        setLoginPassword(newStudent.password || '');
        setRegFeedback(null);
      }, 1500);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#f8f9ff]">
      <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pt-4 pb-16">
        
        {/* Top Navigation & Brand Header */}
        <header className="w-full bg-white rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#e6eeff]">
          <div className="flex items-center gap-4 w-full md:w-auto">
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

          {/* 2 Core Navigation Tabs */}
          <nav aria-label="เมนูหลัก" className="flex items-center bg-[#eff4ff] p-1.5 rounded-xl w-full md:w-auto overflow-x-auto border border-[#e6eeff]">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-[#0f2c59] text-white shadow-sm whitespace-nowrap"
              id="nav-btn-classroom-main"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span>1. เข้าสู่บทเรียน</span>
            </button>
            <button
              onClick={onNavigateScores}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-[#0d1c2e] hover:text-[#00173b] whitespace-nowrap"
              id="nav-btn-scores-main"
            >
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              <span>2. เช็คคะแนน</span>
            </button>
          </nav>
        </header>

        {/* Live Status & Sync Indicator Bar */}
        <div className="w-full bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-sm border border-[#e6eeff]">
          <div className="flex items-center gap-2 text-[#00173b] font-medium">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bb0112] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#bb0112]"></span>
            </span>
            <span>
              ฐานข้อมูลกลาง: <strong>Google Sheets Database Active</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[#44474f]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-[#00173b]">cloud_sync</span>
              อัปเดตอัตโนมัติ 2-Way Sync
            </span>
            <span className="hidden sm:inline text-[#c4c6d0]">|</span>
            <span className="flex items-center gap-1 text-sm text-[#0d1c2e] font-semibold">
              <span className="material-symbols-outlined text-[18px] text-[#bb0112]">verified_user</span>
              ระบบรักษาความปลอดภัยนักเรียนสาธิตฯ
            </span>
          </div>
        </div>

        {/* Primary Interactive Section: Authentication & Classroom Access */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Tabs for Login & New Registration */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-[#e6eeff]">
            {/* Direct Classroom Access Requirement Banner */}
            <div className="bg-[#00173b] px-6 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="material-symbols-outlined text-[#ffdad6] text-[22px]">lock</span>
                <span>ขั้นตอนการเข้าสู่บทเรียนออนไลน์</span>
              </div>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-[#d8e2ff] font-medium">
                ยืนยันตัวตนก่อนเข้าเรียน
              </span>
            </div>

            {/* Sub-tabs switcher */}
            <div className="flex bg-[#eff4ff] p-2 gap-2 border-b border-[#e6eeff]">
              <button
                onClick={() => setAuthMode('login')}
                id="auth-tab-login"
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-white text-[#00173b] shadow-sm'
                    : 'text-[#44474f] hover:text-[#00173b]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">lock_person</span>
                <span>เข้าสู่ระบบเรียนออนไลน์</span>
              </button>
              <button
                onClick={() => setAuthMode('register')}
                id="auth-tab-register"
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  authMode === 'register'
                    ? 'bg-white text-[#00173b] shadow-sm'
                    : 'text-[#44474f] hover:text-[#00173b]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
                <span>ลงทะเบียนนักเรียนใหม่</span>
              </button>
            </div>

            {/* FORM 1: LOGIN */}
            {authMode === 'login' && (
              <div className="p-6 md:p-8 flex flex-col gap-4" id="panel-login">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#bb0112] rounded-full"></span>
                    <h2 className="text-xl text-[#00173b] font-bold">เข้าสู่ระบบเพื่อเข้าสู่บทเรียนออนไลน์</h2>
                  </div>
                  <p className="text-sm text-[#44474f]">
                    กรุณาเข้าสู่ระบบด้วยบัญชีนักเรียนเพื่อรับสิทธิ์เข้าถึงห้องเรียนออนไลน์ คลังบทเรียน และใบงาน
                  </p>
                </div>

                {/* Login Alert Banner */}
                {loginError && (
                  <div
                    id="login-alert"
                    className="rounded-lg bg-[#ffdad6] p-4 flex items-start gap-3 text-[#93000a] transition-all"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#ba1a1a] shrink-0">error</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-[#ba1a1a]">
                        ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบ Username หรือ Password
                      </span>
                      <span className="text-xs text-[#93000a] mt-0.5">
                        ไม่พบข้อมูลบัญชีนี้ในฐานข้อมูล Google Sheets หรือรหัสผ่านไม่ตรงกัน (ทดลองใช้: somchai.s / 123456)
                      </span>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {loginSuccessMessage && (
                  <div
                    id="login-success"
                    className="rounded-lg bg-[#dce9ff] p-4 flex items-center gap-3 text-[#00173b] transition-all"
                  >
                    <span className="material-symbols-outlined text-[22px] text-[#00173b] shrink-0">check_circle</span>
                    <span className="text-sm font-semibold">{loginSuccessMessage}</span>
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleLogin} id="form-login">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#0d1c2e] flex items-center justify-between" htmlFor="login-username">
                      <span>ชื่อผู้ใช้งาน (Username หรือ รหัสนักเรียน)</span>
                      <span className="text-xs text-[#44474f] font-normal">เช่น somchai.s หรือ ST-40101</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#747780]">account_circle</span>
                      <input
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] transition-all"
                        id="login-username"
                        placeholder="กรอกชื่อผู้ใช้ภาษาอังกฤษ หรือรหัสนักเรียน"
                        required
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#0d1c2e] flex items-center justify-between" htmlFor="login-password">
                      <span>รหัสผ่าน (Password)</span>
                      <span className="text-xs text-[#44474f] font-normal">รหัสนักเรียน 6 หลัก (ค่าเริ่มต้น: 123456)</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-[#747780]">key</span>
                      <input
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] transition-all"
                        id="login-password"
                        maxLength={20}
                        placeholder="กรอกรหัสผ่าน 6 หลัก"
                        required
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        className="absolute right-3 text-[#747780] hover:text-[#0d1c2e]"
                        onClick={() => setShowPassword(!showPassword)}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Sheet Check Guarantee Badge */}
                  <div className="bg-[#eff4ff] rounded-lg p-3 flex items-center gap-2 text-[#44474f] text-xs">
                    <span className="material-symbols-outlined text-[#bb0112] text-[20px]">dataset</span>
                    <span>ระบบจะทำการค้นหาและจับคู่ข้อมูลแบบเรียลไทม์กับ Google Sheet ส่วนกลาง</span>
                  </div>

                  <button
                    className="w-full py-3.5 px-4 bg-[#00173b] hover:bg-[#0f2c59] text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200"
                    type="submit"
                    id="btn-login-submit"
                  >
                    <span className="material-symbols-outlined">login</span>
                    <span>เข้าสู่ระบบและเปิดห้องเรียน</span>
                  </button>
                </form>

                <div className="flex flex-wrap items-center justify-between pt-1 text-xs text-[#44474f] gap-2">
                  <button
                    className="hover:text-[#bb0112] underline underline-offset-4 flex items-center gap-1"
                    onClick={() => setShowHelpModal(true)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">help_outline</span>
                    ลืมรหัสผ่านหรือมีปัญหาเข้าใช้งาน?
                  </button>
                  <button
                    className="text-[#bb0112] font-semibold hover:underline underline-offset-4"
                    onClick={() => setAuthMode('register')}
                    type="button"
                  >
                    ยังไม่มีสิทธิ์? ลงทะเบียนใหม่เพื่อเข้าเรียน
                  </button>
                </div>
              </div>
            )}

            {/* FORM 2: REGISTRATION */}
            {authMode === 'register' && (
              <div className="p-6 md:p-8 flex flex-col gap-4" id="panel-register">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#bb0112] rounded-full"></span>
                    <h2 className="text-xl text-[#00173b] font-bold">ลงทะเบียนรับสิทธิ์เข้าสู่บทเรียน</h2>
                  </div>
                  <p className="text-sm text-[#44474f]">
                    กรอกข้อมูลนักเรียนให้ครบถ้วนเพื่อสร้างบัญชีและรับสิทธิ์เข้าถึงบทเรียนดิจิทัล ข้อมูลจะถูกบันทึกไปยัง Google Sheet
                  </p>
                </div>

                {/* Registration Alert Notice */}
                <div className="rounded-lg bg-[#dce9ff] p-3.5 flex items-start gap-2.5 text-[#0d1c2e]">
                  <span className="material-symbols-outlined text-[20px] text-[#bb0112] shrink-0">info</span>
                  <p className="text-xs text-[#44474f] leading-relaxed">
                    <strong className="text-[#00173b]">คำเตือนระบบ:</strong> หากกรอกไม่ครบหรือ Username/เลขที่ซ้ำในระบบ จะมีการแจ้งเตือนทันที และข้อมูลจะถูกบันทึกส่งตรงไปยัง Google Sheet ประจำภาคเรียน
                  </p>
                </div>

                {/* Feedback Message */}
                {regFeedback && (
                  <div
                    className={`rounded-lg p-3.5 flex items-start gap-2.5 text-xs transition-all ${
                      regFeedback.type === 'error'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-[#eff4ff] text-[#00173b] border border-[#dce9ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {regFeedback.type === 'error' ? 'warning' : 'task_alt'}
                    </span>
                    <span>{regFeedback.message}</span>
                  </div>
                )}

                <form className="flex flex-col gap-3.5" onSubmit={handleRegister} id="form-register">
                  {/* Name Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="reg-firstname">
                        ชื่อ (First Name) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all"
                        id="reg-firstname"
                        placeholder="เช่น สมชาย"
                        required
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="reg-lastname">
                        นามสกุล (Last Name) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all"
                        id="reg-lastname"
                        placeholder="เช่น ใจดี"
                        required
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Class & Student No Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="reg-class">
                        ระดับชั้นที่เชื่อมโยงฐานข้อมูล *
                      </label>
                      <select
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all cursor-pointer"
                        id="reg-class"
                        required
                        value={regClass}
                        onChange={(e) => setRegClass(e.target.value)}
                      >
                        <option value="" disabled>เลือกระดับชั้นตามทะเบียน</option>
                        <optgroup label="มัธยมศึกษาตอนต้น">
                          <option value="ม.1/1">มัธยมศึกษาปีที่ 1/1</option>
                          <option value="ม.1/2">มัธยมศึกษาปีที่ 1/2</option>
                          <option value="ม.2/1">มัธยมศึกษาปีที่ 2/1</option>
                          <option value="ม.2/2">มัธยมศึกษาปีที่ 2/2</option>
                          <option value="ม.3/1">มัธยมศึกษาปีที่ 3/1</option>
                          <option value="ม.3/2">มัธยมศึกษาปีที่ 3/2</option>
                        </optgroup>
                        <optgroup label="มัธยมศึกษาตอนปลาย">
                          <option value="ม.4/1">มัธยมศึกษาปีที่ 4/1 (วิทย์-คณิต)</option>
                          <option value="ม.4/2">มัธยมศึกษาปีที่ 4/2 (ศิลป์-ภาษา)</option>
                          <option value="ม.5/1">มัธยมศึกษาปีที่ 5/1 (วิทย์-คณิต)</option>
                          <option value="ม.5/2">มัธยมศึกษาปีที่ 5/2 (ศิลป์-ภาษา)</option>
                          <option value="ม.6/1">มัธยมศึกษาปีที่ 6/1 (วิทย์-คณิต)</option>
                          <option value="ม.6/2">มัธยมศึกษาปีที่ 6/2 (ศิลป์-ภาษา)</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="reg-number">
                        เลขที่ (Student No.) *
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all"
                        id="reg-number"
                        max="50"
                        min="1"
                        placeholder="เช่น 1, 15, 24"
                        required
                        type="number"
                        value={regNumber}
                        onChange={(e) => setRegNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e] flex justify-between" htmlFor="reg-username">
                        <span>Username *</span>
                        <span className="text-[#44474f] font-normal text-[11px]">ภาษาอังกฤษเท่านั้น</span>
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all"
                        id="reg-username"
                        pattern="[A-Za-z0-9._]{3,20}"
                        placeholder="เช่น somchai.s"
                        required
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e] flex justify-between" htmlFor="reg-password">
                        <span>Password *</span>
                        <span className="text-[#44474f] font-normal text-[11px]">รหัสนักเรียน 6 หลัก</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00173b] transition-all"
                          id="reg-password"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          placeholder="เช่น 123456"
                          required
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className="absolute right-3 text-[#747780]"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showRegPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      className="w-4 h-4 rounded text-[#00173b] focus:ring-[#00173b] cursor-pointer"
                      id="reg-consent"
                      required
                      type="checkbox"
                      checked={regConsent}
                      onChange={(e) => setRegConsent(e.target.checked)}
                    />
                    <label className="text-xs text-[#44474f] cursor-pointer" htmlFor="reg-consent">
                      ข้าพเจ้ายืนยันว่าข้อมูลเป็นความจริง และยินยอมให้บันทึกลงระบบทะเบียนวัดผลการศึกษา
                    </label>
                  </div>

                  <button
                    className="w-full py-3.5 px-4 bg-[#bb0112] hover:bg-[#93000b] text-white font-semibold text-sm rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-200"
                    type="submit"
                    id="btn-register-submit"
                  >
                    <span className="material-symbols-outlined">how_to_reg</span>
                    <span>บันทึกข้อมูลและรับสิทธิ์เข้าเรียน</span>
                  </button>
                </form>

                <div className="text-center pt-1 text-xs text-[#44474f]">
                  <span>มีบัญชีและสิทธิ์เข้าห้องเรียนแล้ว?</span>
                  <button
                    className="text-[#00173b] font-bold underline underline-offset-4 ml-1"
                    onClick={() => setAuthMode('login')}
                    type="button"
                  >
                    คลิกที่นี่เพื่อเข้าสู่ระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Level Browser & Information Card */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Classroom Level Selector & Sheets Data Preview Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-[#e6eeff]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112] text-[22px]">database</span>
                  <h3 className="text-base font-bold text-[#00173b]">เลือกระดับชั้นเชื่อมโยงฐานข้อมูล</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#00173b] text-xs font-semibold">
                  Sheets Connected
                </span>
              </div>
              <p className="text-xs text-[#44474f]">
                เลือกระดับชั้นเพื่อดูสถานะจำนวนนักเรียนและคลังบทเรียนประจำระดับชั้นที่ซิงก์จาก Google Sheets
              </p>

              {/* Level Category Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-[#eff4ff] p-1.5 rounded-lg">
                <button
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-all text-center ${
                    levelFilter === 'early'
                      ? 'bg-white text-[#00173b] shadow-xs'
                      : 'text-[#44474f] hover:text-[#00173b]'
                  }`}
                  onClick={() => setLevelFilter('early')}
                  id="tab-level-m-early"
                >
                  มัธยมศึกษาตอนต้น (ม.1 - ม.3)
                </button>
                <button
                  className={`py-2 px-3 rounded-md text-xs font-semibold transition-all text-center ${
                    levelFilter === 'late'
                      ? 'bg-white text-[#00173b] shadow-xs'
                      : 'text-[#44474f] hover:text-[#00173b]'
                  }`}
                  onClick={() => setLevelFilter('late')}
                  id="tab-level-m-late"
                >
                  มัธยมศึกษาตอนปลาย (ม.4 - ม.6)
                </button>
              </div>

              {/* Level Pills & Database Sync Status */}
              <div className="flex flex-col gap-2 pt-1" id="level-list-container">
                {levelFilter === 'early' ? (
                  <>
                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#0f2c59] text-white flex items-center justify-center font-bold text-xs">ม.1</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 1 (ห้อง 1, 2)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 8 วิชา • ชีตนักเรียน 78 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#0f2c59] text-white flex items-center justify-center font-bold text-xs">ม.2</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 2 (ห้อง 1, 2)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 9 วิชา • ชีตนักเรียน 82 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#0f2c59] text-white flex items-center justify-center font-bold text-xs">ม.3</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 3 (ห้อง 1, 2)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 10 วิชา • ชีตนักเรียน 80 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#bb0112] text-white flex items-center justify-center font-bold text-xs">ม.4</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 4 (วิทย์-คณิต / ศิลป์)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 12 วิชา • ชีตนักเรียน 75 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#bb0112] text-white flex items-center justify-center font-bold text-xs">ม.5</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 5 (วิทย์-คณิต / ศิลป์)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 12 วิชา • ชีตนักเรียน 72 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#eff4ff] hover:bg-[#e6eeff] flex items-center justify-between transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-[#bb0112] text-white flex items-center justify-center font-bold text-xs">ม.6</span>
                        <div>
                          <div className="text-xs font-semibold text-[#00173b]">มัธยมศึกษาปีที่ 6 (เตรียมสอบ & สะสมผลงาน)</div>
                          <div className="text-[11px] text-[#44474f]">คลังบทเรียน 14 วิชา • ชีตนักเรียน 68 รายชื่อ</div>
                        </div>
                      </div>
                      <span className="text-xs text-[#bb0112] font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bb0112]"></span> พร้อมเข้าเรียน
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* School Vision & Banner Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden border border-[#e6eeff]">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#eff4ff] rounded-full pointer-events-none"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2.5 rounded-lg bg-[#00173b] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[24px]">school</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00173b]">สาธิตวิชาการดิจิทัล</h3>
                  <p className="text-xs text-[#44474f]">เทศบาลเมืองราชบุรี มุ่งสู่ความเป็นเลิศ</p>
                </div>
              </div>
              <p className="text-xs text-[#44474f] leading-relaxed relative z-10">
                เมื่อยืนยันตัวตนในเมนู "1. เข้าสู่บทเรียน" เรียบร้อยแล้ว นักเรียนจะสามารถเข้าถึงบทเรียนดิจิทัล ทำแบบทดสอบเก็บคะแนน และส่งชิ้นงานได้ตามระดับชั้นของตนเอง
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t-0">
                <div className="bg-[#eff4ff] rounded-lg p-3 text-center border border-[#e6eeff]">
                  <span className="text-xl text-[#00173b] block font-bold">12+</span>
                  <span className="text-[11px] text-[#44474f]">กลุ่มสาระฯ</span>
                </div>
                <div className="bg-[#eff4ff] rounded-lg p-3 text-center border border-[#e6eeff]">
                  <span className="text-xl text-[#bb0112] block font-bold">100%</span>
                  <span className="text-[11px] text-[#44474f]">ระบบเรียลไทม์</span>
                </div>
                <div className="bg-[#eff4ff] rounded-lg p-3 text-center border border-[#e6eeff]">
                  <span className="text-xl text-[#00173b] block font-bold">1.2K</span>
                  <span className="text-[11px] text-[#44474f]">ผู้เรียนในระบบ</span>
                </div>
              </div>
            </div>

            {/* Direct Contact & Support Info Card on Home Screen */}
            <div className="bg-white rounded-xl p-5 border border-[#dce9ff] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#e6eeff] pb-2.5">
                <div className="flex items-center gap-2 text-[#00173b]">
                  <span className="material-symbols-outlined text-[#bb0112] text-[22px]">contact_support</span>
                  <h5 className="font-bold text-sm text-[#00173b]">{currentContact.title}</h5>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  เปิดบริการ
                </span>
              </div>
              <p className="text-xs text-[#44474f] leading-relaxed">
                {currentContact.subtitle}
              </p>
              <div className="p-3.5 bg-[#eff4ff]/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-[#00173b]">
                  <span className="material-symbols-outlined text-[16px] text-[#00173b] shrink-0 mt-0.5">location_on</span>
                  <span className="font-semibold">{currentContact.officeLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-[#44474f]">
                  <span className="material-symbols-outlined text-[16px] text-[#44474f] shrink-0">call</span>
                  <span>โทรศัพท์ภายใน: <strong className="text-[#00173b]">{currentContact.phone}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#44474f]">
                  <span className="material-symbols-outlined text-[16px] text-[#44474f] shrink-0">mail</span>
                  <span>อีเมล: <strong className="text-[#00173b] font-mono">{currentContact.email}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[#44474f]">
                  <span className="material-symbols-outlined text-[16px] text-[#44474f] shrink-0">schedule</span>
                  <span>เวลาทำการ: <strong className="text-[#00173b]">{currentContact.workingHours}</strong></span>
                </div>
              </div>
              {currentContact.note && (
                <p className="text-[11px] text-[#747780] leading-relaxed italic">
                  {currentContact.note}
                </p>
              )}
            </div>

            {/* Live Support Quick Button Card */}
            <div className="bg-[#00173b] text-white rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px] text-[#d8e2ff]">contact_support</span>
                <div>
                  <h5 className="font-semibold text-sm text-white">{currentContact.title}</h5>
                  <p className="text-xs text-[#d5e3fc] line-clamp-1">{currentContact.officeLocation}</p>
                </div>
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-white text-[#00173b] text-xs font-bold hover:bg-[#eff4ff] transition-colors shrink-0"
                onClick={() => setShowHelpModal(true)}
                type="button"
                id="btn-open-help-modal"
              >
                ติดต่อครู
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
            <span>มาตรฐานความปลอดภัยทางวิชาการ</span>
            <span>•</span>
            <span>Google Workspace for Education</span>
          </div>
        </footer>

        {/* Support Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#bb0112] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112]">contact_support</span>
                  <span>{currentContact.title}</span>
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="space-y-2.5 text-xs text-[#44474f] leading-relaxed">
                <p>{currentContact.subtitle}</p>
                <div className="p-3 bg-[#eff4ff] rounded-lg space-y-1">
                  <p className="font-bold text-[#00173b]">{currentContact.officeLocation}</p>
                  <p>โทรศัพท์ภายใน: {currentContact.phone}</p>
                  <p>อีเมล: {currentContact.email}</p>
                  <p>เวลาทำการ: {currentContact.workingHours}</p>
                </div>
                {currentContact.note && (
                  <p className="text-[11px] text-[#747780]">
                    {currentContact.note}
                  </p>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-[#00173b] text-white rounded-lg text-xs font-semibold hover:bg-[#0f2c59]"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
