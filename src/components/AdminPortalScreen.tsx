import React, { useState } from 'react';
import { SCHOOL_LOGO_URL, VIDEO_THUMB_URL } from '../data/initialData';
import { Student, StudentScore, CurriculumUnit, GradeLevel } from '../types';

interface AdminPortalScreenProps {
  curriculum: CurriculumUnit[];
  setCurriculum: React.Dispatch<React.SetStateAction<CurriculumUnit[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  scores: StudentScore[];
  setScores: React.Dispatch<React.SetStateAction<StudentScore[]>>;
  gradeLevels: GradeLevel[];
  setGradeLevels: React.Dispatch<React.SetStateAction<GradeLevel[]>>;
  schoolName: string;
  setSchoolName: (name: string) => void;
  systemTitle: string;
  setSystemTitle: (title: string) => void;
  onNavigateHome: () => void;
  adminUser?: { email: string; name: string; role: string } | null;
  onLogoutAdmin: () => void;
}

export const AdminPortalScreen: React.FC<AdminPortalScreenProps> = ({
  curriculum,
  setCurriculum,
  students,
  setStudents,
  scores,
  setScores,
  gradeLevels,
  setGradeLevels,
  schoolName,
  setSchoolName,
  systemTitle,
  setSystemTitle,
  onNavigateHome,
  adminUser,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'scores' | 'registry'>('content');
  const [selectedUnitId, setSelectedUnitId] = useState('u2');
  const [selectedLessonId, setSelectedLessonId] = useState('l2-1');

  // Student password visibility states
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showAllPasswords, setShowAllPasswords] = useState(false);

  const toggleStudentPassword = (studentId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Edit Lesson state
  const activeUnit = curriculum.find((u) => u.id === selectedUnitId) || curriculum[0];
  const activeLesson = activeUnit.lessons.find((l) => l.id === selectedLessonId) || activeUnit.lessons[0];

  const [lessonTitle, setLessonTitle] = useState(activeLesson?.title || '');
  const [lessonVideoUrl, setLessonVideoUrl] = useState(activeLesson?.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lessonDesc, setLessonDesc] = useState(activeLesson?.description || '');
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [saveLessonToast, setSaveLessonToast] = useState(false);

  // New Question in Quiz Builder state
  const [newQText, setNewQText] = useState('');
  const [newQPoints, setNewQPoints] = useState(1.0);
  const [newQOpts, setNewQOpts] = useState(['', '', '', '']);
  const [newQCorrect, setNewQCorrect] = useState(0);

  // Modals state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [modalSchoolName, setModalSchoolName] = useState(schoolName);
  const [modalSystemTitle, setModalSystemTitle] = useState(systemTitle);

  const [showLevelsModal, setShowLevelsModal] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelTrack, setNewLevelTrack] = useState('');

  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitSubtitle, setNewUnitSubtitle] = useState('');

  // Tab 2 & 3 filters
  const [scoreSearch, setScoreSearch] = useState('');
  const [scoreClassFilter, setScoreClassFilter] = useState('all');
  const [registrySearch, setRegistrySearch] = useState('');

  // Handle lesson save
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === activeUnit.id) {
          return {
            ...u,
            lessons: u.lessons.map((l) =>
              l.id === activeLesson.id
                ? {
                    ...l,
                    title: lessonTitle,
                    videoUrl: lessonVideoUrl,
                    description: lessonDesc,
                  }
                : l
            ),
          };
        }
        return u;
      })
    );
    setSaveLessonToast(true);
    setTimeout(() => setSaveLessonToast(false), 2000);
  };

  // Adjust question points in quiz
  const handleAdjustPoints = (qId: string, delta: number) => {
    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === activeUnit.id && u.quiz) {
          return {
            ...u,
            quiz: {
              ...u.quiz,
              questions: u.quiz.questions.map((q) =>
                q.id === qId ? { ...q, points: Math.max(0.5, q.points + delta) } : q
              ),
            },
          };
        }
        return u;
      })
    );
  };

  // Add question to active unit quiz
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    const newQuestion = {
      id: 'q-' + Date.now(),
      text: newQText.trim(),
      points: Number(newQPoints),
      options: newQOpts.map((opt, i) => opt.trim() || `ตัวเลือกที่ ${i + 1}`),
      correctIndex: newQCorrect,
    };

    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === activeUnit.id) {
          const currentQuiz = u.quiz || {
            id: `QZ-${u.id}`,
            title: `แบบทดสอบหน่วยที่ ${u.unitNumber}`,
            assigned: true,
            totalScore: 0,
            questions: [],
          };
          return {
            ...u,
            quiz: {
              ...currentQuiz,
              assigned: true,
              totalScore: currentQuiz.totalScore + newQuestion.points,
              questions: [...currentQuiz.questions, newQuestion],
            },
          };
        }
        return u;
      })
    );

    // Reset form
    setNewQText('');
    setNewQOpts(['', '', '', '']);
    setNewQPoints(1.0);
    setNewQCorrect(0);
  };

  // Delete question from quiz
  const handleDeleteQuestion = (qId: string) => {
    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === activeUnit.id && u.quiz) {
          const filtered = u.quiz.questions.filter((q) => q.id !== qId);
          const newTotal = filtered.reduce((acc, q) => acc + q.points, 0);
          return {
            ...u,
            quiz: {
              ...u.quiz,
              questions: filtered,
              totalScore: newTotal,
            },
          };
        }
        return u;
      })
    );
  };

  // Add new Unit
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;

    const newUnit: CurriculumUnit = {
      id: 'u-' + Date.now(),
      unitNumber: curriculum.length + 1,
      title: newUnitTitle.trim(),
      subtitle: newUnitSubtitle.trim() || 'บทเรียนใหม่',
      lessonsCount: 1,
      lessons: [
        {
          id: 'l-' + Date.now(),
          numberStr: `${curriculum.length + 1}.1`,
          title: 'บทนำและเนื้อหาเริ่มต้น',
          status: 'ร่าง',
          duration: '15:00 นาที',
          description: 'รายละเอียดเนื้อหาบทเรียนใหม่',
        },
      ],
      quiz: {
        id: `QZ-U${curriculum.length + 1}`,
        title: `แบบทดสอบหน่วยที่ ${curriculum.length + 1}: ${newUnitTitle.trim()}`,
        assigned: true,
        totalScore: 0,
        questions: [],
      },
    };

    setCurriculum((prev) => [...prev, newUnit]);
    setSelectedUnitId(newUnit.id);
    setSelectedLessonId(newUnit.lessons[0].id);
    setShowNewUnitModal(false);
    setNewUnitTitle('');
    setNewUnitSubtitle('');
  };

  // Add new grade level
  const handleAddGradeLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLevelName.trim()) return;

    const newLvl: GradeLevel = {
      id: 'lvl-' + Date.now(),
      name: newLevelName.trim(),
      track: newLevelTrack.trim() || 'คลังบทเรียน 8 วิชา • ชีตนักเรียน 40 รายชื่อ',
      studentCount: 40,
      lessonCount: 8,
      category: 'late',
    };

    setGradeLevels((prev) => [...prev, newLvl]);
    setNewLevelName('');
    setNewLevelTrack('');
  };

  // Delete student row
  const handleDeleteStudent = (id: string) => {
    if (confirm('ต้องการลบข้อมูลนักเรียนรายนี้ออกจากระบบหรือไม่?')) {
      setStudents((prev) => prev.filter((s) => s.studentId !== id));
      setScores((prev) => prev.filter((sc) => sc.studentId !== id));
    }
  };

  // Filtered scores for Tab 2
  const filteredScores = scores.filter((sc) => {
    const matchSearch =
      !scoreSearch ||
      sc.firstName.includes(scoreSearch) ||
      sc.lastName.includes(scoreSearch) ||
      sc.studentId.includes(scoreSearch);
    const matchClass = scoreClassFilter === 'all' || sc.classRoom === scoreClassFilter;
    return matchSearch && matchClass;
  });

  // Filtered students for Tab 3
  const filteredStudents = students.filter((st) => {
    return (
      !registrySearch ||
      st.firstName.includes(registrySearch) ||
      st.lastName.includes(registrySearch) ||
      st.username.includes(registrySearch) ||
      st.classRoom.includes(registrySearch) ||
      st.studentId.includes(registrySearch)
    );
  });

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-[#f8f9ff]">
      <div className="flex flex-col w-full max-w-7xl mx-auto gap-6 pt-4 pb-20">
        
        {/* Top Header & Admin Auth Context */}
        <header className="w-full bg-white rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-[#e6eeff]">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              className="w-16 h-20 md:w-20 md:h-24 flex-shrink-0 flex items-center justify-center p-1 bg-white rounded-xl shadow-sm border border-[#dce9ff] cursor-pointer"
              onClick={onNavigateHome}
            >
              <img
                alt="ตราโรงเรียนสาธิตเทศบาลเมืองราชบุรี"
                className="w-full h-full object-contain filter drop-shadow-sm"
                src={SCHOOL_LOGO_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#bb0112] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#bb0112]"></span>
                  ADMIN & TEACHER CONTROL PANEL
                </span>
                <button
                  onClick={() => setShowTitleModal(true)}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#eff4ff] text-[#00173b] hover:bg-[#dce9ff] border border-[#dce9ff] flex items-center gap-1 font-semibold"
                  id="btn-edit-school-title"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>แก้ไขชื่อโรงเรียน/หัวข้อ</span>
                </button>
              </div>
              <h1 className="text-xl md:text-2xl text-[#00173b] font-bold leading-tight">
                {systemTitle}
              </h1>
              <p className="text-xs text-[#44474f]">{schoolName}</p>
            </div>
          </div>

          {/* Google Workspace Authenticated Banner */}
          <div className="flex items-center gap-3 bg-[#eff4ff] p-2.5 px-4 rounded-xl border border-[#dce9ff]">
            <div className="w-9 h-9 rounded-full bg-[#00173b] text-white flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00173b]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{adminUser?.email || 'admin.satit@gmail.com'}</span>
              </div>
              <span className="text-[11px] text-[#747780]">
                {adminUser?.name || 'Google Workspace Verified'} • ซิงค์เรียลไทม์
              </span>
            </div>
            <button
              onClick={onLogoutAdmin}
              className="p-1.5 rounded-lg text-[#bb0112] hover:bg-[#ffdad6] transition-colors ml-2"
              title="ออกจากระบบแอดมิน"
              id="btn-admin-logout"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </header>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6eeff] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#747780] font-medium block">หน่วยการเรียนรู้ทั้งหมด</span>
              <span className="text-2xl font-bold text-[#00173b] mt-1 block">{curriculum.length} หน่วย</span>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {curriculum.reduce((acc, u) => acc + u.lessons.length, 0)} บทเรียนย่อย
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#00173b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">menu_book</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6eeff] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#747780] font-medium block">นักเรียนลงทะเบียน</span>
              <span className="text-2xl font-bold text-[#00173b] mt-1 block">{students.length} คน</span>
              <span className="text-[11px] text-emerald-700 font-semibold">ซิงก์จาก 8 ห้องเรียน</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#00173b] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">groups</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6eeff] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#747780] font-medium block">คลังแบบทดสอบย่อย</span>
              <span className="text-2xl font-bold text-[#bb0112] mt-1 block">
                {curriculum.reduce((acc, u) => acc + (u.quiz ? u.quiz.questions.length : 0), 0)} ข้อ
              </span>
              <span className="text-[11px] text-[#44474f]">เกณฑ์ 60% ผ่าน</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#ffdad6] text-[#bb0112] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">quiz</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e6eeff] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#747780] font-medium block">สถานะคลังวิดีโอ YouTube</span>
              <span className="text-2xl font-bold text-[#00173b] mt-1 block">100%</span>
              <span className="text-[11px] text-emerald-700 font-semibold">พร้อมสตรีมทุกอุปกรณ์</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">video_library</span>
            </div>
          </div>
        </div>

        {/* 3 Main Segment Tabs */}
        <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-[#e6eeff] overflow-x-auto">
          <button
            onClick={() => setActiveTab('content')}
            id="admin-tab-content"
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-[#00173b] text-white shadow-sm'
                : 'text-[#44474f] hover:bg-[#eff4ff] hover:text-[#00173b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
            <span>1. จัดการบทเรียนและสื่อการสอน (Course & Content)</span>
          </button>
          <button
            onClick={() => setActiveTab('scores')}
            id="admin-tab-scores"
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'scores'
                ? 'bg-[#00173b] text-white shadow-sm'
                : 'text-[#44474f] hover:bg-[#eff4ff] hover:text-[#00173b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            <span>2. เช็คคะแนนและผลการเรียนนักเรียน (Gradebook)</span>
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            id="admin-tab-registry"
            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'registry'
                ? 'bg-[#00173b] text-white shadow-sm'
                : 'text-[#44474f] hover:bg-[#eff4ff] hover:text-[#00173b]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>3. ข้อมูลลงทะเบียนและจัดการระดับชั้น (Registry & Levels)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: COURSE & CONTENT MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Unit List & New Unit Button */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112] text-[20px]">folder</span>
                  <span>หน่วยการเรียนรู้ ({curriculum.length})</span>
                </h3>
                <button
                  onClick={() => setShowNewUnitModal(true)}
                  className="px-2.5 py-1 bg-[#bb0112] text-white text-xs font-semibold rounded-lg hover:bg-[#93000b] flex items-center gap-1 shadow-xs"
                  id="btn-add-unit-modal"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>เพิ่มหน่วยใหม่</span>
                </button>
              </div>

              {/* Units List */}
              <div className="flex flex-col gap-2.5">
                {curriculum.map((u) => {
                  const isUSelected = u.id === selectedUnitId;
                  return (
                    <div
                      key={u.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isUSelected
                          ? 'border-[#00173b] bg-[#eff4ff] shadow-xs'
                          : 'border-[#e6eeff] bg-white hover:border-[#c4c6d0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setSelectedUnitId(u.id);
                            if (u.lessons.length > 0) {
                              setSelectedLessonId(u.lessons[0].id);
                              setLessonTitle(u.lessons[0].title);
                              setLessonDesc(u.lessons[0].description || '');
                            }
                          }}
                          className="flex items-center gap-2 text-left flex-1"
                        >
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center ${
                              isUSelected ? 'bg-[#00173b] text-white' : 'bg-[#e6eeff] text-[#00173b]'
                            }`}
                          >
                            {u.unitNumber}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-[#00173b] line-clamp-1">{u.title}</div>
                            <div className="text-[10px] text-[#747780]">{u.lessons.length} บทเรียนย่อย</div>
                          </div>
                        </button>
                      </div>

                      {/* Sub-lessons */}
                      {isUSelected && (
                        <div className="mt-2.5 pt-2 border-t border-[#dce9ff] flex flex-col gap-1">
                          {u.lessons.map((ls) => {
                            const isLsActive = ls.id === selectedLessonId;
                            return (
                              <button
                                key={ls.id}
                                onClick={() => {
                                  setSelectedLessonId(ls.id);
                                  setLessonTitle(ls.title);
                                  setLessonDesc(ls.description || '');
                                  setLessonVideoUrl(ls.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                                }}
                                className={`p-2 rounded-lg text-left text-xs flex items-center justify-between transition-all ${
                                  isLsActive
                                    ? 'bg-[#00173b] text-white font-semibold'
                                    : 'hover:bg-white text-[#44474f]'
                                }`}
                              >
                                <span className="truncate">{ls.numberStr} {ls.title}</span>
                                <span className="text-[10px] px-1 rounded bg-white/20">{ls.status}</span>
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

            {/* Right Column: Lesson Editor & Unit Quiz Builder */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Card 1: Lesson Editor */}
              <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#e6eeff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bb0112] text-[22px]">video_settings</span>
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-[#00173b]">
                        แก้ไขเนื้อหาและสื่อวิดีโอ (Lesson Editor)
                      </h3>
                      <p className="text-xs text-[#747780]">
                        หน่วยที่ {activeUnit.unitNumber} • บทเรียน: {activeLesson?.numberStr}
                      </p>
                    </div>
                  </div>
                  {saveLessonToast && (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold animate-in fade-in">
                      ✓ บันทึกเรียบร้อย
                    </span>
                  )}
                </div>

                <form onSubmit={handleSaveLesson} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="admin-lesson-title">
                      ชื่อบทเรียน (Lesson Title)
                    </label>
                    <input
                      id="admin-lesson-title"
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-xs md:text-sm focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-9 flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="admin-lesson-video-url">
                        ลิงก์วิดีโอ YouTube (Embed / Watch URL)
                      </label>
                      <input
                        id="admin-lesson-video-url"
                        type="url"
                        value={lessonVideoUrl}
                        onChange={(e) => setLessonVideoUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-xs focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] transition-all"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="md:col-span-3 flex items-end">
                      <button
                        type="button"
                        onClick={() => setShowVideoPreview(!showVideoPreview)}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00173b] text-xs font-semibold flex items-center justify-center gap-1 border border-[#dce9ff] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>{showVideoPreview ? 'ซ่อนพรีวิว' : 'พรีวิววิดีโอ'}</span>
                      </button>
                    </div>
                  </div>

                  {showVideoPreview && (
                    <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#dce9ff] flex items-center gap-4">
                      <div className="w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-black">
                        <img
                          src={VIDEO_THUMB_URL}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col text-xs text-[#00173b]">
                        <span className="font-bold">ตรวจสอบสถานะวิดีโอ: พร้อมเผยแพร่</span>
                        <span className="text-[#44474f] text-[11px]">สตรีมมิ่งความละเอียด 1080p Full HD</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="admin-lesson-desc">
                        คำอธิบายรายละเอียดบทเรียนและใบงาน
                      </label>
                      <div className="flex items-center gap-1 text-[11px] text-[#747780]">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono font-bold">B</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono italic">I</span>
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">List</span>
                      </div>
                    </div>
                    <textarea
                      id="admin-lesson-desc"
                      rows={4}
                      value={lessonDesc}
                      onChange={(e) => setLessonDesc(e.target.value)}
                      className="w-full p-3 rounded-lg bg-[#eff4ff] text-[#0d1c2e] text-xs focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] transition-all leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#00173b] hover:bg-[#0f2c59] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                      id="btn-save-lesson"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>บันทึกการแก้ไขบทเรียน</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Unit Quiz Builder */}
              <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-[#e6eeff] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bb0112] text-[22px]">quiz</span>
                    <div>
                      <h3 className="font-bold text-sm md:text-base text-[#00173b]">
                        คลังข้อสอบและแบบทดสอบเฉพาะหน่วย (Unit Quiz Builder)
                      </h3>
                      <p className="text-xs text-[#747780]">
                        แบบทดสอบประจำหน่วยที่ {activeUnit.unitNumber} ({activeUnit.quiz?.questions.length || 0} ข้อ • รวม {activeUnit.quiz?.totalScore.toFixed(1) || 0} คะแนน)
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eff4ff] text-[#00173b] border border-[#dce9ff]">
                    Auto-Save to Sheets
                  </span>
                </div>

                {/* Existing Questions List in this Unit */}
                <div className="flex flex-col gap-3">
                  {activeUnit.quiz && activeUnit.quiz.questions.length > 0 ? (
                    activeUnit.quiz.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-[#e6eeff] bg-[#f8f9ff] flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#00173b] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-xs md:text-sm font-semibold text-[#0d1c2e]">{q.text}</span>
                          </div>
                          
                          {/* Point adjustment controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-mono font-bold bg-[#eff4ff] text-[#00173b] px-2 py-0.5 rounded border border-[#dce9ff]">
                              {q.points.toFixed(1)} คะแนน
                            </span>
                            <button
                              onClick={() => handleAdjustPoints(q.id, 0.5)}
                              className="w-6 h-6 rounded bg-white border border-[#c4c6d0] text-[10px] font-bold hover:bg-[#eff4ff]"
                              title="เพิ่ม 0.5 คะแนน"
                            >
                              +0.5
                            </button>
                            <button
                              onClick={() => handleAdjustPoints(q.id, -0.5)}
                              className="w-6 h-6 rounded bg-white border border-[#c4c6d0] text-[10px] font-bold hover:bg-[#eff4ff]"
                              title="ลด 0.5 คะแนน"
                            >
                              -0.5
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] ml-1"
                              title="ลบคำถามข้อนี้"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Options preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-7 text-xs">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg flex items-center gap-2 border ${
                                optIdx === q.correctIndex
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                                  : 'bg-white border-[#e6eeff] text-[#44474f]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {optIdx === q.correctIndex ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-[#747780] bg-[#eff4ff] rounded-xl border border-dashed border-[#c4c6d0]">
                      ยังไม่มีข้อสอบในหน่วยนี้ กรุณาร่างคำถามใหม่ด้านล่าง
                    </div>
                  )}
                </div>

                {/* Form to Draft New Question */}
                <div className="mt-2 p-5 rounded-xl border-2 border-dashed border-[#00173b]/30 bg-[#eff4ff]/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#00173b] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                      <span>ฟอร์มร่างคำถามใหม่ (Draft New Question)</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-semibold text-[#44474f]">คะแนนข้อนี้:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="10"
                        value={newQPoints}
                        onChange={(e) => setNewQPoints(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white rounded border border-[#c4c6d0] text-xs font-mono font-bold text-center"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="พิมพ์โจทย์คำถาม เช่น ความหมายของคีย์เวิร์ด public static void..."
                    className="w-full px-3 py-2 bg-white rounded-lg border border-[#c4c6d0] text-xs focus:ring-2 focus:ring-[#00173b] outline-none"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {newQOpts.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 bg-white p-1.5 px-3 rounded-lg border border-[#c4c6d0]">
                        <input
                          type="radio"
                          name="new-correct-opt"
                          checked={newQCorrect === oIdx}
                          onChange={() => setNewQCorrect(oIdx)}
                          className="cursor-pointer"
                          title="ทำเครื่องหมายข้อที่ถูกต้อง"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newQOpts];
                            updated[oIdx] = e.target.value;
                            setNewQOpts(updated);
                          }}
                          placeholder={`ตัวเลือกที่ ${oIdx + 1}`}
                          className="w-full text-xs outline-none bg-transparent"
                        />
                        {newQCorrect === oIdx && (
                          <span className="text-[10px] font-bold text-emerald-700 shrink-0">คำตอบที่ถูก</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-5 py-2 rounded-lg bg-[#bb0112] hover:bg-[#93000b] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      id="btn-add-question-to-quiz"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      <span>บันทึกข้อสอบ [Add to Unit]</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STUDENT SCORES & GRADEBOOK */}
        {/* ======================================================== */}
        {activeTab === 'scores' && (
          <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-6 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6eeff] pb-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#bb0112] uppercase tracking-wider">
                  สมุดบันทึกผลการเรียนดิจิทัล (DIGITAL GRADEBOOK)
                </span>
                <h3 className="text-lg font-bold text-[#00173b]">
                  คะแนนเก็บและการประเมินผลนักเรียนประจำภาคเรียน
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => alert('ทำการส่งข้อมูลคะแนนชุดล่าสุดเข้า Google Sheets เรียบร้อยแล้ว')}
                  className="px-3 py-1.5 rounded-lg bg-[#00173b] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0f2c59] shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
                  <span>ซิงก์ไป Google Sheet</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#00173b] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#dce9ff] border border-[#dce9ff]"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>พิมพ์รายงาน</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#747780] text-[18px]">search</span>
                <input
                  type="text"
                  value={scoreSearch}
                  onChange={(e) => setScoreSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสนักเรียน..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] border border-transparent focus:border-[#00173b] outline-none"
                />
              </div>

              <div className="md:col-span-4">
                <select
                  value={scoreClassFilter}
                  onChange={(e) => setScoreClassFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none cursor-pointer"
                >
                  <option value="all">ทุกระดับชั้น ({scores.length} คน)</option>
                  <option value="ม.3/1">มัธยมศึกษาปีที่ 3/1</option>
                  <option value="ม.3/2">มัธยมศึกษาปีที่ 3/2</option>
                  <option value="ม.2/1">มัธยมศึกษาปีที่ 2/1</option>
                  <option value="ป.6/1">ประถมศึกษาปีที่ 6/1</option>
                  <option value="ม.4/1">มัธยมศึกษาปีที่ 4/1</option>
                  <option value="ม.4/2">มัธยมศึกษาปีที่ 4/2</option>
                  <option value="ม.4/3">มัธยมศึกษาปีที่ 4/3</option>
                </select>
              </div>
            </div>

            {/* Scores Table */}
            <div className="overflow-x-auto border border-[#e6eeff] rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#00173b] font-bold border-b border-[#dce9ff]">
                    <th className="py-3 px-3 w-14 text-center">เลขที่</th>
                    <th className="py-3 px-3">รหัสนักเรียน</th>
                    <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                    <th className="py-3 px-3 text-center">ระดับชั้น</th>
                    <th className="py-3 px-3 text-right">หน่วย 1 (15)</th>
                    <th className="py-3 px-3 text-right">หน่วย 2 (15)</th>
                    <th className="py-3 px-3 text-right">สอบย่อย (20)</th>
                    <th className="py-3 px-3 text-right font-bold">รวม (50)</th>
                    <th className="py-3 px-3 text-center">สถานะ</th>
                    <th className="py-3 px-3 text-center w-20">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eeff]">
                  {filteredScores.map((sc, i) => (
                    <tr key={sc.studentId + i} className="hover:bg-[#f8f9ff]">
                      <td className="py-2.5 px-3 text-center font-mono">{sc.studentNo}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#00173b]">{sc.studentId}</td>
                      <td className="py-2.5 px-3 font-medium">{sc.firstName} {sc.lastName}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#00173b] font-semibold">
                          {sc.classRoom}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{sc.unit1Score.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{sc.unit2Score.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{sc.quizScore.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#00173b]">{sc.totalScore.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            sc.status.includes('ดีเยี่ยม')
                              ? 'bg-emerald-100 text-emerald-800'
                              : sc.status.includes('ซ่อม') || sc.status.includes('แก้ตัว')
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            const newScore = prompt(`กรอกคะแนนสอบย่อยใหม่สำหรับ ${sc.firstName}:`, sc.quizScore.toString());
                            if (newScore !== null && !isNaN(Number(newScore))) {
                              const parsed = Number(newScore);
                              setScores((prev) =>
                                prev.map((item) =>
                                  item.studentId === sc.studentId
                                    ? {
                                        ...item,
                                        quizScore: parsed,
                                        totalScore: item.unit1Score + item.unit2Score + parsed,
                                      }
                                    : item
                                )
                              );
                            }
                          }}
                          className="p-1 text-[#00173b] hover:bg-[#eff4ff] rounded"
                          title="แก้ไขคะแนน"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: STUDENT REGISTRY & GRADE LEVELS */}
        {/* ======================================================== */}
        {activeTab === 'registry' && (
          <div className="flex flex-col gap-6">
            
            {/* Google Sheets Cloud Connector Card */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">table_view</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#00173b]">Google Sheets Cloud Connector (2-Way Active)</h4>
                  <p className="text-xs text-[#44474f]">
                    เชื่อมโยงตารางรายชื่อนักเรียนและเกรดเฉลี่ย ID: <code>1A2bC3dE4f_Satit_Master_2567</code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLevelsModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#eff4ff] text-[#00173b] text-xs font-bold hover:bg-[#dce9ff] border border-[#dce9ff] flex items-center gap-1"
                  id="btn-manage-levels"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>จัดการระดับชั้น (Manage Grade Levels)</span>
                </button>
              </div>
            </div>

            {/* Grade Levels Overview Pills */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#bb0112] uppercase tracking-wider">
                ระดับชั้นที่เปิดใช้งานในระบบ ({gradeLevels.length} ระดับชั้น)
              </span>
              <div className="flex flex-wrap gap-2">
                {gradeLevels.map((lvl) => (
                  <div
                    key={lvl.id}
                    className="p-2.5 px-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-2 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-[#00173b]">{lvl.name}</span>
                    <span className="text-[#747780]">({lvl.studentCount} คน)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl shadow-sm border border-[#e6eeff] p-5 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-bold text-sm text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112] text-[20px]">badge</span>
                  <span>ทะเบียนนักเรียนที่ลงทะเบียนในระบบ ({filteredStudents.length} คน)</span>
                </h4>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowAllPasswords(!showAllPasswords)}
                    className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#00173b] hover:bg-[#dce9ff] border border-[#dce9ff] text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    title="สลับการแสดงรหัสผ่านของนักเรียนทุกคน"
                    id="btn-toggle-all-passwords"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#bb0112]">
                      {showAllPasswords ? 'visibility_off' : 'visibility'}
                    </span>
                    <span>{showAllPasswords ? 'ซ่อน Password ทั้งหมด' : 'แสดง Password ทั้งหมด'}</span>
                  </button>
                  <div className="relative flex items-center w-full sm:w-64">
                    <span className="material-symbols-outlined absolute left-3 text-[#747780] text-[18px]">search</span>
                    <input
                      type="text"
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      placeholder="ค้นหาชื่อ, Username หรือรหัส..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#e6eeff] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#eff4ff] text-[#00173b] font-bold border-b border-[#dce9ff]">
                      <th className="py-3 px-3">รหัสนักเรียน</th>
                      <th className="py-3 px-3">ชื่อ - นามสกุล</th>
                      <th className="py-3 px-3">ระดับชั้น</th>
                      <th className="py-3 px-3">เลขที่</th>
                      <th className="py-3 px-3">Username</th>
                      <th className="py-3 px-3 text-center bg-[#f2f6ff]">รหัสผ่าน (Password)</th>
                      <th className="py-3 px-3">วันที่ลงทะเบียน</th>
                      <th className="py-3 px-3 text-center">ความคืบหน้า</th>
                      <th className="py-3 px-3 text-center w-16">ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6eeff]">
                    {filteredStudents.map((st) => (
                      <tr key={st.studentId} className="hover:bg-[#f8f9ff]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00173b]">{st.studentId}</td>
                        <td className="py-2.5 px-3 font-medium">{st.firstName} {st.lastName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#eff4ff] font-semibold text-[#00173b]">
                            {st.classRoom}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{st.number}</td>
                        <td className="py-2.5 px-3 font-mono text-[#747780]">{st.username}</td>
                        <td className="py-2.5 px-3 text-center bg-[#f8faff]">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-xs font-mono font-bold text-[#00173b]">
                            <span className="material-symbols-outlined text-[14px] text-[#bb0112]">key</span>
                            <span className="tracking-wider">
                              {showAllPasswords || showPasswords[st.studentId]
                                ? (st.password || '123456')
                                : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleStudentPassword(st.studentId)}
                              className="text-[#747780] hover:text-[#00173b] p-0.5 rounded transition-colors"
                              title={showAllPasswords || showPasswords[st.studentId] ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                {showAllPasswords || showPasswords[st.studentId] ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const p = st.password || '123456';
                                navigator.clipboard?.writeText(p);
                                alert(`คัดลอกรหัสผ่าน ${p} ของ ${st.firstName} ${st.lastName} แล้ว`);
                              }}
                              className="text-[#747780] hover:text-[#00173b] p-0.5 rounded transition-colors"
                              title="คัดลอกรหัสผ่าน"
                            >
                              <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#747780]">{st.registeredAt || '12 ต.ค. 2025'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-[#00173b]">
                            {st.progressPercent || 0}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteStudent(st.studentId)}
                            className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6]"
                            title="ลบนักเรียน"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* MODALS */}
        {/* ======================================================== */}

        {/* MODAL 1: EDIT SCHOOL NAME & TITLE */}
        {showTitleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#bb0112] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112]">school</span>
                  <span>แก้ไขชื่อโรงเรียนและหัวข้อระบบ</span>
                </h3>
                <button onClick={() => setShowTitleModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-school-name">
                    ชื่อสถานศึกษา
                  </label>
                  <input
                    id="modal-school-name"
                    type="text"
                    value={modalSchoolName}
                    onChange={(e) => setModalSchoolName(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-system-title">
                    หัวข้อระบบบริหารวิชาการ
                  </label>
                  <input
                    id="modal-system-title"
                    type="text"
                    value={modalSystemTitle}
                    onChange={(e) => setModalSystemTitle(e.target.value)}
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowTitleModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474f] hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => {
                    setSchoolName(modalSchoolName);
                    setSystemTitle(modalSystemTitle);
                    setShowTitleModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#00173b] text-white text-xs font-bold hover:bg-[#0f2c59]"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: MANAGE GRADE LEVELS */}
        {showLevelsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-t-4 border-[#00173b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00173b]">tune</span>
                  <span>จัดการระดับชั้นเรียน (Grade Levels Management)</span>
                </h3>
                <button onClick={() => setShowLevelsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Add Level Form */}
              <form onSubmit={handleAddGradeLevel} className="p-3 bg-[#eff4ff] rounded-xl flex flex-col gap-2">
                <span className="text-xs font-bold text-[#00173b]">+ เพิ่มระดับชั้นใหม่</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                    placeholder="เช่น มัธยมศึกษาปีที่ 4/4"
                    className="px-3 py-1.5 bg-white rounded text-xs outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newLevelTrack}
                    onChange={(e) => setNewLevelTrack(e.target.value)}
                    placeholder="แผนการเรียน / รายวิชา"
                    className="px-3 py-1.5 bg-white rounded text-xs outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#00173b] text-white text-xs font-semibold rounded hover:bg-[#0f2c59]"
                  >
                    เพิ่มห้องเรียน
                  </button>
                </div>
              </form>

              {/* Existing Levels */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {gradeLevels.map((lvl) => (
                  <div key={lvl.id} className="p-2.5 rounded-lg border border-[#e6eeff] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#00173b]">{lvl.name}</div>
                      <div className="text-[11px] text-[#747780]">{lvl.track}</div>
                    </div>
                    <button
                      onClick={() => setGradeLevels((prev) => prev.filter((l) => l.id !== lvl.id))}
                      className="text-[#ba1a1a] p-1 hover:bg-[#ffdad6] rounded"
                      title="ลบระดับชั้น"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowLevelsModal(false)}
                  className="px-4 py-2 bg-[#00173b] text-white rounded-lg text-xs font-semibold"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD NEW UNIT */}
        {showNewUnitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#bb0112] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#bb0112]">add_box</span>
                  <span>เพิ่มหน่วยการเรียนรู้ใหม่</span>
                </h3>
                <button onClick={() => setShowNewUnitModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateUnit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-title">
                    ชื่อหน่วยการเรียนรู้ *
                  </label>
                  <input
                    id="modal-unit-title"
                    type="text"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    placeholder="เช่น ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-subtitle">
                    คำอธิบายสาระสำคัญย่อ
                  </label>
                  <input
                    id="modal-unit-subtitle"
                    type="text"
                    value={newUnitSubtitle}
                    onChange={(e) => setNewUnitSubtitle(e.target.value)}
                    placeholder="เช่น การประยุกต์ใช้โมเดล AI ในชีวิตประจำวัน"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewUnitModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474f] hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#bb0112] text-white text-xs font-bold hover:bg-[#93000b]"
                  >
                    สร้างหน่วยการเรียนรู้
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
