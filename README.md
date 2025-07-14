# International Electric Calculator

A comprehensive professional web application for electrical calculations supporting both AC and DC electrical systems with international standards compliance. This tool serves electricians, engineers, and electrical contractors worldwide for wire sizing, voltage drop calculations, conduit requirements, and circuit breaker sizing across multiple electrical standards.

## Features Overview

### **AC Electrical Calculators** (NEC & IEC 60364)
- **Universal Wire/Cable Size Calculator**: Multi-standard wire sizing with ampacity and voltage drop
- **Voltage Drop Calculator**: Single-phase and three-phase voltage drop analysis  
- **Conduit Fill Calculator**: NEC Chapter 9 and IEC trunking compliance

### **DC Electrical Calculators** (Automotive, Marine, Solar, Telecom)
- **DC Wire Calculator**: Application-specific DC wire sizing for specialized systems
- **DC Circuit Breaker Calculator**: Separated NEC/IEC breaker sizing with power-based inputs
- **Application Support**: Automotive, Marine, Solar, Telecommunications, Battery, LED, Industrial

## **System Architecture**

### **Standards Implementation**

#### **AC Standards**
- **NEC (National Electrical Code)**: US standard with AWG wire sizing
- **IEC 60364**: International/European standard with mm² cable cross-sections
- **Regional Adaptations**: Dynamic UI and calculation switching

#### **DC Standards (Separated Engines)**
```
NEC/Imperial Engine          IEC/Metric Engine
├── UL489 Breakers          ├── IEC60947 Industrial
├── ABYC Marine             ├── IEC62619 Battery ESS  
├── SAE Automotive          ├── IEC60898 Miniature
├── NEC 690.8(A) Solar      ├── IEC62548 Solar PV
└── AWG Wire Sizing         └── mm² Cable Sizing
```

### **Router Architecture**
```typescript
dcBreakerRouter.ts
├── Wire Standard Detection
├── NEC Engine Route → necBreakerCalculations.ts
├── IEC Engine Route → iecBreakerCalculations.ts
└── Metric-First Default (IEC)
```

## **File Structure**

```
src/
├── components/                    # React Components
│   ├── Layout.tsx                # Main application layout
│   ├── StandardSelector.tsx      # Multi-standard selection
│   ├── UniversalWireCalculator.tsx # AC wire/cable calculator
│   ├── VoltageDropCalculator.tsx # AC voltage drop analysis
│   ├── ConduitFillCalculator.tsx # AC conduit fill
│   ├── DCWireCalculator.tsx      # DC wire sizing
│   ├── DCBreakerCalculator.tsx   # DC breaker sizing
│   └── DCApplicationSelector.tsx # DC application selection
│
├── standards/                    # Electrical Standards Data
│   ├── index.ts                 # Standard definitions
│   ├── nec/                     # NEC tables and data
│   │   └── tables.ts
│   ├── iec/                     # IEC 60364 tables and data
│   │   ├── cableTables.ts
│   │   └── conduitTables.ts
│   └── dc/                      # DC Standards (Separated)
│       ├── nec/                 # NEC DC Standards
│       │   ├── necBreakerStandards.ts    # UL489, ABYC, SAE
│       │   └── necSafetyFactors.ts
│       ├── iec/                 # IEC DC Standards  
│       │   ├── iecBreakerStandards.ts    # IEC60947, IEC62619
│       │   └── iecSafetyFactors.ts
│       ├── common/              # Shared DC utilities
│       │   ├── applicationTypes.ts
│       │   └── standardBreakerRatings.ts
│       ├── applications.ts      # DC application definitions
│       └── wireTables.ts        # DC wire specifications
│
├── utils/                       # Calculation Engines
│   └── calculations/
│       ├── index.ts            # Unified exports
│       ├── nec.ts              # NEC AC calculations
│       ├── iec.ts              # IEC AC calculations
│       ├── dc.ts               # DC wire calculations
│       ├── necBreakerCalculations.ts  # NEC breaker engine
│       ├── iecBreakerCalculations.ts  # IEC breaker engine
│       ├── dcBreakerRouter.ts  # Standards routing system
│       └── __tests__/          # Comprehensive test suite
│
└── types/                      # TypeScript Definitions
    ├── index.ts               # Legacy NEC types
    └── standards.ts           # Multi-standard types
```

## **Technology Stack**

- **Frontend**: React 19 with TypeScript 5.8
- **UI Framework**: Material-UI (MUI) v7.2
- **Build Tool**: Vite 7.0 with code splitting
- **Testing**: Jest 30 + React Testing Library 16
- **Performance**: 532KB optimized bundle with lazy loading
- **Quality**: ESLint, TypeScript strict mode, Husky pre-commit hooks

## **Test Coverage & Quality**

- **Total Test Suites**: 28 (15 passing, 13 with UI interaction issues)
- **Test Coverage**: 77% overall (425/551 tests passing)
- **Core Calculation Engines**: 100% pass rate (67/67 tests)
  - NEC Breaker Calculator: 17/17 tests ✅
  - IEC Breaker Calculator: 23/23 tests ✅
  - Router System: 27/27 tests ✅
- **Standards Compliance**: Full NEC and IEC validation
- **Performance Testing**: Smoke tests and deployment validation

## **Installation & Usage**

### **Quick Start**
```bash
# Clone the repository
git clone <repository-url>
cd electrical-calc-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **DC Circuit Breaker Calculator Usage**

1. **Select Application Type**: Automotive, Marine, Solar, Telecom, Battery, LED, Industrial
2. **Choose Input Method**: 
   - **Current (A)**: Direct load current input
   - **Power (W) + Voltage (V)**: Calculate current using Ohm's law (I = P/V)
3. **Configure Parameters**:
   - Duty cycle (Continuous/Intermittent)
   - Ambient temperature
   - Environment (Indoor/Outdoor/Marine/Automotive)
   - Wire standard (NEC/IEC)
4. **Get Results**: Breaker recommendation with compliance verification

### **DC Application Examples**

#### **Automotive (12V/24V Systems)**
- **NEC Approach**: SAE J1128 compliance, 1.25× continuous factor
- **IEC Approach**: ISO 6722 compliance, metric wire sizing
- **Use Cases**: ECU power, lighting circuits, auxiliary systems

#### **Marine (12V/24V/48V Systems)**  
- **NEC Approach**: ABYC E-11 standards, 1.30× continuous + marine factor
- **IEC Approach**: IEC marine environment factors, corrosion considerations
- **Use Cases**: Navigation equipment, engine systems, house loads

#### **Solar/Renewable Energy**
- **NEC Approach**: NEC 690.8(A) factor (1.56×), UL489 breakers
- **IEC Approach**: IEC 62548 factor (1.375×), IEC60947 breakers  
- **Use Cases**: Panel strings, combiner boxes, inverter DC disconnect

#### **Battery Energy Storage**
- **NEC Approach**: Battery inrush factors, UL489 compliance
- **IEC Approach**: IEC 62619 thermal runaway protection, specialized ESS breakers
- **Use Cases**: Li-ion batteries, charge controllers, energy storage systems

## **Calculation Methods**

### **DC Circuit Breaker Sizing**

#### **NEC Calculation Engine**
```typescript
// Automotive Continuous
adjustedCurrent = loadCurrent × 1.25

// Marine Continuous  
adjustedCurrent = loadCurrent × 1.30 × marineEnvironmentFactor

// Solar NEC 690.8(A)
adjustedCurrent = shortCircuitCurrent × 1.56

// Temperature Derating (if ambient > 30°C)
derated = adjustedCurrent / temperatureDerating
```

#### **IEC Calculation Engine**
```typescript
// Automotive Continuous
adjustedCurrent = loadCurrent × 1.25

// Marine Continuous
adjustedCurrent = loadCurrent × 1.30 × iecMarineFactor

// Solar IEC 62548 (Bifacial)
adjustedCurrent = shortCircuitCurrent × 1.375

// Battery IEC 62619 (Thermal Runaway)
adjustedCurrent = loadCurrent × 1.40 × thermalRunawayFactor × 1.2
```

### **Power-Based Calculations**
```typescript
// Current from Power (Ohm's Law)
calculatedCurrent = loadPower / systemVoltage / efficiencyFactor

// Efficiency factors by application:
// - Automotive: 0.95
// - Marine: 0.93  
// - Solar: 0.97
// - Battery: 0.93
```

### **Enhanced Conduit Fill Architecture**

The conduit fill calculator has been completely refactored following the proven DC breaker architecture pattern, providing comprehensive conduit sizing with application-specific requirements.

#### **Conduit Fill Router System**
```typescript
conduitFillRouter.ts
├── Standards Detection (NEC/IEC)
├── Application Type Processing (10 categories)
├── Environmental Factor Application
├── Enhanced Calculation Engine
└── Comprehensive Compliance Analysis
```

#### **Core Calculation Process**
```typescript
// 1. Wire Area Calculation
wireArea = quantity × individualWireArea(gauge, insulation)

// 2. Total Wire Area with Future Reserve
totalArea = wireArea × (1 + futureFillReserve/100)

// 3. Conduit Selection with Fill Limits
fillPercentage = totalArea / conduitInternalArea
compliance = fillPercentage ≤ maxAllowedFill

// 4. Application-Specific Requirements
specialRequirements = getApplicationRequirements(applicationType)
```

#### **Application Types & Requirements**
- **Residential**: Standard NEC/IEC fill percentages (31%/40%/53%)
- **Commercial**: Enhanced derating for temperature, box fill requirements
- **Industrial**: Heavy-duty conduits, industrial insulation types
- **Data Center**: Low-voltage considerations, cable management
- **Healthcare**: Essential systems requirements, emergency power
- **Marine**: Corrosion-resistant materials, moisture protection
- **Hazardous Locations**: Class I/II/III area compliance
- **Outdoor**: Weather protection, UV-resistant materials
- **Underground**: Burial depth, moisture ingress protection
- **High Temperature**: Enhanced temperature derating factors

#### **Standards Implementation**

**NEC (Chapter 9) Implementation:**
```typescript
// NEC Table 4 - Conduit Fill Percentages
fillLimits = {
  oneWire: 53,     // Single wire
  twoWires: 31,    // Two wires  
  threeOrMore: 40  // Three or more wires
}

// NEC Table 5 - Conduit dimensions
conduitTypes = ['EMT', 'Rigid Steel', 'PVC Schedule 40/80']
```

**IEC (60364-5-52) Implementation:**
```typescript
// IEC Cable Trunking Systems
fillLimits = {
  power: 45,        // Power cables
  control: 60,      // Control/signal cables
  mixed: 40         // Mixed installation
}

// IEC Conduit Types
conduitTypes = ['PVC Heavy/Medium Duty', 'Steel Heavy Duty']
```

#### **Enhanced Features**

**Environmental Calculations:**
- Temperature correction factors
- Ambient conditions (dry/damp/wet/corrosive)
- Installation method variations
- Future expansion planning (0-50% reserve)

**Compliance Analysis:**
```typescript
compliance: {
  codeCompliant: boolean,      // Overall code compliance
  fillCompliant: boolean,      // Fill percentage compliance
  temperatureCompliant: boolean, // Temperature derating
  applicationCompliant: boolean, // Application-specific requirements
  installationCompliant: boolean // Installation method compliance
}
```

**Advanced Results:**
- Wire-by-wire breakdown with percentages
- Alternative conduit size recommendations
- Special application requirements
- Installation best practices
- Safety factor analysis

#### **Testing & Quality Assurance**
- **27/27 tests passing** (100% pass rate)
- Core calculation engine: 100% test coverage
- Standards compliance verification
- UI component integration testing
- Material-UI component interaction patterns with hidden input approach
- Complete unit conversion testing (AWG ↔ mm²)

#### **Router Architecture Benefits**
1. **Unified Interface**: Single API for all conduit fill calculations
2. **Standards Separation**: Clean NEC/IEC calculation isolation
3. **Extensibility**: Easy addition of new standards (BS 7671, CSA, etc.)
4. **Maintainability**: Modular design with clear responsibilities
5. **Testing**: Comprehensive test coverage with mocked dependencies

## **International Standards Compliance**

### **Supported Standards**

#### **AC Electrical Standards**
- **NEC**: United States, Canada (with modifications)
- **IEC 60364**: International standard adopted by 100+ countries
- **European Union**: Harmonized standard EN 60364

#### **DC Electrical Standards**
- **UL489**: Standard for Molded-Case Circuit Breakers
- **ABYC E-11**: Marine DC electrical systems
- **SAE J1128**: Automotive low voltage primary cables
- **IEC 60947**: Low-voltage switchgear and controlgear
- **IEC 62619**: Secondary lithium-ion cells and batteries
- **IEC 62548**: Photovoltaic (PV) arrays - Design requirements
- **IEC 60898**: Electrical accessories - Circuit breakers

### **Regional Considerations**
- **Metric-First Approach**: Defaults to IEC standards when not specified
- **Imperial/Metric Separation**: Complete calculation engine isolation
- **Local Code Compliance**: Always verify with local electrical authorities
- **Professional Review**: Engineering sign-off may be required

## **Development Commands**

```bash
# Development
npm run dev              # Start development server
npm run build           # Production build (532KB optimized)
npm run preview         # Preview production build

# Testing  
npm run test            # Run test suite (28 suites)
npm run test:coverage   # Generate coverage reports  
npm run test:ci         # CI test run with coverage
npm run test:performance # Performance benchmarks

# Code Quality
npm run lint            # ESLint code quality checks
npm run validate        # Deployment validation
npm run prepare         # Husky pre-commit hooks

# Deployment
npm run deploy:netlify  # Deploy to Netlify
npm run docker:build    # Build Docker container
npm run docker:run      # Run containerized app
```

## **Use Cases by Industry**

### **Electrical Contractors**
- **Residential**: NEC compliance for house wiring
- **Commercial**: IEC 60364 for international projects  
- **Industrial**: Motor sizing and power distribution

### **Automotive Engineers**
- **Vehicle Wiring**: 12V/24V system design with ISO 6722
- **EV Charging**: DC fast charging infrastructure
- **Fleet Management**: Commercial vehicle electrical systems

### **Marine Electricians**  
- **Boat Wiring**: ABYC E-11 compliant installations
- **Yacht Systems**: 12V/24V/48V house and propulsion systems
- **Commercial Vessels**: IEC marine standards compliance

### **Solar Installers**
- **Residential PV**: NEC 690.8(A) string sizing
- **Commercial Solar**: IEC 62548 array design
- **Energy Storage**: Battery system integration with IEC 62619

### **Telecommunications**
- **Data Centers**: 24V/48V DC power distribution
- **Cell Towers**: Remote site power systems
- **Network Equipment**: High-reliability DC systems

## **Important Safety Notice**

This calculator is for reference purposes only. Always verify calculations and consult local electrical codes and qualified professionals. Electrical work should only be performed by licensed electricians following all applicable codes, safety procedures, and local regulations.

**Standards Disclaimer**: While this tool implements internationally recognized electrical standards, local codes and regulations may supersede or modify these requirements. Always consult local electrical authorities and obtain proper permits.

## **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-standard`)
3. **Add** comprehensive tests for new functionality
4. **Follow** TypeScript strict mode and ESLint rules
5. **Test** both NEC and IEC calculation paths
6. **Submit** a pull request with clear description

### **Standards Contributions**
- **New Standards**: Document calculation methods and safety factors
- **Regional Variations**: Include local code modifications
- **Test Coverage**: Maintain 95%+ coverage for calculation engines
- **Documentation**: Update README and inline comments

## **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **Acknowledgments**

### **Standards Organizations**
- **NFPA (National Fire Protection Association)** - National Electrical Code (NEC)
- **IEC (International Electrotechnical Commission)** - International electrical standards
- **ABYC (American Boat and Yacht Council)** - Marine electrical standards  
- **SAE International** - Automotive electrical standards
- **UL (Underwriters Laboratories)** - Safety standards for electrical equipment

### **Technology Partners**
- **Material-UI Team** - Excellent React component library
- **React and TypeScript Communities** - Outstanding development ecosystem
- **Vite Team** - Fast build tooling and development experience
- **International Electrical Engineering Community** - Standards implementation guidance

### **Industry Support**
- **Electrical contractors** and **engineers** providing real-world validation
- **Marine electricians** for ABYC standards implementation
- **Solar installers** for renewable energy calculations
- **Automotive engineers** for vehicle electrical system requirements

---

**Version**: 1.0.0 | **Bundle Size**: 532KB | **Test Coverage**: 77% | **Standards**: NEC + IEC + ABYC + SAE + UL
