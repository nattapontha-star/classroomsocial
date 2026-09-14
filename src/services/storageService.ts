import {
  Student,
  StudentScore,
  CurriculumUnit,
  GradeLevel,
  ContactInfo,
} from '../types';
import {
  initialStudents,
  initialScores,
  initialCurriculum,
  initialGradeLevels,
  initialContactInfo,
} from '../data/initialData';
import { db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export interface PersistedData {
  curriculum: CurriculumUnit[];
  students: Student[];
  scores: StudentScore[];
  gradeLevels: GradeLevel[];
  schoolName: string;
  systemTitle: string;
  contactInfo: ContactInfo;
  lastUpdated?: string;
}

export const MASTER_STORAGE_KEY = 'satit_lms_master_v4';
export const BACKUP_STORAGE_KEY = 'satit_lms_backup_v4';
export const ADMIN_SESSION_KEY = 'satit_lms_admin_session_v4';
export const DATA_SYNC_EVENT = 'satit_lms_data_synced';

// Firestore collection and document references
export const FIRESTORE_SETTINGS_COLL = 'school_settings';
export const FIRESTORE_MASTER_DOC_ID = 'master_data';

/**
 * Creates default data schema for the very first initialization
 */
export function getDefaultData(): PersistedData {
  return {
    curriculum: initialCurriculum,
    students: initialStudents,
    scores: initialScores,
    gradeLevels: initialGradeLevels,
    schoolName: 'โรงเรียนสาธิตเทศบาลเมืองราชบุรี',
    systemTitle: 'ระบบบริหารจัดการวิชาการและบทเรียน',
    contactInfo: initialContactInfo,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Syncs data to Firestore in the background
 */
export async function syncToFirestore(data: PersistedData): Promise<void> {
  try {
    const docRef = doc(db, FIRESTORE_SETTINGS_COLL, FIRESTORE_MASTER_DOC_ID);
    await setDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore sync write failed or offline:', err);
  }
}

/**
 * Reads data from Firestore directly
 */
export async function fetchFromFirestore(): Promise<PersistedData | null> {
  try {
    const docRef = doc(db, FIRESTORE_SETTINGS_COLL, FIRESTORE_MASTER_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const d = snap.data() as PersistedData;
      if (d && Array.isArray(d.curriculum) && Array.isArray(d.students) && Array.isArray(d.scores)) {
        // Cache to localStorage for instant startup
        const serialized = JSON.stringify(d);
        localStorage.setItem(MASTER_STORAGE_KEY, serialized);
        localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
        return d;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch failed or offline:', err);
  }
  return null;
}

/**
 * Real-time listener for Firestore master record
 */
export function subscribeToFirestore(onUpdate: (data: PersistedData) => void): () => void {
  try {
    const docRef = doc(db, FIRESTORE_SETTINGS_COLL, FIRESTORE_MASTER_DOC_ID);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const d = snap.data() as PersistedData;
          if (d && Array.isArray(d.curriculum) && Array.isArray(d.students) && Array.isArray(d.scores)) {
            const serialized = JSON.stringify(d);
            localStorage.setItem(MASTER_STORAGE_KEY, serialized);
            localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
            onUpdate(d);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent(DATA_SYNC_EVENT, { detail: { data: d } })
              );
            }
          }
        }
      },
      (error) => {
        console.warn('Firestore subscription warning:', error);
      }
    );
  } catch (e) {
    console.warn('Unable to subscribe to Firestore:', e);
    return () => {};
  }
}

/**
 * Loads master data safely.
 * CRITICAL: Once data is saved to MASTER_STORAGE_KEY or Firestore, whatever is in storage
 * is the source of truth. It will NEVER resurrect deleted items!
 */
export function getMasterData(): PersistedData {
  try {
    const raw = localStorage.getItem(MASTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.curriculum) &&
        Array.isArray(parsed.students) &&
        Array.isArray(parsed.scores)
      ) {
        return {
          curriculum: parsed.curriculum,
          students: parsed.students,
          scores: parsed.scores,
          gradeLevels: Array.isArray(parsed.gradeLevels)
            ? parsed.gradeLevels
            : initialGradeLevels,
          schoolName: parsed.schoolName || 'โรงเรียนสาธิตเทศบาลเมืองราชบุรี',
          systemTitle: parsed.systemTitle || 'ระบบบริหารจัดการวิชาการและบทเรียน',
          contactInfo: parsed.contactInfo || initialContactInfo,
          lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        };
      }
    }

    // Try backup if master was corrupted
    const backupRaw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupRaw) {
      const parsed = JSON.parse(backupRaw);
      if (parsed && Array.isArray(parsed.curriculum) && Array.isArray(parsed.students)) {
        localStorage.setItem(MASTER_STORAGE_KEY, backupRaw);
        return parsed as PersistedData;
      }
    }
  } catch (err) {
    console.error('Failed to load persistent master data:', err);
  }

  // First time only: initialize with default data and save immediately
  const fresh = getDefaultData();
  try {
    const serialized = JSON.stringify(fresh);
    localStorage.setItem(MASTER_STORAGE_KEY, serialized);
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
    // Background seed to Firestore
    syncToFirestore(fresh);
  } catch (e) {
    console.warn('Unable to write initial storage:', e);
  }
  return fresh;
}

/**
 * Saves master data immediately to localStorage and synchronously pushes to Firestore.
 */
export function saveMasterData(data: Partial<PersistedData>): PersistedData {
  try {
    const current = getMasterData();
    const updated: PersistedData = {
      ...current,
      ...data,
      lastUpdated: new Date().toISOString(),
    };

    const serialized = JSON.stringify(updated);
    localStorage.setItem(MASTER_STORAGE_KEY, serialized);
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);

    // Push to Firestore Cloud Database
    syncToFirestore(updated);

    // Broadcast change for other components/listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(DATA_SYNC_EVENT, { detail: { data: updated } })
      );
    }

    return updated;
  } catch (err) {
    console.error('Error saving to persistent master data:', err);
    return getMasterData();
  }
}

/**
 * Delete a student permanently from BOTH students collection and scores records
 */
export function deleteStudentFromStorage(studentId: string): PersistedData {
  const current = getMasterData();
  const updatedStudents = current.students.filter((s) => s.studentId !== studentId);
  const updatedScores = current.scores.filter((sc) => sc.studentId !== studentId);

  return saveMasterData({
    students: updatedStudents,
    scores: updatedScores,
  });
}

/**
 * Delete a curriculum unit permanently and renumber remaining units
 */
export function deleteUnitFromStorage(unitId: string): PersistedData {
  const current = getMasterData();
  const remaining = current.curriculum.filter((u) => u.id !== unitId);
  const renumbered = remaining.map((u, idx) => ({
    ...u,
    unitNumber: idx + 1,
    lessons: (u.lessons || []).map((ls, lIdx) => ({
      ...ls,
      numberStr: `${idx + 1}.${lIdx + 1}`,
    })),
  }));

  return saveMasterData({
    curriculum: renumbered,
  });
}

/**
 * Delete a sublesson permanently from a unit
 */
export function deleteSubLessonFromStorage(unitId: string, lessonId: string): PersistedData {
  const current = getMasterData();
  const updatedCurriculum = current.curriculum.map((u) => {
    if (u.id === unitId) {
      const filtered = (u.lessons || []).filter((l) => l.id !== lessonId);
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
  });

  return saveMasterData({
    curriculum: updatedCurriculum,
  });
}

/**
 * Delete a grade level permanently
 */
export function deleteGradeLevelFromStorage(levelId: string): PersistedData {
  const current = getMasterData();
  const updatedLevels = current.gradeLevels.filter((l) => l.id !== levelId);

  return saveMasterData({
    gradeLevels: updatedLevels,
  });
}

/**
 * Explicit Factory Reset (only when explicitly triggered by Admin with confirmation)
 */
export function resetToFactoryDefaults(): PersistedData {
  const fresh = getDefaultData();
  const serialized = JSON.stringify(fresh);
  try {
    localStorage.setItem(MASTER_STORAGE_KEY, serialized);
    localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
    syncToFirestore(fresh);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(DATA_SYNC_EVENT, { detail: { data: fresh } })
      );
    }
  } catch (e) {
    console.error('Failed to reset factory defaults:', e);
  }
  return fresh;
}

/**
 * Saves and loads teacher/admin authentication state
 */
export function getSavedAdminSession(): { email: string; name: string; role: string } | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAdminSession(admin: { email: string; name: string; role: string } | null) {
  try {
    if (admin) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
    } else {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Failed to save admin session:', e);
  }
}
