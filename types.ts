
export enum PacketType {
  TEXT = 0x01,
  HANDSHAKE = 0x02,
  PING = 0x03,
}

export interface BitchatPacket {
  type: PacketType;
  ttl: number;
  packetId: string; // 16-byte hex
  payload: string;
  senderSeat: string;
}

export interface PassengerProfile {
  seat: string;
  flight: string;
  date: string;
  channelId: string;
}

export interface MessageRecord {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
}

export interface FlightData {
  flightNumber: string;
  date: string;
  seat: string;
  passengerName: string;
}
