export interface NotificationPersistEvent {
  user_id: string;
  message: string;
  metadata: {
    event_type: string;
    entity_id: string;
    entity_type: string;
  };
}
