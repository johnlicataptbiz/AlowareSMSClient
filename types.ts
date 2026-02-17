// Aloware API Mapped Types

export interface Contact {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone_number: string;
  email?: string;
  company_name?: string;
  lead_source?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  notes?: string;
  tags: string[]; // Simulated tag IDs
  avatar_url?: string;
}

export interface Message {
  id: string;
  contact_id: string;
  direction: 'inbound' | 'outbound';
  type: 'sms' | 'mms' | 'call' | 'system' | 'note';
  body: string; // The text content or call status
  created_at: string;
  user_id?: string; // ID of agent who sent it
  media_url?: string;
  duration?: number; // For calls
  disposition?: string; // Call outcome
}

export interface Sequence {
  id: string;
  name: string;
  steps_count: number;
  active_contacts: number;
}

export interface Enrollment {
  contact_id: string;
  sequence_id: string;
  status: 'active' | 'finished' | 'disenrolled';
  current_step: number;
  enrolled_at: string;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  agent_status: number; // 0: Offline, 1: Available, etc.
  human_readable_agent_status: string;
}

export interface RingGroupAvailability {
  available_users_count: number;
  unavailable_users_count: number;
  total_users_count: number;
}

// UI State Types
export type ViewState = 'inbox' | 'analytics' | 'settings';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}