import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Family, FamilyMember, FamilyInvitation, MedicalDocument } from './types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: Must specify databaseId per platform skill */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// -------------------------------------------------------------
// Hardened Firestore Error Handling (SKILL.md Spec)
// -------------------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid || null,
      email: currentAuth?.email || null,
      emailVerified: currentAuth?.emailVerified || null,
      isAnonymous: currentAuth?.isAnonymous || null,
      tenantId: currentAuth?.tenantId || null,
      providerInfo:
        currentAuth?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// Connection Validation (SKILL.md Spec)
// -------------------------------------------------------------
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Checking fallback.');
    }
    return false;
  }
}

// Boot verification
testConnection().catch(() => {});

// -------------------------------------------------------------
// Auth Helpers
// -------------------------------------------------------------
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
}

export async function logOutFromFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase Sign-Out Error:', err);
    throw err;
  }
}

// -------------------------------------------------------------
// Firestore Synchronization Helpers
// -------------------------------------------------------------

/**
 * Save or update user profile in Firestore (/users/{userId})
 */
export async function syncUserProfileToFirestore(member: FamilyMember): Promise<void> {
  if (!auth.currentUser || !member.id) return;
  const path = `users/${member.id}`;
  try {
    const userRef = doc(db, 'users', member.id);
    const payload = {
      id: member.id,
      userId: member.id,
      name: member.name,
      email: member.email || '',
      memberCode: member.memberCode,
      age: member.age || 30,
      dob: member.dob || '',
      gender: member.gender || 'Prefer not to say',
      relationship: member.relationship || 'Self',
      status: member.status || 'healthy',
      statusText: member.statusText || 'Profile Active',
      bloodType: member.bloodType || 'O+',
      familyId: member.familyId || '',
      avatar: member.avatar || '',
      emergencyContact: member.emergencyContact || '',
      primaryPhysician: member.primaryPhysician || '',
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Fetch a user profile from Firestore by memberId/userId
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<Partial<FamilyMember> | null> {
  if (!auth.currentUser || !userId) return null;
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<FamilyMember>;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

/**
 * Look up a user profile in Firestore by memberCode
 */
export async function findUserByMemberCodeInFirestore(code: string): Promise<Partial<FamilyMember> | null> {
  const clean = (code || '').trim().toUpperCase();
  if (!clean || !auth.currentUser) return null;
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('memberCode', '==', clean));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Partial<FamilyMember>;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Save family vault metadata to Firestore (/families/{familyId})
 */
export async function syncFamilyToFirestore(family: Family): Promise<void> {
  if (!auth.currentUser || !family.id) return;
  const path = `families/${family.id}`;
  try {
    const famRef = doc(db, 'families', family.id);
    await setDoc(
      famRef,
      {
        id: family.id,
        name: family.name,
        adminId: family.adminId,
        adminName: family.adminName,
        inviteCode: family.inviteCode || '',
        memberCount: family.memberCount || 1,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save an invitation to Firestore (/invitations/{invitationId})
 */
export async function syncInvitationToFirestore(invitation: FamilyInvitation): Promise<void> {
  if (!auth.currentUser || !invitation.id) return;
  const path = `invitations/${invitation.id}`;
  try {
    const invRef = doc(db, 'invitations', invitation.id);
    await setDoc(
      invRef,
      {
        ...invitation,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Update invitation status in Firestore
 */
export async function updateInvitationStatusInFirestore(
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  if (!auth.currentUser || !invitationId) return;
  const path = `invitations/${invitationId}`;
  try {
    const invRef = doc(db, 'invitations', invitationId);
    await updateDoc(invRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

/**
 * Listen to real-time pending invitations for a member code
 */
export function subscribeToUserInvitations(
  memberCode: string,
  onUpdate: (invitations: FamilyInvitation[]) => void
): () => void {
  const cleanCode = (memberCode || '').trim().toUpperCase();
  if (!cleanCode || !auth.currentUser) return () => {};
  const path = 'invitations';
  try {
    const q = query(
      collection(db, 'invitations'),
      where('inviteeCode', '==', cleanCode),
      where('status', '==', 'pending')
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const list: FamilyInvitation[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as FamilyInvitation);
        });
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (err) {
    console.error('Error subscribing to invitations:', err);
    return () => {};
  }
}

/**
 * Save medical document to Firestore (/families/{familyId}/documents/{docId})
 */
export async function syncMedicalDocumentToFirestore(
  docData: any,
  familyId: string
): Promise<void> {
  if (!auth.currentUser || !docData?.id) return;
  const targetFamilyId = familyId || 'default-family';
  const path = `families/${targetFamilyId}/documents/${docData.id}`;
  try {
    const dRef = doc(db, 'families', targetFamilyId, 'documents', docData.id);
    await setDoc(
      dRef,
      {
        ...docData,
        familyId: targetFamilyId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
