export interface Conversation {
  id: number;
  peerUserId: number;
  peerDisplayName: string | null;
  peerAvatarPhotoUrl: string | null;
  peerHouseholdName: string | null;
  peerHouseholdAvatarKey: string | null;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
  unread: boolean;
  createdAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  senderUserId: number;
  senderDisplayName: string;
  body: string;
  audioUrl: string | null;
  audioDurationSeconds: number | null;
  createdAt: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
}
