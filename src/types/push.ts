export interface PushSendResult {
  sent: number;
  total: number;
  removed: number;
  failed: number;
  statuses: number[];
}
