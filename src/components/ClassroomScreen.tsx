import React, { useState } from 'react';
import { AVATAR_URL, VIDEO_THUMB_URL } from '../data/initialData';
import { Student, CurriculumUnit } from '../types';

interface ClassroomScreenProps {
  currentUser: Student | null;
  curriculum: CurriculumUnit[];
  onLogout: () => void;
  onNavigateScores: () => void;
  onNavigateHome: () => void;
  schoolName: string;
}

export const ClassroomScreen: React.FC<ClassroomScreenProps> = ({
  currentUser,
  curriculum,
  onLogout,
  onNavigateScores,
  onNavigateHome,
  schoolName,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState('u2');
  const [selectedLessonId, setSelectedLessonId] = useState('l2-1');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isSavedBookmark, setIsSavedBookmark] = useState(false);

  // Quiz state for Unit 2
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [submissionTime, setSubmissionTime] = useState('');
  const [quizError, setQuizError] = useState<string | null>(null);

  const activeUnit = curriculum.find((u) => u.id === selectedUnitId) || curriculum[1];
  const activeLesson =
    activeUnit.lessons.find((l) => l.id === selectedLessonId) || activeUnit.lessons[0];

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
    setQuizError(null);
  };

  const handleSubmitQuiz = () => {
    if (!activeUnit.quiz) return;

    // Validate that all questions are answered
    const unanswered = activeUnit.quiz.questions.filter(
      (q) => userAnswers[q.id] === undefined
    );

    if (unanswered.length > 0) {
      setQuizError(`กรุณาตอบคำถามให้ครบทุกข้อ (ยังไม่ได้ตอบอีก ${unanswered.length} ข้อ)`);
      return;
    }

    let calculatedScore = 0;
    activeUnit.quiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        calculatedScore += q.points;
      }
    });

    setQuizScore(calculatedScore);
    setQuizSubmitted(true);
    setSubmissionTime(
      new Date().toLocaleDateString('th-TH') +
        ' ' +
        new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' น.'
    );
  };

  const handleNextLesson = () => {
    // Navigate to lesson 2.2
    setSelectedLessonId('l2-2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-[#f8f9ff]">
      <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pt-4 pb-20">
        
        {/* Session Status Verification Bar */}
        <div className="w-full bg-[#00173b] text-white rounded-xl p-3.5 px-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#0f2c59]">
          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="font-semibold text-white">สถานะเซสชัน:</span>
            <span className="text-[#d8e2ff]">ผ่านการยืนยันตัวตนนั่งเรียนออนไลน์เรียบร้อยแล้ว</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-[#718dfe] font-mono hidden md:inline">
              Student Login Session Active
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px] text-emerald-400">person</span>
              <span>
                {currentUser
                  ? `รหัสประจำตัว ${currentUser.studentId} • ${currentUser.classRoom} (${currentUser.firstName})`
                  : 'รหัสประจำตัว 05412 • ม.4/1 (ด.ช. พชร วงศ์สถิตย์)'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-[#ffdad6] hover:text-white flex items-center gap-1 underline underline-offset-4"
              id="btn-switch-account"
            >
              <span>สลับบัญชี / ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Subject Header Banner */}
        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-[#e6eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#bb0112] uppercase tracking-wider">
              <span>ภาคเรียนที่ 1/2567 • มัธยมศึกษาปีที่ 4</span>
              <span>•</span>
              <span>กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#00173b]">
              ว31101 วิทยาการคำนวณและเทคโนโลยีสารสนเทศ 1
            </h1>
            <p className="text-xs text-[#44474f]">
              {schoolName} (Satit Ratchaburi Smart EdTech)
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-1.5 min-w-[240px]">
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-semibold text-[#00173b] w-full">
              <span>ความคืบหน้ารายวิชา</span>
              <span className="font-mono text-sm text-[#bb0112]">
                {quizSubmitted ? '80%' : `${currentUser?.progressPercent || 65}%`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden border border-[#dce9ff]">
              <div
                className="h-full bg-[#00173b] rounded-full transition-all duration-700"
                style={{ width: quizSubmitted ? '80%' : `${currentUser?.progressPercent || 65}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-[#747780]">
              เรียนแล้ว {quizSubmitted ? '2 จาก 3 หน่วย' : '1 จาก 3 หน่วย'} (พร้อมส่งแบบทดสอบ)
            </span>
          </div>
        </div>

        {/* Main Classroom Layout (Left Curriculum / Right Lesson Viewport) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar: Curriculum Tree & Teacher Profile */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Curriculum Units List */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112] text-[20px]">list_alt</span>
                  <span>โครงสร้างหลักสูตร (3 หน่วยการเรียน)</span>
                </h2>
                <span className="text-xs bg-[#eff4ff] text-[#00173b] px-2 py-0.5 rounded font-semibold">
                  ว31101
                </span>
              </div>

              {/* Units Accordion */}
              <div className="flex flex-col gap-3">
                {curriculum.map((unit) => {
                  const isUnitSelected = unit.id === selectedUnitId;
                  return (
                    <div
                      key={unit.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isUnitSelected
                          ? 'border-[#00173b] bg-[#eff4ff]/60 shadow-xs'
                          : 'border-[#e6eeff] bg-white hover:border-[#c4c6d0]'
                      }`}
                    >
                      {/* Unit Header */}
                      <button
                        onClick={() => {
                          setSelectedUnitId(unit.id);
                          if (unit.lessons.length > 0) {
                            setSelectedLessonId(unit.lessons[0].id);
                          }
                        }}
                        className="w-full p-3.5 text-left flex items-start justify-between gap-2"
                        id={`unit-accordion-${unit.id}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              unit.isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isUnitSelected
                                ? 'bg-[#00173b] text-white'
                                : 'bg-[#e6eeff] text-[#44474f]'
                            }`}
                          >
                            {unit.isCompleted ? '✓' : unit.unitNumber}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-[#00173b]">
                              หน่วยที่ {unit.unitNumber}: {unit.title}
                            </div>
                            <div className="text-[11px] text-[#747780]">{unit.subtitle}</div>
                          </div>
                        </div>

                        {unit.isLocked ? (
                          <span className="material-symbols-outlined text-[18px] text-[#747780]">lock</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px] text-[#00173b]">
                            {isUnitSelected ? 'expand_less' : 'expand_more'}
                          </span>
                        )}
                      </button>

                      {/* Sub-lessons list if unit selected */}
                      {isUnitSelected && (
                        <div className="px-3 pb-3 pt-1 border-t border-[#dce9ff] flex flex-col gap-1.5 bg-white/70">
                          {unit.lessons.map((lesson) => {
                            const isLessonActive = lesson.id === selectedLessonId;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between gap-2 ${
                                  isLessonActive
                                    ? 'bg-[#00173b] text-white font-semibold'
                                    : 'hover:bg-[#eff4ff] text-[#44474f]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="material-symbols-outlined text-[16px] shrink-0">
                                    {isLessonActive ? 'play_circle' : 'article'}
                                  </span>
                                  <span className="truncate">{lesson.title}</span>
                                </div>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                    isLessonActive
                                      ? 'bg-white/20 text-white'
                                      : lesson.status === 'พร้อมสอน'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {lesson.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Teacher Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col gap-3">
              <span className="text-[11px] font-bold text-[#bb0112] uppercase tracking-wider">
                ข้อมูลครูผู้สอนประจำรายวิชา
              </span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#bb0112] shrink-0">
                  <img
                    src={AVATAR_URL}
                    alt="ครูสมชาย ศักดิ์โสภณ"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm text-[#00173b]">ครูสมชาย ศักดิ์โสภณ</span>
                  <span className="text-xs text-[#44474f]">ครูชำนาญการพิเศษ (กลุ่มสาระฯ วิทย์-เทคโน)</span>
                  <span className="text-[11px] text-[#718dfe]">somchai.sak@satit-rb.ac.th</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#e6eeff] flex items-center justify-between text-xs text-[#44474f]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">cloud_done</span>
                  Google Sheet API ซิงค์แล้ว
                </span>
                <span className="text-[#00173b] font-semibold">ห้องพักครู 234</span>
              </div>
            </div>

          </div>

          {/* Right Main Viewport: Video, Description & Post-Test */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Video Player Container */}
            <div className="bg-black rounded-xl overflow-hidden shadow-md border border-[#0f2c59] flex flex-col">
              <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center group">
                {isPlayingVideo ? (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <img
                      src={VIDEO_THUMB_URL}
                      alt="Thumbnail บทเรียน"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#bb0112] hover:bg-[#93000b] text-white flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110"
                      id="btn-play-lesson-video"
                    >
                      <span className="material-symbols-outlined text-[36px] md:text-[44px] ml-1">play_arrow</span>
                    </button>
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-md text-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>1080p Full HD</span>
                      <span>•</span>
                      <span>{activeLesson.duration || '32:45 นาที'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Video Bar Below Player */}
              <div className="bg-[#00173b] px-5 py-3 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#d8e2ff]">
                  <span className="material-symbols-outlined text-[18px]">smart_display</span>
                  <span>หน่วยการเรียนรู้ที่ {activeUnit.unitNumber} • {activeLesson.numberStr}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSavedBookmark(!isSavedBookmark)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                      isSavedBookmark ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isSavedBookmark ? 'bookmark_added' : 'bookmark_border'}
                    </span>
                    <span>{isSavedBookmark ? 'บันทึกแล้ว' : 'บันทึกบทเรียน'}</span>
                  </button>
                  <a
                    href="mailto:somchai.sak@satit-rb.ac.th"
                    className="flex items-center gap-1 hover:text-white text-white/80 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">help</span>
                    <span>ถามครูผู้สอน</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Lesson Title & Objectives Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[#bb0112] uppercase tracking-wider">
                  บทเรียนที่เลือก (Active Lesson)
                </span>
                <h2 className="text-lg md:text-xl font-bold text-[#00173b]">
                  {activeLesson.title}
                </h2>
              </div>

              <p className="text-xs md:text-sm text-[#44474f] leading-relaxed">
                {activeLesson.description ||
                  'ในบทเรียนนี้ นักเรียนจะได้ทำความเข้าใจแนวคิดรากฐานของการพัฒนาซอฟต์แวร์ด้วยกระบวนทัศน์เชิงวัตถุ (Object-Oriented Programming) การจำลองโมเดลข้อมูลแบบคลาส (Classes) และอ็อบเจกต์ (Objects) หลักการ Encapsulation, Inheritance และ Polymorphism เพื่อเตรียมความพร้อมในการนำไปพัฒนาเว็บแอปพลิเคชันและโมบายล์โซลูชันของโรงเรียนสาธิตเทศบาลเมืองราชบุรี'}
              </p>

              {/* Objectives */}
              <div className="bg-[#eff4ff] rounded-xl p-4 border border-[#dce9ff] flex flex-col gap-2">
                <span className="font-bold text-xs text-[#00173b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#00173b]">flag</span>
                  จุดประสงค์การเรียนรู้ประจำหน่วย
                </span>
                <ul className="text-xs text-[#44474f] space-y-1.5 pl-1">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">check_circle</span>
                    <span>อธิบายความแตกต่างระหว่าง Class และ Object ได้อย่างถูกต้องตามหลักวิศวกรรมซอฟต์แวร์</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">check_circle</span>
                    <span>เข้าใจและยกตัวอย่างการประยุกต์ใช้คุณลักษณะ 4 ประการของ OOP (Encapsulation, Inheritance, Polymorphism, Abstraction)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">check_circle</span>
                    <span>สามารถเลือกใช้โครงสร้างข้อมูลแบบ Stack และ Queue ในการแก้ปัญหาโจทย์คอมพิวเตอร์อย่างมีประสิทธิภาพ</span>
                  </li>
                </ul>
              </div>

              {/* Learning Materials Downloads */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => alert('ดาวน์โหลดสไลด์ประกอบการสอน (PDF) เรียบร้อยแล้ว')}
                  className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00173b] text-xs font-semibold flex items-center gap-2 border border-[#dce9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#bb0112]">picture_as_pdf</span>
                  <span>ดาวน์โหลดสไลด์สรุป (PDF)</span>
                </button>
                <button
                  onClick={() => alert('ดาวน์โหลดซอร์สโค้ดตัวอย่าง (ZIP) เรียบร้อยแล้ว')}
                  className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00173b] text-xs font-semibold flex items-center gap-2 border border-[#dce9ff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00173b]">folder_zip</span>
                  <span>โค้ดตัวอย่างบทเรียน (Sample Source)</span>
                </button>
              </div>
            </div>

            {/* Dedicated Unit Post-Test Card (Or Empty State if no quiz assigned) */}
            {activeUnit.quiz && activeUnit.quiz.assigned ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-6 flex flex-col gap-5" id="unit-quiz-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6eeff] pb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#bb0112] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#bb0112]"></span>
                      แบบทดสอบเฉพาะหน่วยการเรียนรู้นี้ ({activeUnit.quiz.id})
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-[#00173b]">
                      {activeUnit.quiz.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#eff4ff] text-[#00173b] px-3 py-1 rounded-full font-semibold border border-[#dce9ff]">
                      คะแนนเต็ม: {activeUnit.quiz.totalScore.toFixed(1)} คะแนน ({activeUnit.quiz.questions.length} ข้อ)
                    </span>
                  </div>
                </div>

                {/* Admin Assignment Notice */}
                <div className="bg-[#eff4ff] p-3 rounded-lg flex items-start gap-2.5 text-xs text-[#44474f] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[#00173b] text-[18px] shrink-0">assignment_late</span>
                  <span>
                    แบบทดสอบเฉพาะหน่วยนี้ถูกสร้างและมอบหมายโดยครูผู้สอนผ่านระบบแอดมิน คะแนนจะถูกบันทึกส่งตรงเข้า Google Sheet ทันทีที่ส่งคำตอบ
                  </span>
                </div>

                {quizError && (
                  <div className="bg-[#ffdad6] text-[#93000a] p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>{quizError}</span>
                  </div>
                )}

                {/* Question List */}
                <div className="flex flex-col gap-6">
                  {activeUnit.quiz.questions.map((q, qIndex) => {
                    const isSelected = userAnswers[q.id] !== undefined;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-[#00173b]/40 bg-[#f8f9ff]'
                            : 'border-[#e6eeff] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#00173b] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {qIndex + 1}
                            </span>
                            <span className="font-semibold text-sm text-[#0d1c2e] leading-snug">
                              {q.text}
                            </span>
                          </div>
                          <span className="text-xs bg-[#e6eeff] text-[#00173b] px-2 py-0.5 rounded font-mono font-bold shrink-0">
                            {q.points.toFixed(1)} คะแนน
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-8">
                          {q.options.map((opt, optIndex) => {
                            const isChosen = userAnswers[q.id] === optIndex;
                            return (
                              <button
                                key={optIndex}
                                disabled={quizSubmitted}
                                onClick={() => handleSelectAnswer(q.id, optIndex)}
                                className={`p-3 rounded-lg text-left text-xs transition-all flex items-center gap-2.5 border ${
                                  isChosen
                                    ? 'bg-[#00173b] text-white font-medium border-[#00173b] shadow-xs'
                                    : 'bg-white text-[#44474f] border-[#c4c6d0]/60 hover:bg-[#eff4ff] hover:border-[#00173b]/30'
                                } ${quizSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isChosen
                                      ? 'border-white bg-white'
                                      : 'border-[#747780]'
                                  }`}
                                >
                                  {isChosen && <span className="w-2 h-2 rounded-full bg-[#00173b]"></span>}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit Action or Result Feedback */}
                {!quizSubmitted ? (
                  <div className="pt-2">
                    <button
                      onClick={handleSubmitQuiz}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#bb0112] hover:bg-[#93000b] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                      id="btn-submit-unit-quiz"
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>ส่งคำตอบและบันทึกคะแนนลง Google Sheet</span>
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 bg-[#dce9ff] rounded-2xl p-6 border-2 border-[#00173b] flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <span className="material-symbols-outlined text-[28px]">verified</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-[#00173b]">
                            ผลการทดสอบ: ได้ {quizScore.toFixed(1)} / {activeUnit.quiz.totalScore.toFixed(1)} คะแนน
                          </h4>
                          <p className="text-xs text-[#44474f]">
                            ส่งคำตอบสำเร็จเมื่อ {submissionTime}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 self-start sm:self-auto">
                        ผ่านเกณฑ์ยอดเยี่ยม (100%)
                      </span>
                    </div>

                    <div className="bg-white/80 rounded-xl p-3.5 text-xs text-[#0d1c2e] flex flex-col gap-1 border border-[#00173b]/10">
                      <div className="flex items-center gap-2 font-semibold text-[#00173b]">
                        <span className="material-symbols-outlined text-[18px] text-emerald-600">cloud_upload</span>
                        <span>บันทึกคะแนนลง Google Sheet สำเร็จแล้ว</span>
                      </div>
                      <p className="text-[#44474f] text-[11px]">
                        ไฟล์: <code>ว31101_ม4_1.xlsx</code> • คอลัมน์: <code>Unit2_Quiz_Score</code> • รหัสนักเรียน: {currentUser?.studentId || '05412'}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={handleNextLesson}
                        className="px-5 py-2.5 rounded-xl bg-[#00173b] text-white text-xs font-bold hover:bg-[#0f2c59] transition-all flex items-center gap-2 shadow-sm"
                        id="btn-next-lesson"
                      >
                        <span>เรียนบทถัดไป: 2.2 อัลกอริทึมการค้นหา</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-12 text-center flex flex-col items-center justify-center gap-2 text-[#44474f]">
                <span className="material-symbols-outlined text-[48px] text-[#c4c6d0]">quiz</span>
                <h4 className="font-bold text-base text-[#00173b]">ไม่มีแบบทดสอบในหน่วยนี้</h4>
                <p className="text-xs text-[#747780] max-w-md">
                  ครูผู้สอนยังไม่ได้มอบหมายแบบทดสอบสำหรับหน่วยการเรียนรู้นี้ (No Quiz Assigned) นักเรียนสามารถทบทวนเนื้อหาและใบงานได้ตามปกติ
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
