
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PatientStatus } from '../types';

export interface SurgerySchedule {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  time: string;
  room: string;
  doctor: string;
  patientTitle: string;
  patientName: string;
  patientHN: string;
  patientAge: string;
  patientPhone: string;
  procedure: string;
  surgeryType: 'Minor' | 'Major';
  department: string;
  notes?: string;
  status?: PatientStatus;
  createdAt?: string;
  updatedAt?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

const COLLECTION_NAME = 'surgery_schedules';

export const getSurgerySchedule = async (): Promise<SurgerySchedule[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'), orderBy('time', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as SurgerySchedule[];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    return [];
  }
};

export const subscribeToSurgerySchedule = (callback: (data: SurgerySchedule[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'), orderBy('time', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as SurgerySchedule[];
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

export const addSurgerySchedule = async (data: Omit<SurgerySchedule, 'id'>): Promise<SurgerySchedule> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: data.status || 'unconfirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { ...data, id: docRef.id } as SurgerySchedule;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
    throw error;
  }
};

export const updateSurgerySchedule = async (id: string, data: Partial<SurgerySchedule>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteSurgerySchedule = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
