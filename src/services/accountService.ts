import { Family, FamilyMember, FamilyInvitation } from '../types';
import {
  syncUserProfileToFirestore,
  syncFamilyToFirestore,
  syncInvitationToFirestore,
  updateInvitationStatusInFirestore,
  findUserByMemberCodeInFirestore,
} from '../firebase';

const STORAGE_USERS_KEY = 'family_health_registered_users_v2';
const STORAGE_FAMILIES_KEY = 'family_health_families_v2';
const STORAGE_INVITATIONS_KEY = 'family_health_invitations_v2';
const STORAGE_AUTH_KEY = 'family_health_auth_user';

// Generate formatted unique code: e.g. FH-849201
export function generateUniqueMemberCode(existingCodes: string[] = []): string {
  let code = '';
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    code = `FH-${num}`;
  } while (existingCodes.includes(code));
  return code;
}

// Retrieve all registered accounts in the system
export function getRegisteredAccounts(): FamilyMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse registered users:', e);
    return [];
  }
}

// Save or update an account in the registered accounts store
export function saveRegisteredAccount(member: FamilyMember): void {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getRegisteredAccounts();
    const index = accounts.findIndex((a) => a.id === member.id || (member.email && a.email?.toLowerCase() === member.email?.toLowerCase()));
    if (index >= 0) {
      accounts[index] = { ...accounts[index], ...member };
    } else {
      accounts.push(member);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save registered user:', e);
  }

  // Push to cloud Firestore in background
  syncUserProfileToFirestore(member).catch((err) => {
    console.warn('Background Firestore user sync (offline/pending):', err);
  });
}

// Find an account by its unique code (case-insensitive)
export function findAccountByCode(code: string): FamilyMember | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase();
  const accounts = getRegisteredAccounts();
  return accounts.find((a) => a.memberCode && a.memberCode.toUpperCase() === cleanCode);
}

// Find account by code with Firestore fallback
export async function findAccountByCodeAsync(code: string): Promise<FamilyMember | undefined> {
  const local = findAccountByCode(code);
  if (local) return local;
  try {
    const remote = await findUserByMemberCodeInFirestore(code);
    if (remote && remote.memberCode) {
      const fullMember = remote as FamilyMember;
      saveRegisteredAccount(fullMember);
      return fullMember;
    }
  } catch (err) {
    console.warn('Firestore findAccountByCode lookup:', err);
  }
  return undefined;
}

// Find an account by email
export function findAccountByEmail(email: string): FamilyMember | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  const accounts = getRegisteredAccounts();
  return accounts.find((a) => a.email && a.email.toLowerCase() === clean);
}

// Invitations store
export function getInvitations(): FamilyInvitation[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_INVITATIONS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse invitations:', e);
    return [];
  }
}

export function saveInvitation(invitation: FamilyInvitation): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getInvitations();
    const index = list.findIndex((inv) => inv.id === invitation.id);
    if (index >= 0) {
      list[index] = invitation;
    } else {
      list.unshift(invitation);
    }
    localStorage.setItem(STORAGE_INVITATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save invitation:', e);
  }

  // Push invitation to Firestore
  syncInvitationToFirestore(invitation).catch((err) => {
    console.warn('Background Firestore invitation sync:', err);
  });
}

// Get pending invitations directed to a user (by their unique code or member ID)
export function getPendingInvitationsForUser(userCode: string, userId: string): FamilyInvitation[] {
  const all = getInvitations();
  const cleanCode = (userCode || '').trim().toUpperCase();
  return all.filter(
    (inv) =>
      inv.status === 'pending' &&
      ((cleanCode && inv.inviteeCode.toUpperCase() === cleanCode) || inv.inviteeId === userId)
  );
}

// Get invitations sent by this user
export function getSentInvitationsByUser(userId: string): FamilyInvitation[] {
  const all = getInvitations();
  return all.filter((inv) => inv.inviterId === userId);
}

// Create a new family for a user
export function createPersonalFamily(user: FamilyMember): Family {
  const familyId = `fam-${user.id.replace('mem-', '')}`;
  const familyName = `${user.name.split(' ')[0]}'s Family Vault`;
  return {
    id: familyId,
    name: familyName,
    adminName: user.name,
    adminId: user.id,
    inviteCode: user.memberCode,
    createdAt: new Date().toISOString().split('T')[0],
    memberCount: 1,
  };
}

// Accept an invitation: links the two users together into the same Family!
export function acceptFamilyInvitation(
  invitationId: string,
  currentUser: FamilyMember
): { success: boolean; error?: string; family?: Family; members?: FamilyMember[] } {
  const invitations = getInvitations();
  const targetInv = invitations.find((inv) => inv.id === invitationId);
  if (!targetInv) {
    return { success: false, error: 'Invitation not found' };
  }

  // Mark invitation accepted
  targetInv.status = 'accepted';
  saveInvitation(targetInv);
  updateInvitationStatusInFirestore(invitationId, 'accepted').catch(() => {});

  // Retrieve inviter
  const accounts = getRegisteredAccounts();
  const inviter = accounts.find((a) => a.id === targetInv.inviterId);
  if (!inviter) {
    return { success: false, error: 'Inviter account could not be found' };
  }

  // Define family ID to unite them
  const familyId = targetInv.familyId || `fam-${inviter.id.replace('mem-', '')}`;
  const familyName = targetInv.familyName || `${inviter.name.split(' ')[0]}'s Family Vault`;

  // Update currentUser with familyId and their role in the family
  const updatedCurrentUser: FamilyMember = {
    ...currentUser,
    familyId,
    relationship: targetInv.proposedRelationship || 'Spouse',
  };
  saveRegisteredAccount(updatedCurrentUser);

  // Ensure inviter has familyId
  const updatedInviter: FamilyMember = {
    ...inviter,
    familyId,
    relationship: 'Self',
  };
  saveRegisteredAccount(updatedInviter);

  // Re-save current user in auth session
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(updatedCurrentUser));
  }

  // Find all members who belong to this familyId
  const allAccounts = getRegisteredAccounts();
  const familyMembers = allAccounts.filter((a) => a.familyId === familyId);

  const unifiedFamily: Family = {
    id: familyId,
    name: familyName,
    adminName: inviter.name,
    adminId: inviter.id,
    inviteCode: inviter.memberCode,
    createdAt: targetInv.createdAt ? targetInv.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    memberCount: familyMembers.length,
  };

  return {
    success: true,
    family: unifiedFamily,
    members: familyMembers,
  };
}

// Decline an invitation
export function declineFamilyInvitation(invitationId: string): void {
  const invitations = getInvitations();
  const targetInv = invitations.find((inv) => inv.id === invitationId);
  if (targetInv) {
    targetInv.status = 'declined';
    saveInvitation(targetInv);
    updateInvitationStatusInFirestore(invitationId, 'declined').catch(() => {});
  }
}

// Get family and family members for a specific user ensuring strict privacy isolation
export function getUserFamilyAndMembers(user: FamilyMember): { family: Family; members: FamilyMember[] } {
  const accounts = getRegisteredAccounts();
  if (user.familyId) {
    const familyMembers = accounts.filter((a) => a.familyId === user.familyId);
    if (familyMembers.length > 0) {
      const hasUser = familyMembers.some((m) => m.id === user.id);
      const finalList = hasUser ? familyMembers : [user, ...familyMembers];
      return {
        family: {
          id: user.familyId,
          name: `${finalList[0].name.split(' ')[0]}'s Family Vault`,
          adminName: finalList[0].name,
          adminId: finalList[0].id,
          inviteCode: finalList[0].memberCode,
          createdAt: new Date().toISOString().split('T')[0],
          memberCount: finalList.length,
        },
        members: finalList,
      };
    }
  }

  // Personal isolated family (only the user themselves)
  return {
    family: createPersonalFamily(user),
    members: [user],
  };
}

