import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface DoctorSchedule {
  id: string;
  name: string;
  clinic: string;
  schedule: {
    day: number;
    time: string;
  }[];
  specificDates?: {
    date: string; // ISO yyyy-MM-dd
    time: string;
  }[];
  exclusions?: string[];
}

export interface Holiday {
  id: string;
  date: string; // ISO yyyy-MM-dd
  name: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'doctor_schedules';

export const getDoctorSchedules = async (): Promise<DoctorSchedule[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as DoctorSchedule[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};

export const subscribeToDoctorSchedules = (callback: (data: DoctorSchedule[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as DoctorSchedule[];
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const addDoctorSchedule = async (data: Omit<DoctorSchedule, 'id'>): Promise<DoctorSchedule> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return { ...data, id: docRef.id } as DoctorSchedule;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const updateDoctorSchedule = async (id: string, data: Partial<DoctorSchedule>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteDoctorSchedule = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};

const HOLIDAYS_COLLECTION = 'holidays';

export const getHolidays = async (): Promise<Holiday[]> => {
  try {
    const q = query(collection(db, HOLIDAYS_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Holiday[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, HOLIDAYS_COLLECTION);
    return [];
  }
};

export const subscribeToHolidays = (callback: (data: Holiday[]) => void) => {
  const q = query(collection(db, HOLIDAYS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Holiday[];
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, HOLIDAYS_COLLECTION);
  });
};

export const addHoliday = async (data: Omit<Holiday, 'id'>): Promise<Holiday> => {
  try {
    const docRef = await addDoc(collection(db, HOLIDAYS_COLLECTION), data);
    return { ...data, id: docRef.id } as Holiday;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, HOLIDAYS_COLLECTION);
    throw error;
  }
};

export const deleteHoliday = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, HOLIDAYS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${HOLIDAYS_COLLECTION}/${id}`);
  }
};
