
import { FlightData } from '../types';

/**
 * Standard IATA BCBP M1 Format Parser
 * Format example: M1SMITH/JOHN EABC123 LHRJFKBA 0123 123Y012A0001 100
 */
export const parseBoardingPass = (raw: string): FlightData | null => {
  try {
    // Basic validation for M1 start
    if (!raw.startsWith('M1')) return null;

    const nameSection = raw.substring(2, 22).trim();
    const flightNumber = raw.substring(36, 40).trim();
    const julianDate = raw.substring(44, 47).trim();
    const seatNumber = raw.substring(50, 54).trim();

    return {
      passengerName: nameSection,
      flightNumber: flightNumber.padStart(4, '0'),
      date: julianDate,
      seat: seatNumber,
    };
  } catch (e) {
    console.error("Failed to parse BCBP", e);
    return null;
  }
};

export const generateChannelId = async (flight: string, date: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${flight}-${date}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};
