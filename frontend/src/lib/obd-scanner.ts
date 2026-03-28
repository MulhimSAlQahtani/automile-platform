import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

export interface ObdData {
  rpm: number;
  coolantTemp: number; // Celsius
  throttlePosition: number; // 0-100%
  speed: number; // km/h
  engineLoad: number; // 0-100%
  dtcList: string[]; // e.g. ["P0300", "P0420"]
}

// Standard OBD-II Parameter IDs (PIDs) Mode 01
const OBD_PIDS = {
  ENGINE_LOAD: "0104\r",
  COOLANT_TEMP: "0105\r",
  ENGINE_RPM: "010C\r",
  VEHICLE_SPEED: "010D\r",
  THROTTLE_POS: "0111\r",
  READ_DTC: "03\r",
  CLEAR_DTC: "04\r"
};

type ObdConnectionState = 'DISCONNECTED' | 'SCANNING' | 'CONNECTING' | 'CONNECTED';

export class ObdScanner {
  private deviceId: string | null = null;
  private isSimulating: boolean = false;
  private state: ObdConnectionState = 'DISCONNECTED';
  
  // Custom Hook to broadcast live data chunks up to the UI
  public onDataUpdate: ((data: Partial<ObdData>) => void) | null = null;
  public onStateChange: ((state: ObdConnectionState) => void) | null = null;

  private setState(newState: ObdConnectionState) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  // Parses raw ELM327 HEX payload into Integer
  private parseHexResponse(hexString: string, pid: string): number | null {
    // Standard response for Mode 01 is 41 followed by PID (e.g. 41 0C ...)
    const cleanHex = hexString.replace(/\s+/g, '').toUpperCase();
    if (!cleanHex.includes("41" + pid)) return null;

    const dataStartIndex = cleanHex.indexOf("41" + pid) + 4;
    const dataHex = cleanHex.substring(dataStartIndex);
    
    // Integer Bytes
    const A = parseInt(dataHex.substring(0, 2), 16);
    const B = parseInt(dataHex.substring(2, 4), 16) || 0;

    switch (pid) {
      case "0C": return ((A * 256) + B) / 4; // RPM
      case "05": return A - 40; // °C
      case "0D": return A; // km/h
      case "11": return (A * 100) / 255; // Throttle %
      case "04": return (A * 100) / 255; // Engine Load %
      default: return null;
    }
  }

  // Connects to the physical OBD-II Dongle via BLE
  public async connectHardware() {
    try {
      this.setState('SCANNING');
      await BleClient.initialize();
      
      const device = await BleClient.requestDevice({
        // Common OBD-II BLE UUIDs pattern
        services: [], 
        optionalServices: ['0000fff0-0000-1000-8000-00805f9b34fb'] 
      });

      this.setState('CONNECTING');
      await BleClient.connect(device.deviceId, (id) => this.handleDisconnect(id));
      this.deviceId = device.deviceId;
      
      this.setState('CONNECTED');
      // Initialize ELM327 Protocol Commands here: ATZ, ATE0, ATL0
      
    } catch (error) {
      console.error("BLE OBD Error:", error);
      this.setState('DISCONNECTED');
      throw error;
    }
  }

  // Safely fallback to Mock data for Web preview testing
  public startSimulator() {
    this.isSimulating = true;
    this.setState('CONNECTED');
    
    // Simulate live engine oscillations
    setInterval(() => {
      if (!this.isSimulating) return;
      
      // Generate realistic randomized engine data
      const mockRPM = Math.floor(Math.random() * (2200 - 1800) + 1800);
      const mockSpeed = Math.floor(Math.random() * (105 - 95) + 95);
      const mockTemp = Math.floor(Math.random() * (95 - 88) + 88);
      const mockThrottle = Math.floor(Math.random() * (25 - 15) + 15);
      
      if (this.onDataUpdate) {
        this.onDataUpdate({
          rpm: mockRPM,
          speed: mockSpeed,
          coolantTemp: mockTemp,
          throttlePosition: mockThrottle,
          engineLoad: 35
        });
      }
    }, 500); // Pulse every 500ms
  }

  public async readDiagnosticTroubleCodes(): Promise<string[]> {
    if (this.isSimulating) {
      return ["P0300", "P0420"]; // Mock codes
    }
    // Physical BLE read logic requesting Mode 03 goes here
    return [];
  }

  public async clearCheckEngineLight(): Promise<boolean> {
    if (this.isSimulating) {
      console.log("Mock: Clearing Check Engine Light...");
      return true;
    }
    // Transmit `04\r` across the BLE Characteristic to the physical ECM
    return true;
  }

  private handleDisconnect(deviceId: string) {
    console.log(`OBD Device ${deviceId} unexpectedly disconnected.`);
    this.deviceId = null;
    this.setState('DISCONNECTED');
  }

  public async disconnect() {
    this.isSimulating = false;
    if (this.deviceId) {
      await BleClient.disconnect(this.deviceId);
      this.deviceId = null;
    }
    this.setState('DISCONNECTED');
  }
}

// Global Singleton Instance
export const obdCore = new ObdScanner();
