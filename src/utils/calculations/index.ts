// Re-export existing NEC calculations for backward compatibility
export { 
  calculateWireSize, 
  calculateVoltageDrop, 
  calculateConduitFill 
} from './nec';

// Re-export IEC calculations
export { 
  calculateCableSizeIEC, 
  getIECCableSizes, 
  getIECCableData 
} from './iec';