
export interface SurgerySchedule {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  time: string;
  room: string;
  doctor: string;
  patientName: string;
  patientHN: string;
  patientAge: string;
  procedure: string;
  surgeryType: 'Minor' | 'Major';
  department: string;
  status?: 'preparing' | 'surgery' | 'recovery' | 'completed' | 'canceled';
}

const STORAGE_KEY = 'surgery_schedule_data';

const DEFAULT_SCHEDULE: SurgerySchedule[] = [];

/**
 * Helper to call Google Apps Script functions
 */
const callGAS = <T>(functionName: string, ...args: any[]): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.script?.run) {
      (window as any).google.script.run
        .withSuccessHandler((result: T) => resolve(result))
        .withFailureHandler((error: any) => reject(error))
        [functionName](...args);
    } else {
      reject(new Error('Google Script environment not found'));
    }
  });
};

export const getSurgerySchedule = async (): Promise<SurgerySchedule[]> => {
  try {
    // Try Google Apps Script first
    return await callGAS<SurgerySchedule[]>('getSurgerySchedule');
  } catch (e) {
    // Fallback to localStorage for local development
    console.warn('Falling back to localStorage:', e);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored schedule', e);
        return DEFAULT_SCHEDULE;
      }
    }
    return DEFAULT_SCHEDULE;
  }
};

export const addSurgerySchedule = async (data: Omit<SurgerySchedule, 'id'>): Promise<SurgerySchedule> => {
  try {
    return await callGAS<SurgerySchedule>('addSurgerySchedule', data);
  } catch (e) {
    console.warn('Falling back to localStorage for add:', e);
    const schedule = await getSurgerySchedule();
    const newItem: SurgerySchedule = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: data.status || 'preparing',
    };
    const updated = [...schedule, newItem];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  }
};

export const updateSurgerySchedule = async (id: string, data: Partial<SurgerySchedule>): Promise<SurgerySchedule[]> => {
  try {
    return await callGAS<SurgerySchedule[]>('updateSurgerySchedule', id, data);
  } catch (e) {
    console.warn('Falling back to localStorage for update:', e);
    const schedule = await getSurgerySchedule();
    const updated = schedule.map(item => 
      item.id === id ? { ...item, ...data } : item
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};

export const deleteSurgerySchedule = async (id: string): Promise<SurgerySchedule[]> => {
  try {
    return await callGAS<SurgerySchedule[]>('deleteSurgerySchedule', id);
  } catch (e) {
    console.warn('Falling back to localStorage for delete:', e);
    const schedule = await getSurgerySchedule();
    const updated = schedule.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
