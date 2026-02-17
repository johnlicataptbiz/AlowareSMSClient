import { Contact, Message } from '../types';

// Configuration
const API_TOKEN = "8DD5857C"; 
const BASE_URL = "https://app.aloware.com/api/v1/webhook";
const DEFAULT_FROM_NUMBER = "+18552562001"; // Default Line
const DEFAULT_AGENT_ID = "1"; // Default User ID for actions

// Helper for consistent headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

/**
 * Send an SMS or MMS via Aloware API
 * Endpoint: POST /api/v1/webhook/sms-gateway/send
 */
export const sendSMS = async (to: string, message: string, mediaUrl?: string): Promise<boolean> => {
  try {
    const payload: any = {
      api_token: API_TOKEN,
      from: DEFAULT_FROM_NUMBER,
      to: to,
      message: message
    };

    if (mediaUrl) {
      payload.image_url = mediaUrl;
    }

    console.log(`[Aloware API] Sending SMS to ${to}`);
    const response = await fetch(`${BASE_URL}/sms-gateway/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Aloware SMS Failed:', err);
        return false;
    }
    return true;
  } catch (error) {
    console.error("Aloware SMS Network Error:", error);
    return false;
  }
};

/**
 * Initiate a Two-Legged Call (Click-to-Call)
 * Endpoint: POST /api/v1/webhook/two-legged-call
 */
export const initiateCall = async (contactPhoneNumber: string, userId: string = DEFAULT_AGENT_ID): Promise<boolean> => {
  try {
    console.log(`[Aloware API] Initiating call to ${contactPhoneNumber}`);
    const response = await fetch(`${BASE_URL}/two-legged-call`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        api_token: API_TOKEN,
        user_id: userId,
        user_phone_number: "+18181234567", // Agent's physical device/number
        contact_phone_number: contactPhoneNumber,
        line_phone_number: DEFAULT_FROM_NUMBER
      })
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Aloware Call Failed:', err);
        return false;
    }
    return true;
  } catch (error) {
    console.error("Aloware Call Network Error:", error);
    return false;
  }
};

/**
 * Enroll a contact into a sequence
 * Endpoint: POST /api/v1/webhook/sequence-enroll
 * Automatically detects if contactIdentifier is a phone number or Aloware ID
 */
export const enrollInSequence = async (contactIdentifier: string, sequenceId: string): Promise<boolean> => {
  try {
    // Heuristic: If it contains '+' or is long digits, assume phone number. Otherwise assume ID.
    const isPhoneNumber = contactIdentifier.includes('+') || (contactIdentifier.length >= 10 && !isNaN(Number(contactIdentifier)));
    
    const payload: any = {
      api_token: API_TOKEN,
      sequence_id: sequenceId,
      force_enroll: true,
      source: isPhoneNumber ? 'phone_number' : 'aloware'
    };

    if (isPhoneNumber) {
        payload.phone_number = contactIdentifier;
    } else {
        payload.id = contactIdentifier;
    }

    console.log(`[Aloware API] Enrolling ${contactIdentifier} into sequence ${sequenceId}`);
    const response = await fetch(`${BASE_URL}/sequence-enroll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Aloware Enrollment Failed:', err);
        return false;
    }
    return true;
  } catch (error) {
    console.error("Aloware Sequence Network Error:", error);
    return false;
  }
};

/**
 * Disenroll a contact from all sequences
 * Endpoint: POST /api/v1/webhook/sequence-disenroll
 */
export const disenrollFromSequence = async (contactIdentifier: string): Promise<boolean> => {
    try {
      const isPhoneNumber = contactIdentifier.includes('+') || (contactIdentifier.length >= 10 && !isNaN(Number(contactIdentifier)));
      
      const payload: any = {
        api_token: API_TOKEN,
        source: isPhoneNumber ? 'phone_number' : 'aloware'
      };
  
      if (isPhoneNumber) {
          payload.phone_number = contactIdentifier;
      } else {
          payload.id = contactIdentifier;
      }
  
      console.log(`[Aloware API] Disenrolling ${contactIdentifier}`);
      const response = await fetch(`${BASE_URL}/sequence-disenroll`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) return false;
      return true;
    } catch (error) {
      console.error("Aloware Disenroll Error:", error);
      return false;
    }
  };

/**
 * Perform an LRN / Carrier Lookup on a number
 * Endpoint: POST /api/v1/webhook/lookup
 */
export const lookupNumber = async (phoneNumber: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/lookup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        api_token: API_TOKEN,
        phone_number: phoneNumber
      })
    });

    if (!response.ok) throw new Error('Lookup Request Failed');
    return await response.json();
  } catch (error) {
    console.error("Aloware Lookup Error:", error);
    // Return mock fallback to avoid breaking UI
    return {
        carrier: "Unknown",
        line_type: "Unknown",
        data: { city: "N/A", state: "N/A" }
    };
  }
};

/**
 * Get list of Users (Agents) and their status
 * Endpoint: GET /api/v1/webhook/users
 */
export const getUsers = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${BASE_URL}/users?api_token=${API_TOKEN}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Aloware GetUsers Error:", error);
        return [];
    }
}

/**
 * Check Inbox Availability (Active Agents)
 * Endpoint: GET /api/v1/webhook/ring-group/availability
 */
export const getInboxAvailability = async (ringGroupId: string): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/ring-group/availability?api_token=${API_TOKEN}&ring_group_id=${ringGroupId}`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Aloware Availability Error:", error);
        return null;
    }
}