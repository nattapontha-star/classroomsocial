import { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import { PortalAuthScreen } from './components/PortalAuthScreen';
import { ScorePortalScreen } from './components/ScorePortalScreen';
import { ClassroomScreen } from './components/ClassroomScreen';
import { AdminPortalScreen } from './components/AdminPortalScreen';
import { TeacherLoginScreen } from './components/TeacherLoginScreen';
import {
  getMasterData,
  saveMasterData,
  deleteStudentFromStorage,
  resetToFactoryDefaults,
  getSavedAdminSession,
  saveAdminSession,
  DATA_SYNC_EVENT,
  PersistedData,
  fetchFromFirestore,
  subscribeToFirestore,
} from './services/storageService';
import { initialScores } from './data/initialData';
import { Student, StudentScore, CurriculumUnit, GradeLevel, ContactInfo } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scores' | 'classroom' | 'admin'>('home');

  // Master Persistent State - Initialized safely from storageService
  const [masterState, setMasterState] = useState<PersistedData>(() => getMasterData());
  const [currentUser, setCurrentUser] = useState<Student | null>(() => masterState.students[0] || null);

  // Teacher / Admin Session State
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(() =>
    getSavedAdminSession()
  );
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => !!getSavedAdminSession());

  const curriculum = masterState.curriculum;
  const students = masterState.students;
  const scores = masterState.scores;
  const gradeLevels = masterState.gradeLevels;
  const schoolName = masterState.schoolName;
  const systemTitle = masterState.systemTitle;
  const contactInfo = masterState.contactInfo;

  // Real-time Storage & Firestore Cloud Synchronization
  useEffect(() => {
    // 1. Listen for local and cross-tab storage changes
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ data?: PersistedData }>;
      const data: PersistedData = customEvent.detail?.data || getMasterData();
      if (data) {
        setMasterState(data);
      }
    };

    window.addEventListener(DATA_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    // 2. Fetch live data from Firestore directly on app mount
    fetchFromFirestore().then((cloudData) => {
      if (cloudData) {
        setMasterState(cloudData);
      }
    });

    // 3. Subscribe to real-time updates from Firebase Firestore
    const unsubscribeFirestore = subscribeToFirestore((cloudData) => {
      if (cloudData) {
        setMasterState(cloudData);
      }
    });

    return () => {
      window.removeEventListener(DATA_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Synchronous, permanent state dispatchers
  const setCurriculum = useCallback(
    (action: CurriculumUnit[] | ((prev: CurriculumUnit[]) => CurriculumUnit[])) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.curriculum) : action;
        saveMasterData({ curriculum: nextVal });
        return { ...prev, curriculum: nextVal };
      });
    },
    []
  );

  const setStudents = useCallback(
    (action: Student[] | ((prev: Student[]) => Student[])) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.students) : action;
        saveMasterData({ students: nextVal });
        return { ...prev, students: nextVal };
      });
    },
    []
  );

  const setScores = useCallback(
    (action: StudentScore[] | ((prev: StudentScore[]) => StudentScore[])) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.scores) : action;
        saveMasterData({ scores: nextVal });
        return { ...prev, scores: nextVal };
      });
    },
    []
  );

  const setGradeLevels = useCallback(
    (action: GradeLevel[] | ((prev: GradeLevel[]) => GradeLevel[])) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.gradeLevels) : action;
        saveMasterData({ gradeLevels: nextVal });
        return { ...prev, gradeLevels: nextVal };
      });
    },
    []
  );

  const setSchoolName = useCallback(
    (action: string | ((prev: string) => string)) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.schoolName) : action;
        saveMasterData({ schoolName: nextVal });
        return { ...prev, schoolName: nextVal };
      });
    },
    []
  );

  const setSystemTitle = useCallback(
    (action: string | ((prev: string) => string)) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.systemTitle) : action;
        saveMasterData({ systemTitle: nextVal });
        return { ...prev, systemTitle: nextVal };
      });
    },
    []
  );

  const setContactInfo = useCallback(
    (action: ContactInfo | ((prev: ContactInfo) => ContactInfo)) => {
      setMasterState((prev) => {
        const nextVal = typeof action === 'function' ? action(prev.contactInfo) : action;
        saveMasterData({ contactInfo: nextVal });
        return { ...prev, contactInfo: nextVal };
      });
    },
    []
  );

  const handleLoginSuccess = (student: Student) => {
    setCurrentUser(student);
    setCurrentScreen('classroom');
  };

  const handleRegisterStudent = (newStudent: Student): boolean => {
    // Add student
    setStudents((prev) => [newStudent, ...prev]);

    // Also add an entry into scores
    const newScoreRecord: StudentScore = {
      studentNo: newStudent.number,
      studentId: newStudent.studentId,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      classRoom: newStudent.classRoom,
      subject: 'วิทยาการคำนวณและเทคโนโลยีสารสนเทศ 1',
      unit1Score: 0,
      unit2Score: 0,
      quizScore: 0,
      totalScore: 0,
      status: 'รอสอบแก้ตัว',
      email: newStudent.email,
    };
    setScores((prev) => [newScoreRecord, ...prev]);

    return true;
  };

  const handleDeleteStudentAtomic = useCallback((studentId: string) => {
    const updated = deleteStudentFromStorage(studentId);
    setMasterState((prev) => ({
      ...prev,
      students: updated.students,
      scores: updated.scores,
    }));
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('home');
  };

  /**
   * Teacher / Admin Authentication
   * Admin login preserves the active master school database so deleted units & students never resurrect!
   */
  const handleAdminLoginSuccess = (info: { email: string; name: string; role: string }) => {
    setAdminUser(info);
    setIsAdminLoggedIn(true);
    saveAdminSession(info);
    setCurrentScreen('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    saveAdminSession(null);
    setCurrentScreen('home');
  };

  // Restore default scores handler for ScorePortal
  const handleResetDefaultScores = () => {
    setScores(initialScores);
  };

  // Explicit Factory Reset
  const handleResetCurrentAdminData = () => {
    if (
      window.confirm(
        'คุณต้องการคืนค่าระบบเป็นค่าเริ่มต้นทั้งหมดหรือไม่?\n\n- ข้อมูลหน่วยการเรียนรู้, นักเรียน, คะแนน, ระดับชั้น, และข้อมูลติดต่อจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นมาตรฐานโรงเรียน'
      )
    ) {
      const resetData = resetToFactoryDefaults();
      setMasterState(resetData);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] font-sans antialiased selection:bg-[#00173b] selection:text-white">
      {/* Universal Sticky Navigation */}
      <Navigation
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
        schoolName={schoolName}
        isAdminLoggedIn={isAdminLoggedIn}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Screen Router with Padding for Sticky Nav */}
      <main className="pt-20">
        {currentScreen === 'home' && (
          <PortalAuthScreen
            students={students}
            onLoginSuccess={handleLoginSuccess}
            onRegisterStudent={handleRegisterStudent}
            onNavigateScores={() => setCurrentScreen('scores')}
            schoolName={schoolName}
            contactInfo={contactInfo}
          />
        )}

        {currentScreen === 'scores' && (
          <ScorePortalScreen
            scores={scores}
            setScores={setScores}
            onResetScores={handleResetDefaultScores}
            onNavigateHome={() => setCurrentScreen('home')}
            onNavigateClassroom={() => setCurrentScreen('classroom')}
            onNavigateAdmin={() => setCurrentScreen('admin')}
            schoolName={schoolName}
          />
        )}

        {currentScreen === 'classroom' && (
          <ClassroomScreen
            currentUser={currentUser}
            curriculum={curriculum}
            onLogout={handleLogout}
            onNavigateScores={() => setCurrentScreen('scores')}
            onNavigateHome={() => setCurrentScreen('home')}
            schoolName={schoolName}
          />
        )}

        {currentScreen === 'admin' &&
          (!isAdminLoggedIn ? (
            <TeacherLoginScreen
              onLoginSuccess={handleAdminLoginSuccess}
              onCancel={() => setCurrentScreen('home')}
              schoolName={schoolName}
            />
          ) : (
            <AdminPortalScreen
              curriculum={curriculum}
              setCurriculum={setCurriculum}
              students={students}
              setStudents={setStudents}
              scores={scores}
              setScores={setScores}
              gradeLevels={gradeLevels}
              setGradeLevels={setGradeLevels}
              schoolName={schoolName}
              setSchoolName={setSchoolName}
              systemTitle={systemTitle}
              setSystemTitle={setSystemTitle}
              onNavigateHome={() => setCurrentScreen('home')}
              adminUser={adminUser}
              onLogoutAdmin={handleAdminLogout}
              onResetAccountData={handleResetCurrentAdminData}
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              onDeleteStudent={handleDeleteStudentAtomic}
            />
          ))}
      </main>
    </div>
  );
}
