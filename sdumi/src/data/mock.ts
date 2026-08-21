import type {
  Course,
  ScheduleEntry,
  CourseSyllabus,
  LeaderboardRow,
} from "./types";

// Mock data — stands in for scraped my.sdu.edu.kz data until the scraper is wired.

export const courses: Course[] = [
  { id: "c1", code: "MATH 161", title: "Calculus I", instructor: "A. Sadykova", credits: 3, color: "#7c6cff" },
  { id: "c2", code: "MATH 173", title: "Linear Algebra", instructor: "D. Omarov", credits: 3, color: "#33d6c0" },
  { id: "c3", code: "CS 102", title: "Programming Principles II", instructor: "R. Nurlan", credits: 4, color: "#5aa9ff" },
  { id: "c4", code: "PHYS 161", title: "Physics I", instructor: "K. Yerlan", credits: 3, color: "#f5b544" },
  { id: "c5", code: "ENG 121", title: "Academic English", instructor: "M. Jones", credits: 2, color: "#f26d6d" },
];

export const schedule: ScheduleEntry[] = [
  { id: "s1", courseId: "c1", day: 0, start: "09:00", end: "10:15", room: "F-201", type: "Lecture" },
  { id: "s2", courseId: "c3", day: 0, start: "10:30", end: "11:45", room: "C-104", type: "Lecture" },
  { id: "s3", courseId: "c5", day: 0, start: "13:00", end: "14:15", room: "A-310", type: "Seminar" },
  { id: "s4", courseId: "c2", day: 1, start: "09:00", end: "10:15", room: "F-115", type: "Lecture" },
  { id: "s5", courseId: "c4", day: 1, start: "10:30", end: "11:45", room: "B-220", type: "Lecture" },
  { id: "s6", courseId: "c3", day: 2, start: "09:00", end: "10:15", room: "C-104", type: "Lab" },
  { id: "s7", courseId: "c1", day: 2, start: "10:30", end: "11:45", room: "F-201", type: "Seminar" },
  { id: "s8", courseId: "c2", day: 3, start: "11:00", end: "12:15", room: "F-115", type: "Lab" },
  { id: "s9", courseId: "c4", day: 3, start: "13:00", end: "14:15", room: "B-220", type: "Lab" },
  { id: "s10", courseId: "c5", day: 4, start: "09:00", end: "10:15", room: "A-310", type: "Lecture" },
  { id: "s11", courseId: "c1", day: 4, start: "10:30", end: "11:45", room: "F-201", type: "Lecture" },
];

export const syllabi: CourseSyllabus[] = [
  {
    courseId: "c1",
    weeks: [
      { week: 1, topic: "Limits and continuity", done: true },
      { week: 2, topic: "Derivatives: definition and rules", done: true },
      { week: 3, topic: "Chain rule and implicit differentiation", done: true },
      { week: 4, topic: "Applications of derivatives", done: false },
      { week: 5, topic: "Optimization problems", done: false },
      { week: 6, topic: "Integrals: the definite integral", done: false },
    ],
  },
  {
    courseId: "c2",
    weeks: [
      { week: 1, topic: "Systems of linear equations", done: true },
      { week: 2, topic: "Matrix operations", done: true },
      { week: 3, topic: "Determinants", done: false },
      { week: 4, topic: "Vector spaces", done: false },
      { week: 5, topic: "Eigenvalues and eigenvectors", done: false },
    ],
  },
  {
    courseId: "c3",
    weeks: [
      { week: 1, topic: "Object-oriented basics", done: true },
      { week: 2, topic: "Inheritance & polymorphism", done: true },
      { week: 3, topic: "Collections & generics", done: false },
      { week: 4, topic: "Recursion", done: false },
    ],
  },
];

export const leaderboard: LeaderboardRow[] = [
  { id: "u1", name: "Aizhan T.", faculty: "Engineering", points: 1240, streak: 12, online: true },
  { id: "u2", name: "You", faculty: "Engineering", points: 1180, streak: 9, online: true, isMe: true },
  { id: "u3", name: "Damir K.", faculty: "Business", points: 1090, streak: 7, online: true },
  { id: "u4", name: "Madina S.", faculty: "Law", points: 980, streak: 5, online: false },
  { id: "u5", name: "Yerlan B.", faculty: "Engineering", points: 940, streak: 4, online: true },
  { id: "u6", name: "Aruzhan M.", faculty: "Education", points: 870, streak: 6, online: false },
  { id: "u7", name: "Nurbek A.", faculty: "Engineering", points: 810, streak: 3, online: true },
  { id: "u8", name: "Zhanel D.", faculty: "Business", points: 760, streak: 2, online: false },
];

export const courseById = (id?: string) => courses.find((c) => c.id === id);
