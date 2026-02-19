
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'none';

export interface Worker {
  id: string;
  workerIdNum?: string; // Manual ID number
  name: string;
  phone: string;
  designation: string;
  joinDate: string;
  photo?: string; // Base64 string
}

export interface AttendanceRecord {
  date: string; // ISO string (YYYY-MM-DD)
  workerId: string;
  status: AttendanceStatus;
  time?: string; // Record the time marked
}

export type AppView = 'dashboard' | 'attendance' | 'workers' | 'add-worker' | 'report' | 'active-session';

export interface LastMarked {
  name: string;
  time: string;
}
