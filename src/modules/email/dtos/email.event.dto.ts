export interface EmailEvent {
  to: string;
  template_id: string;
  variables: Record<string, string>;
}
