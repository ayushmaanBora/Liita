
export enum PacketType {
  TEXT = 0x01,
  HANDSHAKE_REQ = 0x02,
  HANDSHAKE_ACC = 0x06,
  PING = 0x03,
  HEARTBEAT = 0x04,
  POLL = 0x05,
}

export interface UserProfile {
  name: string;
  bio: string;
  tags: string[];
  seat: string;
}

export interface BitchatPacket {
  type: PacketType;
  ttl: number;
  packetId: string;
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
  type?: PacketType;
}

export interface ManifestNode {
  profile: UserProfile;
  lastSeen: number;
  handshakeStatus: 'none' | 'pending' | 'accepted';
}

export interface FlightData {
  flightNumber: string;
  date: string;
  seat: string;
  passengerName: string;
}
