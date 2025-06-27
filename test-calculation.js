// Test script to verify water allocation calculations for Barangay 5
// Emergency duration: 3 hours

// Barangay 5 data
const currentFlowRate = 28; // L/s
const dropRate = 1.2; // L/s/hr
const emergencyDuration = 3; // hours
const threshold = 20; // L/s

// Calculate target flow rate
const dropRatePerSecond = dropRate / 3600; // 0.000333 L/s
const targetFlowRate = threshold + (dropRatePerSecond * emergencyDuration * 3600);
console.log(`Target Flow Rate: ${targetFlowRate} L/s`);

// Calculate max safe donation
const maxSafeDonation = Math.max(0, (currentFlowRate - targetFlowRate) * 3600);
console.log(`Max Safe Donation: ${maxSafeDonation.toLocaleString()} L`);

// Calculate flow rate after emergency
const flowRateAfterEmergency = Math.max(0, currentFlowRate - (dropRatePerSecond * emergencyDuration * 3600));
console.log(`Flow Rate After Emergency: ${flowRateAfterEmergency} L/s`);

// Calculate excess water after emergency
const excessFlowRate = Math.max(0, flowRateAfterEmergency - targetFlowRate);
const excessWater = excessFlowRate * emergencyDuration * 3600;
console.log(`Excess Water After Emergency: ${excessWater.toLocaleString()} L`);

// Old calculation (minimum of maxSafeDonation and excessWater)
const oldCalculation = Math.min(maxSafeDonation, excessWater);
console.log(`Old Calculation (min): ${oldCalculation.toLocaleString()} L`);

// New calculation (using maxSafeDonation)
const newCalculation = maxSafeDonation;
console.log(`New Calculation (maxSafeDonation): ${newCalculation.toLocaleString()} L`);

console.log('\nExpected result: Barangay 5 should donate 15,840L, not 8,640L'); 