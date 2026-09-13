import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { PortalAuthScreen } from './components/PortalAuthScreen';
import { ScorePortalScreen } from './components/ScorePortalScreen';
import { ClassroomScreen } from './components/ClassroomScreen';
import { AdminPortalScreen } from './components/AdminPortalScreen';
import { TeacherLoginScreen } from './components/TeacherLoginScreen';
import {
  initialStudents,
  initialScores,
  initialCurriculum,
  initialGradeLevels,
} from './data/initialData';
import { Student, StudentScore, CurriculumUnit, GradeLevel } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'scores' | 'classroom' | 'admin'>('home');
  const [currentUser, setCurrentUser] = useState<Student | null>(initialStudents[0]);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [scores, setScores] = useState<StudentScore[]>(initialScores);
  const [curriculum, setCurriculum] = useState<CurriculumUnit[]>(initialCurriculum);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(initialGradeLevels);
  const [schoolName, setSchoolName] = useState('โรงเรียนสาธิตเทศบาลเมืองราชบุรี');
  const [systemTitle, setSystemTitle] = useState('ระบบบริหารจัดการวิชาการและบทเรียน');

  // Teacher / Admin Authentication State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(null);

  const handleLoginSuccess = (student: Student) => {
    setCurrentUser(student);
    setCurrentScreen('classroom');
  };

  const handleRegisterStudent = (newStudent: Student): boolean => {
    setStudents((prev) => [newStudent, ...prev]);

    // Also add an entry into scores
    const newScoreRecord: StudentScore = {
      studentId: newStudent.studentId,
      studentNo: newStudent.number,
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

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('home');
  };

  const handleAdminLoginSuccess = (info: { email: string; name: string; role: string }) => {
    setAdminUser(info);
    setIsAdminLoggedIn(true);
    setCurrentScreen('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentScreen('home');
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
          />
        )}

        {currentScreen === 'scores' && (
          <ScorePortalScreen
            scores={scores}
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

        {currentScreen === 'admin' && (
          !isAdminLoggedIn ? (
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
            />
          )
        )}
      </main>
    </div>
  );
}
