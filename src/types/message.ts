export interface Conversation {
  id: number;
  peerHouseholdId: number;
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
  senderHouseholdId: number | null;
  senderDisplayName: string;
  body: string;
  createdAt: string;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
}
