import React, { useState, useEffect, useRef } from 'react';
import { SCHOOL_LOGO_URL, VIDEO_THUMB_URL, initialContactInfo } from '../data/initialData';
import { Student, StudentScore, CurriculumUnit, GradeLevel, SubLesson, ContactInfo } from '../types';
import { EditContactModal } from './EditContactModal';
import { ConfirmDialogModal, ConfirmDialogState } from './ConfirmDialogModal';
import { ReportCardModal } from './ReportCardModal';
import { EditScoreModal } from './EditScoreModal';
import { downloadElementAsPdf } from '../utils/pdfExport';

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
  onResetAccountData?: () => void;
  contactInfo?: ContactInfo;
  setContactInfo?: (contact: ContactInfo) => void;
  onDeleteStudent?: (studentId: string) => void;
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
  onResetAccountData,
  contactInfo = initialContactInfo,
  setContactInfo,
  onDeleteStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'scores' | 'registry'>('content');
  const [selectedUnitId, setSelectedUnitId] = useState('u2');
  const [selectedLessonId, setSelectedLessonId] = useState('l2-1');

  // Modals and notifications state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedScoreForReport, setSelectedScoreForReport] = useState<StudentScore | null>(null);
  const [selectedScoreForEdit, setSelectedScoreForEdit] = useState<StudentScore | null>(null);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

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
  const fallbackLesson: SubLesson = {
    id: 'temp_lesson',
    numberStr: '1.1',
    title: 'บทเรียนย่อย',
    status: 'พร้อมสอน',
    description: '',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  };

  const activeUnit = curriculum.find((u) => u.id === selectedUnitId) || curriculum[0] || {
    id: 'temp_unit',
    unitNumber: 1,
    title: 'หน่วยการเรียนรู้',
    subtitle: '',
    lessonsCount: 0,
    lessons: [],
  };
  const activeLesson =
    activeUnit?.lessons?.find((l) => l.id === selectedLessonId) ||
    activeUnit?.lessons?.[0] ||
    fallbackLesson;

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

  // Edit Grade Level State
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [editLevelName, setEditLevelName] = useState('');
  const [editLevelTrack, setEditLevelTrack] = useState('');
  const [editLevelCount, setEditLevelCount] = useState<number>(40);

  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState<number>(curriculum.length + 1);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitSubtitle, setNewUnitSubtitle] = useState('');
  const [newUnitFirstLessonTitle, setNewUnitFirstLessonTitle] = useState('บทนำและเนื้อหาเริ่มต้น');

  // Edit Unit State
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editUnitNumber, setEditUnitNumber] = useState<number>(1);
  const [editUnitTitle, setEditUnitTitle] = useState('');
  const [editUnitSubtitle, setEditUnitSubtitle] = useState('');

  // Add Sub-lesson State
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('20:00 นาที');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

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

    const assignedNumber = Number(newUnitNumber) || curriculum.length + 1;
    const newUnit: CurriculumUnit = {
      id: 'u-' + Date.now(),
      unitNumber: assignedNumber,
      title: newUnitTitle.trim(),
      subtitle: newUnitSubtitle.trim() || 'บทเรียนใหม่',
      lessonsCount: 1,
      lessons: [
        {
          id: 'l-' + Date.now(),
          numberStr: `${assignedNumber}.1`,
          title: newUnitFirstLessonTitle.trim() || 'บทนำและเนื้อหาเริ่มต้น',
          status: 'พร้อมสอน',
          duration: '15:00 นาที',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          description: 'รายละเอียดเนื้อหาและแนวคิดพื้นฐานของหน่วยการเรียนรู้นี้',
        },
      ],
      quiz: {
        id: `QZ-U${assignedNumber}`,
        title: `แบบทดสอบหน่วยที่ ${assignedNumber}: ${newUnitTitle.trim()}`,
        assigned: true,
        totalScore: 0,
        questions: [],
      },
    };

    setCurriculum((prev) => [...prev, newUnit]);
    setSelectedUnitId(newUnit.id);
    setSelectedLessonId(newUnit.lessons[0].id);
    setLessonTitle(newUnit.lessons[0].title);
    setLessonDesc(newUnit.lessons[0].description || '');
    setLessonVideoUrl(newUnit.lessons[0].videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setShowNewUnitModal(false);
    setNewUnitTitle('');
    setNewUnitSubtitle('');
    setNewUnitNumber(curriculum.length + 2);
  };

  // Open Edit Unit Modal
  const handleOpenEditUnit = (unit: CurriculumUnit) => {
    setEditingUnitId(unit.id);
    setEditUnitNumber(unit.unitNumber);
    setEditUnitTitle(unit.title);
    setEditUnitSubtitle(unit.subtitle || '');
    setShowEditUnitModal(true);
  };

  // Save Edit Unit
  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnitId || !editUnitTitle.trim()) return;

    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === editingUnitId) {
          const updatedNumber = Number(editUnitNumber) || u.unitNumber;
          return {
            ...u,
            unitNumber: updatedNumber,
            title: editUnitTitle.trim(),
            subtitle: editUnitSubtitle.trim(),
            lessons: u.lessons.map((ls, idx) => ({
              ...ls,
              numberStr: `${updatedNumber}.${idx + 1}`,
            })),
            quiz: u.quiz
              ? {
                  ...u.quiz,
                  title: `แบบทดสอบหน่วยที่ ${updatedNumber}: ${editUnitTitle.trim()}`,
                }
              : undefined,
          };
        }
        return u;
      })
    );

    setShowEditUnitModal(false);
    setEditingUnitId(null);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string, unitTitle: string) => {
    if (curriculum.length <= 1) {
      setConfirmDialog({
        isOpen: true,
        title: 'ไม่สามารถลบหน่วยการเรียนรู้ได้',
        message: 'ระบบต้องมีหน่วยการเรียนรู้อย่างน้อย 1 หน่วยสำหรับจัดการเรียนการสอน',
        confirmText: 'รับทราบ',
        isDanger: false,
        onConfirm: () => {},
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบหน่วยการเรียนรู้',
      message: `คุณต้องการลบหน่วยการเรียนรู้ "${unitTitle}" พร้อมบทเรียนย่อยและแบบทดสอบทั้งหมดหรือไม่?\n\n(การดำเนินการนี้จะลบข้อมูลออกจากระบบทันที)`,
      confirmText: 'ลบหน่วยการเรียนรู้',
      isDanger: true,
      onConfirm: () => {
        const remaining = curriculum.filter((u) => u.id !== unitId);
        const renumbered = remaining.map((u, idx) => ({
          ...u,
          unitNumber: idx + 1,
          lessons: u.lessons.map((ls, lIdx) => ({
            ...ls,
            numberStr: `${idx + 1}.${lIdx + 1}`,
          })),
        }));

        setCurriculum(renumbered);

        if (selectedUnitId === unitId && renumbered.length > 0) {
          setSelectedUnitId(renumbered[0].id);
          if (renumbered[0].lessons.length > 0) {
            setSelectedLessonId(renumbered[0].lessons[0].id);
            setLessonTitle(renumbered[0].lessons[0].title);
            setLessonDesc(renumbered[0].lessons[0].description || '');
            setLessonVideoUrl(renumbered[0].lessons[0].videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
          }
        }
        setToastMsg(`ลบหน่วยการเรียนรู้ "${unitTitle}" เรียบร้อยแล้ว`);
      },
    });
  };

  // Add Sub-Lesson
  const handleSaveAddSubLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const nextIndex = (activeUnit.lessons?.length || 0) + 1;
    const newLesson: SubLesson = {
      id: 'l-' + Date.now(),
      numberStr: `${activeUnit.unitNumber}.${nextIndex}`,
      title: newLessonTitle.trim(),
      status: 'พร้อมสอน',
      duration: newLessonDuration.trim() || '20:00 นาที',
      videoUrl: newLessonVideoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'เนื้อหาและกิจกรรมการเรียนรู้สำหรับบทเรียนนี้',
    };

    setCurriculum((prev) =>
      prev.map((u) => {
        if (u.id === activeUnit.id) {
          return {
            ...u,
            lessonsCount: (u.lessons?.length || 0) + 1,
            lessons: [...(u.lessons || []), newLesson],
          };
        }
        return u;
      })
    );

    setSelectedLessonId(newLesson.id);
    setLessonTitle(newLesson.title);
    setLessonDesc(newLesson.description);
    setLessonVideoUrl(newLesson.videoUrl);
    setShowAddLessonModal(false);
    setNewLessonTitle('');
    setToastMsg(`เพิ่มบทเรียน "${newLesson.title}" เรียบร้อยแล้ว`);
  };

  // Delete Sub-Lesson
  const handleDeleteSubLesson = (unitId: string, lessonId: string, lessonTitleStr: string) => {
    const targetUnit = curriculum.find((u) => u.id === unitId);
    if (!targetUnit || targetUnit.lessons.length <= 1) {
      setConfirmDialog({
        isOpen: true,
        title: 'ไม่สามารถลบบทเรียนย่อยได้',
        message: 'แต่ละหน่วยการเรียนรู้ต้องมีบทเรียนย่อยอย่างน้อย 1 บทเรียน',
        confirmText: 'รับทราบ',
        isDanger: false,
        onConfirm: () => {},
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบบทเรียนย่อย',
      message: `คุณต้องการลบบทเรียนย่อย "${lessonTitleStr}" หรือไม่?`,
      confirmText: 'ลบบทเรียน',
      isDanger: true,
      onConfirm: () => {
        setCurriculum((prev) =>
          prev.map((u) => {
            if (u.id === unitId) {
              const filtered = u.lessons.filter((l) => l.id !== lessonId);
              return {
                ...u,
                lessonsCount: filtered.length,
                lessons: filtered.map((l, idx) => ({
                  ...l,
                  numberStr: `${u.unitNumber}.${idx + 1}`,
                })),
              };
            }
            return u;
          })
        );

        if (selectedLessonId === lessonId) {
          const remainingLessons = targetUnit.lessons.filter((l) => l.id !== lessonId);
          if (remainingLessons.length > 0) {
            setSelectedLessonId(remainingLessons[0].id);
            setLessonTitle(remainingLessons[0].title);
            setLessonDesc(remainingLessons[0].description || '');
            setLessonVideoUrl(remainingLessons[0].videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
          }
        }
        setToastMsg(`ลบบทเรียนย่อย "${lessonTitleStr}" เรียบร้อยแล้ว`);
      },
    });
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
    setToastMsg(`เพิ่มระดับชั้น "${newLvl.name}" เรียบร้อยแล้ว`);
  };

  // Start editing an existing grade level
  const handleStartEditLevel = (lvl: GradeLevel) => {
    setEditingLevelId(lvl.id);
    setEditLevelName(lvl.name);
    setEditLevelTrack(lvl.track);
    setEditLevelCount(lvl.studentCount || 40);
  };

  // Save edited grade level without deleting
  const handleSaveEditLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevelId || !editLevelName.trim()) return;

    setGradeLevels((prev) =>
      prev.map((l) =>
        l.id === editingLevelId
          ? {
              ...l,
              name: editLevelName.trim(),
              track: editLevelTrack.trim() || l.track,
              studentCount: Number(editLevelCount) || l.studentCount,
            }
          : l
      )
    );
    setToastMsg(`บันทึกการแก้ไขระดับชั้น "${editLevelName.trim()}" เรียบร้อยแล้ว`);
    setEditingLevelId(null);
  };

  const handleCancelEditLevel = () => {
    setEditingLevelId(null);
  };

  // Delete grade level with confirmation
  const handleDeleteGradeLevel = (lvlId: string, lvlName: string) => {
    if (gradeLevels.length <= 1) {
      setConfirmDialog({
        isOpen: true,
        title: 'ไม่สามารถลบระดับชั้นได้',
        message: 'ต้องมีระดับชั้นเรียนอย่างน้อย 1 ระดับชั้นในระบบ',
        confirmText: 'รับทราบ',
        isDanger: false,
        onConfirm: () => {},
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบระดับชั้น',
      message: `คุณต้องการลบระดับชั้น "${lvlName}" หรือไม่?\n\n(การดำเนินการนี้จะไม่ลบนักเรียน แต่จะนำระดับชั้นออกจากตัวเลือก)`,
      confirmText: 'ลบระดับชั้น',
      isDanger: true,
      onConfirm: () => {
        setGradeLevels((prev) => prev.filter((l) => l.id !== lvlId));
        setToastMsg(`ลบระดับชั้น "${lvlName}" เรียบร้อยแล้ว`);
      },
    });
  };

  // Delete student row with in-app confirmation dialog
  const handleDeleteStudent = (id: string, name?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบข้อมูลนักเรียนและประวัติคะแนน',
      message: `คุณต้องการลบข้อมูลของ "${name || id}" ออกจากระบบลงทะเบียนและตารางคะแนนทั้งหมดหรือไม่?\n\n(ระบบจะลบข้อมูลบัญชีและคะแนนสอบทั้งหมดของนักเรียนคนนี้ออกจากระบบอย่างถาวร)`,
      confirmText: 'ลบข้อมูลและคะแนนนักเรียน',
      isDanger: true,
      onConfirm: () => {
        if (onDeleteStudent) {
          onDeleteStudent(id);
        } else {
          setStudents((prev) => prev.filter((s) => s.studentId !== id));
          setScores((prev) => prev.filter((sc) => sc.studentId !== id));
        }
        setToastMsg(`ลบข้อมูลนักเรียน "${name || id}" และคะแนนที่เกี่ยวข้องเรียบร้อยแล้ว`);
      },
    });
  };

  // Filtered scores for Tab 2
  const adminScoresTableRef = useRef<HTMLDivElement>(null);
  const [isExportingAdminPdf, setIsExportingAdminPdf] = useState(false);

  // Export scores for Google Sheets (.csv)
  const handleExportGoogleSheetCsv = () => {
    const headers = [
      'เลขที่',
      'รหัสนักเรียน',
      'ชื่อ',
      'นามสกุล',
      'ระดับชั้น',
      'วิชา',
      'หน่วยที่ 1 (15 คะแนน)',
      'หน่วยที่ 2 (15 คะแนน)',
      'สอบย่อย (20 คะแนน)',
      'รวม (50 คะแนน)',
      'ร้อยละ',
      'สถานะการประเมิน',
    ];

    const rows = filteredScores.map((sc) => {
      const percentage = ((sc.totalScore / 50) * 100).toFixed(1);
      return [
        sc.studentNo,
        sc.studentId,
        sc.firstName,
        sc.lastName,
        sc.classRoom,
        sc.subject,
        sc.unit1Score.toFixed(1),
        sc.unit2Score.toFixed(1),
        sc.quizScore.toFixed(1),
        sc.totalScore.toFixed(1),
        `${percentage}%`,
        sc.status,
      ];
    });

    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    link.setAttribute('download', `ตารางคะแนน_${scoreClassFilter === 'all' ? 'ทุกชั้น' : scoreClassFilter}_${dateStr}_GoogleSheets.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToastMsg('ดาวน์โหลดไฟล์คะแนนสำหรับ Google Sheets เรียบร้อยแล้ว');
  };

  // Export scores table as PDF
  const handleExportAdminPdf = async () => {
    if (!adminScoresTableRef.current || isExportingAdminPdf) return;
    setIsExportingAdminPdf(true);
    try {
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const filename = `ตารางคะแนน_${scoreClassFilter === 'all' ? 'ทุกชั้น' : scoreClassFilter}_${dateStr}.pdf`;
      const success = await downloadElementAsPdf(adminScoresTableRef.current, {
        filename,
        orientation: 'landscape',
        scale: 2,
      });
      if (success) {
        setToastMsg('ดาวน์โหลดตารางคะแนนเป็นไฟล์ PDF เรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Admin PDF export error:', err);
    } finally {
      setIsExportingAdminPdf(false);
    }
  };

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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#bb0112] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#bb0112]"></span>
                  ADMIN & TEACHER CONTROL PANEL
                </span>
                <button
                  onClick={() => setShowTitleModal(true)}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#eff4ff] text-[#00173b] hover:bg-[#dce9ff] border border-[#dce9ff] flex items-center gap-1 font-semibold transition-colors"
                  id="btn-edit-school-title"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>แก้ไขชื่อโรงเรียน/หัวข้อ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#eff4ff] text-[#bb0112] hover:bg-[#ffdad6] border border-[#dce9ff] flex items-center gap-1 font-semibold transition-colors"
                  id="btn-admin-edit-contact"
                  title="แก้ไขข้อมูลติดต่อครูและแสดงในหน้าแรก"
                >
                  <span className="material-symbols-outlined text-[14px]">support_agent</span>
                  <span>แก้ไขข้อมูลติดต่อครู</span>
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
                {adminUser?.name || 'Google Workspace Verified'} • ซิงค์แยกตามอีเมล
              </span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {onResetAccountData && (
                <button
                  type="button"
                  onClick={onResetAccountData}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                  title="รีเซ็ตข้อมูลของบัญชีนี้กลับเป็นค่าเริ่มต้น"
                  id="btn-admin-reset-account"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                </button>
              )}
              <button
                onClick={onLogoutAdmin}
                className="p-1.5 rounded-lg text-[#bb0112] hover:bg-[#ffdad6] transition-colors"
                title="ออกจากระบบแอดมิน"
                id="btn-admin-logout"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
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
                              setLessonVideoUrl(u.lessons[0].videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                            }
                          }}
                          className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                        >
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs ${
                              isUSelected ? 'bg-[#00173b] text-white' : 'bg-[#e6eeff] text-[#00173b]'
                            }`}
                          >
                            {u.unitNumber}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-[#00173b] truncate" title={u.title}>
                              {u.title}
                            </div>
                            <div className="text-[11px] text-[#747780] truncate">
                              {u.subtitle || `${u.lessons.length} บทเรียนย่อย`}
                            </div>
                          </div>
                        </button>

                        {/* Unit Management Buttons (Edit & Delete) */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditUnit(u);
                            }}
                            className="p-1 rounded-md text-[#00173b] hover:bg-[#dce9ff] transition-colors"
                            title="แก้ไขข้อมูลหน่วยการเรียนรู้นี้"
                            id={`btn-edit-unit-${u.id}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUnit(u.id, u.title);
                            }}
                            className="p-1 rounded-md text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                            title="ลบหน่วยการเรียนรู้นี้"
                            id={`btn-delete-unit-${u.id}`}
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Sub-lessons */}
                      {isUSelected && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#dce9ff] flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#44474f] px-1">
                            <span>บทเรียนย่อยในหน่วยนี้ ({u.lessons.length})</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewLessonTitle(`บทเรียนที่ ${u.unitNumber}.${u.lessons.length + 1}`);
                                setShowAddLessonModal(true);
                              }}
                              className="text-[#bb0112] hover:text-[#93000b] hover:underline flex items-center gap-0.5"
                              id="btn-add-sublesson"
                            >
                              <span className="material-symbols-outlined text-[14px]">add_circle</span>
                              <span>เพิ่มบทเรียนย่อย</span>
                            </button>
                          </div>

                          {u.lessons.map((ls) => {
                            const isLsActive = ls.id === selectedLessonId;
                            return (
                              <div
                                key={ls.id}
                                className={`p-1.5 rounded-lg text-xs flex items-center justify-between gap-1 transition-all ${
                                  isLsActive
                                    ? 'bg-[#00173b] text-white font-semibold'
                                    : 'hover:bg-white text-[#44474f] bg-[#f8f9ff]/60 border border-[#e6eeff]'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLessonId(ls.id);
                                    setLessonTitle(ls.title);
                                    setLessonDesc(ls.description || '');
                                    setLessonVideoUrl(ls.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                                  }}
                                  className="flex items-center gap-1.5 flex-1 text-left min-w-0"
                                >
                                  <span className="material-symbols-outlined text-[15px] opacity-80 shrink-0">
                                    play_circle
                                  </span>
                                  <span className="truncate">{ls.numberStr} {ls.title}</span>
                                </button>

                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    isLsActive ? 'bg-white/20 text-white' : 'bg-[#e6eeff] text-[#00173b]'
                                  }`}>
                                    {ls.duration || '15 นาที'}
                                  </span>
                                  {u.lessons.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSubLesson(u.id, ls.id, ls.title);
                                      }}
                                      className={`p-0.5 rounded hover:bg-red-500 hover:text-white transition-colors ${
                                        isLsActive ? 'text-red-200' : 'text-gray-400'
                                      }`}
                                      title="ลบบทเรียนย่อยนี้"
                                    >
                                      <span className="material-symbols-outlined text-[15px]">delete</span>
                                    </button>
                                  )}
                                </div>
                              </div>
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
              
              {/* Unit Info Banner with Quick Edit & Delete */}
              <div className="bg-gradient-to-r from-[#00173b] to-[#0f2c59] text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-black text-lg border border-white/20">
                    {activeUnit.unitNumber}
                  </div>
                  <div>
                    <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                      หน่วยการเรียนรู้ที่กำลังจัดการ
                    </div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      {activeUnit.title}
                    </h2>
                    {activeUnit.subtitle && (
                      <p className="text-xs text-white/80 line-clamp-1">{activeUnit.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenEditUnit(activeUnit)}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-all border border-white/25"
                    id="btn-quick-edit-active-unit"
                    title="แก้ไขชื่อและรายละเอียดหน่วยการเรียนรู้นี้"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>แก้ไขหน่วยนี้</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(activeUnit.id, activeUnit.title)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1 transition-all border border-red-400/40"
                    id="btn-quick-delete-active-unit"
                    title="ลบหน่วยการเรียนรู้นี้"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>ลบหน่วยนี้</span>
                  </button>
                </div>
              </div>
              
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
                  onClick={handleExportGoogleSheetCsv}
                  className="px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-800 shadow-xs transition-all"
                  id="btn-admin-download-googlesheet"
                  title="ดาวน์โหลดตารางคะแนนสำหรับเปิดใน Google Sheets หรือ Excel (.csv)"
                >
                  <span className="material-symbols-outlined text-[16px]">table_chart</span>
                  <span>ดาวน์โหลด Google Sheets</span>
                </button>
                <button
                  onClick={handleExportAdminPdf}
                  disabled={isExportingAdminPdf}
                  className="px-3.5 py-2 rounded-lg bg-[#00173b] hover:bg-[#0f2c59] disabled:opacity-75 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                  id="btn-admin-download-pdf"
                  title="ดาวน์โหลดตารางคะแนนเป็นไฟล์ PDF"
                >
                  {isExportingAdminPdf ? (
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
            <div ref={adminScoresTableRef} className="overflow-x-auto border border-[#e6eeff] rounded-xl bg-white p-2">
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
                    <th className="py-3 px-3 text-center w-28">จัดการ</th>
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
                        <div className="inline-flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedScoreForReport(sc)}
                            className="p-1.5 text-[#00173b] hover:bg-[#dce9ff] rounded transition-colors"
                            title="ดูใบรายงานผลการเรียน / ดาวน์โหลด PDF หรือ Google Sheets"
                          >
                            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedScoreForEdit(sc)}
                            className="p-1.5 text-[#00173b] hover:bg-[#eff4ff] rounded transition-colors"
                            title="แก้ไขคะแนน"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        </div>
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
                    className="p-2.5 px-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-2 text-xs group hover:bg-[#dce9ff] transition-all"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-bold text-[#00173b]">{lvl.name}</span>
                    <span className="text-[#747780]">({lvl.studentCount} คน)</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleStartEditLevel(lvl);
                        setShowLevelsModal(true);
                      }}
                      className="ml-1 p-0.5 rounded text-[#00173b] hover:bg-white/80 transition-colors"
                      title="แก้ไขระดับชั้นนี้"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </button>
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
                                setToastMsg(`คัดลอกรหัสผ่าน ${p} ของ ${st.firstName} ${st.lastName} แล้ว`);
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
                            onClick={() => handleDeleteStudent(st.studentId, `${st.firstName} ${st.lastName}`)}
                            className="p-1 rounded text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
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
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                <span className="text-[11px] font-bold text-[#44474f] block">
                  รายการระดับชั้นปัจจุบัน ({gradeLevels.length} ระดับชั้น)
                </span>
                {gradeLevels.map((lvl) => (
                  <div key={lvl.id}>
                    {editingLevelId === lvl.id ? (
                      <form
                        onSubmit={handleSaveEditLevel}
                        className="p-3 rounded-xl border-2 border-[#00173b] bg-[#eff4ff] flex flex-col gap-2.5 text-xs shadow-sm"
                      >
                        <div className="flex items-center justify-between text-[#00173b] font-bold">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-[#00173b]">edit_note</span>
                            <span>แก้ไขข้อมูลระดับชั้น</span>
                          </span>
                          <span className="text-[10px] text-[#747780] font-mono">{lvl.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="text-[11px] text-[#44474f] font-semibold block mb-0.5" htmlFor="input-edit-level-name">
                              ชื่อระดับชั้น *
                            </label>
                            <input
                              id="input-edit-level-name"
                              type="text"
                              value={editLevelName}
                              onChange={(e) => setEditLevelName(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-xs outline-none font-bold text-[#00173b] focus:ring-2 focus:ring-[#00173b]"
                              placeholder="เช่น มัธยมศึกษาปีที่ 4/1"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-[#44474f] font-semibold block mb-0.5" htmlFor="input-edit-level-count">
                              จำนวน นร. (คน)
                            </label>
                            <input
                              id="input-edit-level-count"
                              type="number"
                              min={1}
                              value={editLevelCount}
                              onChange={(e) => setEditLevelCount(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-xs outline-none text-center font-bold focus:ring-2 focus:ring-[#00173b]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-[#44474f] font-semibold block mb-0.5" htmlFor="input-edit-level-track">
                            แผนการเรียน / รายวิชา
                          </label>
                          <input
                            id="input-edit-level-track"
                            type="text"
                            value={editLevelTrack}
                            onChange={(e) => setEditLevelTrack(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#dce9ff] rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#00173b]"
                            placeholder="เช่น คลังบทเรียน 8 วิชา • แผนวิทย์-คณิต"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCancelEditLevel}
                            className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 text-xs"
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-lg bg-[#00173b] text-white font-bold hover:bg-[#0f2c59] text-xs flex items-center gap-1 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[14px]">save</span>
                            <span>บันทึกการแก้ไข</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-[#e6eeff] hover:border-[#b8c7e0] flex items-center justify-between text-xs bg-white transition-all">
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-[#00173b] flex items-center gap-2">
                            <span>{lvl.name}</span>
                            <span className="text-[10px] bg-[#eff4ff] text-[#00173b] px-2 py-0.5 rounded font-mono font-bold">
                              {lvl.studentCount || 40} คน
                            </span>
                          </div>
                          <div className="text-[11px] text-[#747780] mt-0.5">{lvl.track}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditLevel(lvl)}
                            className="text-[#00173b] px-2.5 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-lg transition-colors flex items-center gap-1 font-semibold text-xs"
                            title="แก้ไขระดับชั้นนี้โดยไม่ต้องลบ"
                          >
                            <span className="material-symbols-outlined text-[15px]">edit</span>
                            <span>แก้ไข</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGradeLevel(lvl.id, lvl.name)}
                            className="text-[#ba1a1a] p-1.5 hover:bg-[#ffdad6] rounded-lg transition-colors"
                            title="ลบระดับชั้น"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )}
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
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-num">
                      ลำดับหน่วย *
                    </label>
                    <input
                      id="modal-unit-num"
                      type="number"
                      min={1}
                      value={newUnitNumber}
                      onChange={(e) => setNewUnitNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none font-bold text-center"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-title">
                      ชื่อหน่วยการเรียนรู้ *
                    </label>
                    <input
                      id="modal-unit-title"
                      type="text"
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      placeholder="เช่น วิทยาศาสตร์ข้อมูลและ AI"
                      className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-subtitle">
                    คำอธิบายสาระสำคัญย่อ (Subtitle)
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

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-unit-first-lesson">
                    ชื่อบทเรียนแรกในหน่วยนี้
                  </label>
                  <input
                    id="modal-unit-first-lesson"
                    type="text"
                    value={newUnitFirstLessonTitle}
                    onChange={(e) => setNewUnitFirstLessonTitle(e.target.value)}
                    placeholder="เช่น บทนำและภาพรวมเนื้อหา"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowNewUnitModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474f] hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#bb0112] text-white text-xs font-bold hover:bg-[#93000b] flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>สร้างหน่วยการเรียนรู้</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: EDIT UNIT (แก้ไขข้อมูลหน่วยการเรียนรู้) */}
        {showEditUnitModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#00173b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00173b]">edit_note</span>
                  <span>แก้ไขข้อมูลหน่วยการเรียนรู้</span>
                </h3>
                <button onClick={() => setShowEditUnitModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveEditUnit} className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-edit-unit-num">
                      ลำดับหน่วย *
                    </label>
                    <input
                      id="modal-edit-unit-num"
                      type="number"
                      min={1}
                      value={editUnitNumber}
                      onChange={(e) => setEditUnitNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none font-bold text-center"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-edit-unit-title">
                      ชื่อหน่วยการเรียนรู้ *
                    </label>
                    <input
                      id="modal-edit-unit-title"
                      type="text"
                      value={editUnitTitle}
                      onChange={(e) => setEditUnitTitle(e.target.value)}
                      className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-edit-unit-subtitle">
                    คำอธิบายสาระสำคัญย่อ (Subtitle)
                  </label>
                  <input
                    id="modal-edit-unit-subtitle"
                    type="text"
                    value={editUnitSubtitle}
                    onChange={(e) => setEditUnitSubtitle(e.target.value)}
                    placeholder="เช่น การประยุกต์ใช้โมเดล AI ในชีวิตประจำวัน"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditUnitModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474f] hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00173b] text-white text-xs font-bold hover:bg-[#0f2c59] flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>บันทึกการแก้ไข</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: ADD SUB-LESSON (เพิ่มบทเรียนย่อย) */}
        {showAddLessonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-t-4 border-[#00173b] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#00173b] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00173b]">playlist_add</span>
                  <span>เพิ่มบทเรียนย่อยในหน่วยที่ {activeUnit.unitNumber}</span>
                </h3>
                <button onClick={() => setShowAddLessonModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveAddSubLesson} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-lesson-title">
                    ชื่อบทเรียนย่อย *
                  </label>
                  <input
                    id="modal-lesson-title"
                    type="text"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="เช่น 1.2 โครงสร้างและหลักการทำงานของ AI"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-lesson-duration">
                    ความยาว / ระยะเวลา
                  </label>
                  <input
                    id="modal-lesson-duration"
                    type="text"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(e.target.value)}
                    placeholder="เช่น 20:00 นาที"
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0d1c2e]" htmlFor="modal-lesson-video">
                    ลิงก์วิดีโอ YouTube
                  </label>
                  <input
                    id="modal-lesson-video"
                    type="url"
                    value={newLessonVideoUrl}
                    onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 mt-1 rounded-lg bg-[#eff4ff] text-xs text-[#0d1c2e] focus:bg-white focus:ring-2 focus:ring-[#00173b] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddLessonModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#44474f] hover:bg-gray-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00173b] text-white text-xs font-bold hover:bg-[#0f2c59] flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>เพิ่มบทเรียน</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: EDIT CONTACT INFO */}
        <EditContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          contactInfo={contactInfo || initialContactInfo}
          currentContact={contactInfo || initialContactInfo}
          onSave={(updated) => {
            setContactInfo?.(updated);
            setToastMsg('บันทึกข้อมูลติดต่อครูเรียบร้อยแล้ว และระบบนำไปแสดงบนหน้าแรกทันที');
          }}
        />

        {/* MODAL 6: REUSABLE SAFE CONFIRMATION DIALOG */}
        <ConfirmDialogModal
          state={confirmDialog}
          onClose={() => setConfirmDialog(null)}
        />

        {/* MODAL 7: INDIVIDUAL STUDENT REPORT CARD (PRINTABLE) */}
        <ReportCardModal
          score={selectedScoreForReport}
          onClose={() => setSelectedScoreForReport(null)}
          schoolName={schoolName}
        />

        {/* MODAL 8: DETAILED EDIT SCORE MODAL */}
        <EditScoreModal
          score={selectedScoreForEdit}
          onClose={() => setSelectedScoreForEdit(null)}
          onSave={(updated) => {
            setScores((prev) => prev.map((s) => (s.studentId === updated.studentId ? updated : s)));
            setToastMsg(`บันทึกคะแนนของ ${updated.firstName} ${updated.lastName} สำเร็จ`);
          }}
        />

        {/* FLOATING TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#00173b] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-[#dce9ff]/20">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            <span>{toastMsg}</span>
            <button
              onClick={() => setToastMsg(null)}
              className="ml-2 text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
