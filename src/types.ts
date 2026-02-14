export type UserRole = 'administrator' | 'teacher';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  cargo?: string;
  grades?: string[];
  subjects?: string[];
  isCourseDirector?: boolean;
  directedCourse?: string;
}

export interface Student {
  id: string; // Documento de identidad
  name: string;
  grade: string;
  email: string;
  phone: string;
  isPiar?: boolean;
  address?: string;
  neighborhood?: string;
  
  // Campos Anexo 2 (Sincronizados con PiarGestor)
  motherName?: string;
  motherOccupation?: string;
  motherEducation?: string;
  motherPhone?: string;
  motherEmail?: string;
  
  fatherName?: string;
  fatherOccupation?: string;
  fatherEducation?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  
  caregiverName?: string;
  caregiverRelation?: string;
  caregiverEducation?: string;
  caregiverPhone?: string;

  birthPlace?: string;
  birthDate?: string;
  age?: number;
  idType?: string; // tipo_documento
  
  // Salud
  eps?: string;
  regimen?: string;
  healthEmergencyPlace?: string;
  isHealthAttended?: boolean;
  healthFrequency?: string;
  medicalDiagnosis?: string;
  isTherapyAttending?: boolean;
  therapyType?: string;
  medicalTreatment?: string;
  consumesMedication?: boolean;
  medicationSchedule?: string;
  aidProducts?: string;
  
  // Focalización
  isProtectionCenter?: boolean;
  protectionCenterLocation?: string;
  isEthnicGroup?: boolean;
  ethnicGroupName?: string;
  isConflictVictim?: boolean;
  hasConflictRegistry?: boolean;
  
  // Compatibilidad con base de datos (snake_case opcional para Supabase)
  documentType?: string; 
  documentNumber?: string;
  courseId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string;
  subjects: string[];
  grades: string[];
  sede?: string;
  isCourseDirector?: boolean;
  directedCourse?: string;
}

export interface Course {
  id: string;
  grade: string;
  sede: string;
  name?: string; // Nombre amigable para el select
}

export interface AcademicArea {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  areaId: string;
}

export interface Annotation {
  id: string;
  date: string;
  time: string;
  period: number;
  studentId: string;
  studentName: string;
  grade: string;
  teacherName: string;
  category: 'Falta' | 'Incumplimiento';
  level: 'leve' | 'grave' | 'gravisimo' | 'tipo1' | 'tipo2' | 'tipo3';
  numeral: string;
  action: string;
  description: string;
  directiveAction?: string;
  directiveActor?: string;
  studentCommitment?: string;
  parentCommitment?: string;
  signedStudent: boolean;
  signedParent: boolean;
  isPrioritized?: boolean;
  informedDependency?: string;
}

export interface AttendanceLog {
  studentId: string;
  studentName: string;
  grade: string;
  period: number;
  date: string;
  time: string;
  type: 'absence' | 'lateness' | 'evasion' | 'excuse';
  teacherName: string;
}

export interface PiarRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  teacherName: string;
  period: number;
  objectives: string;
  barriers: string[];
  adjustments: string[];
  evaluationMethod: string;
  improvementStrategies: string;
  gestorObservations?: string;
  observaciones_gestor?: string; // Alias para Supabase
  date: string;
  time?: string;
  sede: string;
  grade: string;
}

export interface CompetencyReport {
  id?: string;
  studentId?: string;
  studentName: string;
  grade: string;
  reportText: string;
  year: number;
  isVerified: boolean;
  gestorObservations?: string;
  date?: string;
  time?: string;
}