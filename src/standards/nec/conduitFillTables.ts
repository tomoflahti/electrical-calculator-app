/**
 * NEC Conduit Fill Tables
 * Standards: NEC Chapter 9, NEMA RN-1, UL 6
 */

import type { ConduitFill } from '../../types';

// NEC conduit fill specifications (NEC Chapter 9, Tables 4 and 5)
export const NEC_CONDUIT_FILLS: ConduitFill[] = [
  // EMT (Electrical Metallic Tubing)
  { conduitType: 'EMT', conduitSize: '1/2', fillArea: 0.304, maxFill40Percent: 0.122 },
  { conduitType: 'EMT', conduitSize: '3/4', fillArea: 0.533, maxFill40Percent: 0.213 },
  { conduitType: 'EMT', conduitSize: '1', fillArea: 0.864, maxFill40Percent: 0.346 },
  { conduitType: 'EMT', conduitSize: '1-1/4', fillArea: 1.496, maxFill40Percent: 0.598 },
  { conduitType: 'EMT', conduitSize: '1-1/2', fillArea: 2.036, maxFill40Percent: 0.814 },
  { conduitType: 'EMT', conduitSize: '2', fillArea: 3.356, maxFill40Percent: 1.342 },
  { conduitType: 'EMT', conduitSize: '2-1/2', fillArea: 5.858, maxFill40Percent: 2.343 },
  { conduitType: 'EMT', conduitSize: '3', fillArea: 8.846, maxFill40Percent: 3.538 },
  { conduitType: 'EMT', conduitSize: '3-1/2', fillArea: 11.545, maxFill40Percent: 4.618 },
  { conduitType: 'EMT', conduitSize: '4', fillArea: 14.753, maxFill40Percent: 5.901 },
  
  // PVC (Polyvinyl Chloride)
  { conduitType: 'PVC', conduitSize: '1/2', fillArea: 0.285, maxFill40Percent: 0.114 },
  { conduitType: 'PVC', conduitSize: '3/4', fillArea: 0.508, maxFill40Percent: 0.203 },
  { conduitType: 'PVC', conduitSize: '1', fillArea: 0.832, maxFill40Percent: 0.333 },
  { conduitType: 'PVC', conduitSize: '1-1/4', fillArea: 1.453, maxFill40Percent: 0.581 },
  { conduitType: 'PVC', conduitSize: '1-1/2', fillArea: 1.986, maxFill40Percent: 0.794 },
  { conduitType: 'PVC', conduitSize: '2', fillArea: 3.291, maxFill40Percent: 1.316 },
  { conduitType: 'PVC', conduitSize: '2-1/2', fillArea: 5.793, maxFill40Percent: 2.317 },
  { conduitType: 'PVC', conduitSize: '3', fillArea: 8.688, maxFill40Percent: 3.475 },
  { conduitType: 'PVC', conduitSize: '3-1/2', fillArea: 11.427, maxFill40Percent: 4.571 },
  { conduitType: 'PVC', conduitSize: '4', fillArea: 14.519, maxFill40Percent: 5.808 },
  
  // Steel (Rigid Steel Conduit)
  { conduitType: 'Steel', conduitSize: '1/2', fillArea: 0.304, maxFill40Percent: 0.122 },
  { conduitType: 'Steel', conduitSize: '3/4', fillArea: 0.533, maxFill40Percent: 0.213 },
  { conduitType: 'Steel', conduitSize: '1', fillArea: 0.864, maxFill40Percent: 0.346 },
  { conduitType: 'Steel', conduitSize: '1-1/4', fillArea: 1.496, maxFill40Percent: 0.598 },
  { conduitType: 'Steel', conduitSize: '1-1/2', fillArea: 2.036, maxFill40Percent: 0.814 },
  { conduitType: 'Steel', conduitSize: '2', fillArea: 3.356, maxFill40Percent: 1.342 },
  { conduitType: 'Steel', conduitSize: '2-1/2', fillArea: 5.858, maxFill40Percent: 2.343 },
  { conduitType: 'Steel', conduitSize: '3', fillArea: 8.846, maxFill40Percent: 3.538 },
  { conduitType: 'Steel', conduitSize: '3-1/2', fillArea: 11.545, maxFill40Percent: 4.618 },
  { conduitType: 'Steel', conduitSize: '4', fillArea: 14.753, maxFill40Percent: 5.901 },
  
  // IMC (Intermediate Metal Conduit)
  { conduitType: 'IMC', conduitSize: '1/2', fillArea: 0.342, maxFill40Percent: 0.137 },
  { conduitType: 'IMC', conduitSize: '3/4', fillArea: 0.586, maxFill40Percent: 0.234 },
  { conduitType: 'IMC', conduitSize: '1', fillArea: 0.959, maxFill40Percent: 0.384 },
  { conduitType: 'IMC', conduitSize: '1-1/4', fillArea: 1.647, maxFill40Percent: 0.659 },
  { conduitType: 'IMC', conduitSize: '1-1/2', fillArea: 2.225, maxFill40Percent: 0.890 },
  { conduitType: 'IMC', conduitSize: '2', fillArea: 3.630, maxFill40Percent: 1.452 },
  { conduitType: 'IMC', conduitSize: '2-1/2', fillArea: 6.135, maxFill40Percent: 2.454 },
  { conduitType: 'IMC', conduitSize: '3', fillArea: 9.180, maxFill40Percent: 3.672 },
  { conduitType: 'IMC', conduitSize: '3-1/2', fillArea: 11.990, maxFill40Percent: 4.796 },
  { conduitType: 'IMC', conduitSize: '4', fillArea: 15.279, maxFill40Percent: 6.112 },
  
  // RMC (Rigid Metal Conduit)
  { conduitType: 'RMC', conduitSize: '1/2', fillArea: 0.304, maxFill40Percent: 0.122 },
  { conduitType: 'RMC', conduitSize: '3/4', fillArea: 0.533, maxFill40Percent: 0.213 },
  { conduitType: 'RMC', conduitSize: '1', fillArea: 0.864, maxFill40Percent: 0.346 },
  { conduitType: 'RMC', conduitSize: '1-1/4', fillArea: 1.496, maxFill40Percent: 0.598 },
  { conduitType: 'RMC', conduitSize: '1-1/2', fillArea: 2.036, maxFill40Percent: 0.814 },
  { conduitType: 'RMC', conduitSize: '2', fillArea: 3.356, maxFill40Percent: 1.342 },
  { conduitType: 'RMC', conduitSize: '2-1/2', fillArea: 5.858, maxFill40Percent: 2.343 },
  { conduitType: 'RMC', conduitSize: '3', fillArea: 8.846, maxFill40Percent: 3.538 },
  { conduitType: 'RMC', conduitSize: '3-1/2', fillArea: 11.545, maxFill40Percent: 4.618 },
  { conduitType: 'RMC', conduitSize: '4', fillArea: 14.753, maxFill40Percent: 5.901 }
];

// NEC conduit fill percentages (NEC Chapter 9, Table 1)
export const NEC_CONDUIT_FILL_PERCENTAGES = {
  // Maximum fill percentages for different numbers of conductors
  1: 53,   // Single conductor
  2: 31,   // Two conductors
  3: 40,   // Three or more conductors
  multiple: 40  // Default for multiple conductors
};

// NEC conduit types and their properties
export const NEC_CONDUIT_TYPES = {
  EMT: {
    name: 'Electrical Metallic Tubing',
    standard: 'UL 797',
    applications: ['Dry locations', 'Wet locations with suitable fittings', 'Concrete encasement'],
    restrictions: ['Not suitable for severe corrosive conditions']
  },
  PVC: {
    name: 'Polyvinyl Chloride',
    standard: 'UL 651',
    applications: ['Underground', 'Concrete encasement', 'Corrosive environments'],
    restrictions: ['Temperature limitations', 'UV exposure without protection']
  },
  Steel: {
    name: 'Rigid Steel Conduit',
    standard: 'UL 6',
    applications: ['Hazardous locations', 'Severe mechanical damage', 'High temperature'],
    restrictions: ['Corrosive environments without protection']
  },
  IMC: {
    name: 'Intermediate Metal Conduit',
    standard: 'UL 1242',
    applications: ['Between rigid and EMT applications', 'Moderate mechanical protection'],
    restrictions: ['Not for severe corrosive conditions']
  },
  RMC: {
    name: 'Rigid Metal Conduit',
    standard: 'UL 6',
    applications: ['Maximum mechanical protection', 'Hazardous locations', 'High temperature'],
    restrictions: ['Cost consideration', 'Installation complexity']
  }
};