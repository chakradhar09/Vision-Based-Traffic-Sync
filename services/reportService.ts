import { 
  collection, 
  addDoc, 
  Timestamp,
  Firestore,
  FirestoreError 
} from 'firebase/firestore';
import { getFirestoreInstance, isFirebaseAvailable } from './firebaseConfig';
import { IncidentType } from '../types/incident';
import { LaneId } from '../types';
import { logger } from '../utils/logger';

/**
 * Save incident report to Firestore
 */
export async function saveIncidentReport(
  type: IncidentType,
  laneId: LaneId,
  laneLabel: string
): Promise<boolean> {
  // Check if Firebase is available
  if (!isFirebaseAvailable()) {
    logger.warn('Firebase not configured. Incident report logged locally only.', {
      component: 'reportService',
      function: 'saveIncidentReport',
      type,
      laneId,
    });
    return false;
  }

  const db = getFirestoreInstance();
  if (!db) {
    logger.error('Firestore instance not available', undefined, {
      component: 'reportService',
      function: 'saveIncidentReport',
    });
    return false;
  }

  try {
    const reportData = {
      type,
      laneId,
      laneLabel,
      timestamp: Timestamp.now(),
      reportedBy: 'citizen' as const,
      status: 'pending',
    };

    const docRef = await addDoc(collection(db, 'incident_reports'), reportData);
    
    logger.info('Incident report saved to Firestore', {
      component: 'reportService',
      function: 'saveIncidentReport',
      reportId: docRef.id,
      type,
      laneId,
    });

    return true;
  } catch (error) {
    const firestoreError = error as FirestoreError;
    logger.error('Failed to save incident report to Firestore', error, {
      component: 'reportService',
      function: 'saveIncidentReport',
      errorCode: firestoreError.code,
      errorMessage: firestoreError.message,
    });
    return false;
  }
}

/**
 * Get incident reports from Firestore (for future use)
 */
export async function getIncidentReports(laneId?: LaneId): Promise<any[]> {
  // This function can be implemented if needed for displaying report history
  // For now, we'll just save reports
  return [];
}

