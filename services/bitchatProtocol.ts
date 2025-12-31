
import { PacketType, BitchatPacket } from '../types';

export class BitchatProtocol {
  private static MAX_PAYLOAD_SIZE = 500;

  /**
   * Simulates binary packet structure: [1-byte Type] [1-byte TTL] [16-byte PacketID] [Payload]
   */
  static constructPacket(
    type: PacketType,
    ttl: number,
    payload: string,
    seat: string
  ): BitchatPacket {
    const packetId = crypto.randomUUID().replace(/-/g, '').substring(0, 32);
    
    // In a real BLE implementation, we would convert this to a Uint8Array
    return {
      type,
      ttl,
      packetId,
      payload: payload.length > this.MAX_PAYLOAD_SIZE 
        ? payload.substring(0, this.MAX_PAYLOAD_SIZE) 
        : payload,
      senderSeat: seat
    };
  }

  /**
   * Fragmentation logic: Splits long text into chunks
   */
  static fragmentMessage(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.MAX_PAYLOAD_SIZE) {
      chunks.push(text.substring(i, i + this.MAX_PAYLOAD_SIZE));
    }
    return chunks;
  }
}
