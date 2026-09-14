export interface Student {
  studentId: string;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  classRoom: string;
  number: string;
  registeredAt?: string;
  email?: string;
  progressPercent?: number;
}

export interface StudentScore {
  studentId: string;
  studentNo: string;
  firstName: string;
  lastName: string;
  classRoom: string;
  subject: string;
  unit1Score: number;
  unit2Score: number;
  quizScore: number;
  totalScore: number;
  status: 'ผ่านเกณฑ์ดีเยี่ยม' | 'ผ่านเกณฑ์ดีมาก' | 'ผ่านเกณฑ์' | 'ต้องสอบซ่อมเสริม' | 'รอสอบแก้ตัว';
  email?: string;
}

export interface Question {
  id: string;
  text: string;
  points: number;
  options: string[];
  correctIndex: number;
}

export interface UnitQuiz {
  id: string;
  title: string;
  assigned: boolean;
  totalScore: number;
  questions: Question[];
}

export interface SubLesson {
  id: string;
  numberStr: string;
  title: string;
  status: 'พร้อมสอน' | 'ร่าง' | 'การบ้าน';
  videoUrl?: string;
  duration?: string;
  description?: string;
}

export interface CurriculumUnit {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  statusText?: string;
  lessonsCount: number;
  isCompleted?: boolean;
  isActive?: boolean;
  isLocked?: boolean;
  lessons: SubLesson[];
  quiz?: UnitQuiz;
}

export interface GradeLevel {
  id: string;
  name: string;
  track: string;
  studentCount: number;
  lessonCount: number;
  category: 'early' | 'late';
}

export interface ContactInfo {
  title: string;
  subtitle: string;
  officeLocation: string;
  phone: string;
  email: string;
  workingHours: string;
  note: string;
}
