import { generateRandomString } from './generateRandomString';
import * as Invite from '../db/invite';

export async function getInvites(spotifyUserId: string) {
  const invites = await Invite.getInvites(spotifyUserId);
  return invites.map((item: Invite.InviteCode) => (item['inviteCode']));
}

export async function createInvite(spotifyUserId: string) {
  const inviteCode = generateRandomString(32);
  await Invite.putInvite(spotifyUserId, inviteCode);
  return inviteCode;
}

export async function deleteInvite(spotifyUserId: string, inviteCode: string) {
  await Invite.deleteInvite(spotifyUserId, inviteCode);
}