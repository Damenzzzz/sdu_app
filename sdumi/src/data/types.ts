// Shared domain types for SDUmi

export interface Course {
  id: string;
  code: string; // e.g. "MATH 161"
  title: string; // e.g. "Calculus I"
  instructor: string;
  credits: number;
  color: string;
}

export interface ScheduleEntry {
  id: string;
  courseId: string;
  day: number; // 0 = Monday ... 4 = Friday
  start: string; // "09:00"
  end: string; // "10:15"
  room: string;
  type: "Lecture" | "Lab" | "Seminar";
}

export interface SyllabusWeek {
  week: number;
  topic: string;
  done: boolean;
}

export interface CourseSyllabus {
  courseId: string;
  weeks: SyllabusWeek[];
}

export interface Daily {
  id: string;
  title: string;
  courseId?: string;
  done: boolean;
  createdAt: number;
  completedAt?: number;
  priority: "low" | "med" | "high";
}

export interface LeaderboardRow {
  id: string;
  name: string;
  faculty: string;
  points: number;
  streak: number;
  online: boolean;
  isMe?: boolean;
}
