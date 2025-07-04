import type {
  Barangay,
  PumpingStation,
  WaterTower,
  AssignmentMatrix,
  LiveBarangayData,
  LiveTowerData,
  UserInput,
  ShortagePrediction,
  WaterAllocation,
  StationAssignment,
  SystemState,
  TowerStationMapping
} from "./supabase"

// Algorithm 1: A* for Shortage Prediction (Barangay-level)
export function predictShortages(
  barangays: Barangay[],
  liveBarangayData: LiveBarangayData[],
  userInput: UserInput
): ShortagePrediction[] {
  const predictions: ShortagePrediction[] = barangays.map(barangay => {
    const liveData = liveBarangayData.find(d => d.barangayId === barangay.id)
    if (!liveData) {
      return {
        barangay,
        gScore: 0,
        hScore: Infinity,
        fScore: Infinity,
        timeToShortage: Infinity,
        status: "Safe"
      }
    }
    
    const threshold = liveData.threshold; // Use individual barangay threshold
    const gScore = 50 - liveData.currentFlowRate
    const hScore = liveData.dropRate > 0 ?
      (liveData.currentFlowRate - threshold) / liveData.dropRate :
      Infinity
    const fScore = gScore + hScore
    
    // Calculate dynamic target flow rate for this barangay
    const dropRatePerSecond = liveData.dropRate / 3600;
    const targetFlowRate = threshold + (dropRatePerSecond * userInput.emergencyDuration * 3600);
    
    let status: "Safe" | "Warning" | "Critical" = "Safe"
    if (liveData.currentFlowRate < threshold) {
      status = "Critical"
    } else if (liveData.currentFlowRate < targetFlowRate) {
      status = "Warning" // Will need water during emergency
    } else if (liveData.currentFlowRate === threshold || hScore <= 1) {
      status = "Warning"
    }
    
    // Compute water needed for barangays that need water to maintain safe flow rate throughout emergency
    let waterNeededToBeSafe: number | undefined = undefined;
    if (liveData) {
      // Calculate dynamic target flow rate for this barangay
      const dropRatePerSecond = liveData.dropRate / 3600;
      const targetFlowRate = threshold + (dropRatePerSecond * userInput.emergencyDuration * 3600);
      
      // Only calculate water needed if current flow rate is less than target flow rate
      if (liveData.currentFlowRate < targetFlowRate) {
        // Calculate water needed: (Target Flow Rate - Current Flow Rate) * 3600
        const flowRateDeficit = targetFlowRate - liveData.currentFlowRate;
        waterNeededToBeSafe = flowRateDeficit * 3600; // convert to liters
      } else {
        // Barangay doesn't need water - current flow rate is already sufficient
        waterNeededToBeSafe = 0;
    }
    }
    
    return {
      barangay,
      gScore: Math.round(gScore * 10) / 10,
      hScore: Math.round(hScore * 10) / 10,
      fScore: Math.round(fScore * 10) / 10,
      timeToShortage: Math.round(hScore * 10) / 10,
      status,
      waterNeededToBeSafe
    }
  })
  return predictions.sort((a, b) => b.fScore - a.fScore)
}

// Algorithm 2: Branch & Bound Knapsack for Water Allocation (Barangay to Barangay)
export function allocateWater(
  barangays: Barangay[],
  liveBarangayData: LiveBarangayData[],
  liveTowerData: LiveTowerData[],
  towerStationMapping: TowerStationMapping[],
  shortagePredictions: ShortagePrediction[],
  userInput: UserInput
): WaterAllocation[] {
  // Validate inputs
  if (!barangays || barangays.length === 0) {
    console.warn("No barangays provided for water allocation");
    return [];
  }
  
  if (!liveBarangayData || liveBarangayData.length === 0) {
    console.warn("No live barangay data provided for water allocation");
    return [];
  }
  
  if (!shortagePredictions || shortagePredictions.length === 0) {
    console.warn("No shortage predictions provided for water allocation");
    return [];
  }
  
  if (!userInput || userInput.emergencyDuration <= 0) {
    console.warn("Invalid emergency duration provided for water allocation");
    return [];
  }

  // Find barangays that need water (ALL barangays that will need water during emergency)
  const needyBarangays = shortagePredictions
    .filter(prediction => {
      const liveData = liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
      if (!liveData) {
        console.warn(`No live data found for barangay ${prediction.barangay.name} during allocation`);
        return false;
      }
      
      // Calculate dynamic target flow rate for this barangay
      const threshold = liveData.threshold; // Use individual barangay threshold
      const dropRatePerSecond = liveData.dropRate / 3600; // convert L/s/hr to L/s
      const targetFlowRate = threshold + (dropRatePerSecond * userInput.emergencyDuration * 3600);
      
      // Barangay needs water if current flow rate is less than target flow rate
      return liveData.currentFlowRate < targetFlowRate;
    })
    .map(prediction => ({
      barangay: prediction.barangay,
      waterNeeded: prediction.waterNeededToBeSafe || 0,
      priority: prediction.status === "Critical" ? 10 : 
                prediction.status === "Warning" ? 5 : 1, // Safe barangays get lowest priority
      status: prediction.status
    }))
    .sort((a, b) => b.priority - a.priority); // Sort by priority

  // Find barangays that can supply water (those with excess capacity after their own needs)
  // Calculate safe excess water that won't drop them below their target flow rate
  const potentialSuppliers = shortagePredictions
    .filter(prediction => {
      // Only consider barangays that won't run out of water during emergency
      return prediction.timeToShortage > userInput.emergencyDuration;
    })
    .map(prediction => {
      const liveData = liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
      if (!liveData) return null;
      
      try {
        // Calculate how much water they can safely share
        // They need to maintain at least their dynamic target flow rate throughout emergency
        const currentFlowRate = liveData.currentFlowRate;
        const dropRatePerSecond = liveData.dropRate / 3600;
        const flowRateAfterEmergency = Math.max(0, currentFlowRate - (dropRatePerSecond * userInput.emergencyDuration * 3600));
        
        // Calculate dynamic target flow rate for this barangay
        const threshold = liveData.threshold; // Use individual barangay threshold
        const targetFlowRate = threshold + (dropRatePerSecond * userInput.emergencyDuration * 3600);
        
        // Calculate maximum safe donation: (current flow rate - target flow rate) * 3600
        const maxSafeDonation = Math.max(0, (currentFlowRate - targetFlowRate) * 3600);
        
        // If they'll still be above their target after emergency, they can share excess
        const excessFlowRate = Math.max(0, flowRateAfterEmergency - targetFlowRate);
        const excessWater = excessFlowRate * userInput.emergencyDuration * 3600;
        
        // Use maxSafeDonation as the primary calculation - this represents the water they can safely share
        // without dropping below their target flow rate during the emergency
        const safeExcessWater = maxSafeDonation;

    return {
          barangay: prediction.barangay,
          excessWater: Math.max(0, safeExcessWater),
          currentFlowRate: liveData.currentFlowRate,
          safeFlowRate: targetFlowRate,
          availableFlowRate: safeExcessWater / (userInput.emergencyDuration * 3600),
          status: prediction.status,
          maxSafeDonation: maxSafeDonation,
          excessWaterAfterEmergency: excessWater
        };
      } catch (error) {
        console.error(`Error calculating excess water for barangay ${prediction.barangay.name}:`, error);
        return null;
      }
    })
    .filter((supplier): supplier is NonNullable<typeof supplier> => supplier !== null && supplier.excessWater > 0);

  // Calculate total available water from all sources
  const totalTowerWater = liveTowerData.reduce((sum, tower) => sum + (tower.currentWater || 0), 0);
  const totalExcessWater = potentialSuppliers.reduce((sum, supplier) => sum + supplier.excessWater, 0);
  const totalAvailableWater = totalTowerWater + totalExcessWater;

  // Track water usage from each source to prevent over-allocation
  const waterUsage = {
    towers: new Map<string, number>(), // towerId -> water used
    suppliers: new Map<string, number>() // barangayId -> water used
  };

  // Initialize tower usage tracking
  liveTowerData.forEach(tower => {
    waterUsage.towers.set(tower.towerId, 0);
  });

  // Branch & Bound Knapsack: Allocate water to needy barangays
  const allocations: WaterAllocation[] = [];

  for (const needyBarangay of needyBarangays) {
    let allocated = false;
    let waterAllocated = 0;
    let waterSources: string[] = [];

    try {
      // Calculate remaining available water from individual towers
      const remainingTowerWater = liveTowerData.reduce((sum, tower) => {
        const used = waterUsage.towers.get(tower.towerId) || 0;
        return sum + Math.max(0, (tower.currentWater || 0) - used);
      }, 0);
      const remainingSupplierWater = potentialSuppliers.reduce((sum, supplier) => {
        const used = waterUsage.suppliers.get(supplier.barangay.id) || 0;
        return sum + Math.max(0, supplier.excessWater - used);
      }, 0);
      const remainingTotalWater = remainingTowerWater + remainingSupplierWater;

      // Branch 1: Can we fully satisfy this barangay's needs?
      if (remainingTotalWater >= needyBarangay.waterNeeded) {
        allocated = true;
        waterAllocated = needyBarangay.waterNeeded;
        
        // Determine water sources (prioritize other barangays, then towers)
        let remainingNeed = needyBarangay.waterNeeded;
        
        // First, try to get water from other barangays (more efficient)
        // Prioritize barangays that won't go into shortage after emergency
        const sortedSuppliers = [...potentialSuppliers].sort((a, b) => {
          // Sort by time to shortage (longest first) to prioritize most stable suppliers
          const aPrediction = shortagePredictions.find(p => p.barangay.id === a.barangay.id);
          const bPrediction = shortagePredictions.find(p => p.barangay.id === b.barangay.id);
          return (bPrediction?.timeToShortage || 0) - (aPrediction?.timeToShortage || 0);
        });
        
        for (const supplier of sortedSuppliers) {
          if (remainingNeed <= 0) break;
          
          const used = waterUsage.suppliers.get(supplier.barangay.id) || 0;
          const available = Math.max(0, supplier.excessWater - used);
          const waterFromSupplier = Math.min(remainingNeed, available);
          
          if (waterFromSupplier > 0) {
            waterSources.push(`${supplier.barangay.name} (${waterFromSupplier.toLocaleString()}L)`);
            remainingNeed -= waterFromSupplier;
            
            // Update usage tracking
            waterUsage.suppliers.set(supplier.barangay.id, used + waterFromSupplier);
          }
        }
        
        // Then, get remaining water from towers (respecting individual tower capacities)
        if (remainingNeed > 0) {
          // Allocate from towers based on their individual capacities
          for (const mapping of towerStationMapping) {
            if (remainingNeed <= 0) break;
            
            const tower = liveTowerData.find(t => t.towerId === mapping.towerId);
            if (!tower) continue;
            
            const used = waterUsage.towers.get(tower.towerId) || 0;
            const available = Math.max(0, (tower.currentWater || 0) - used);
            
            // Additional safety check: ensure we never exceed tower capacity
            if (available <= 0) continue;
            
            const waterFromTower = Math.min(remainingNeed, available);
            
            if (waterFromTower > 0) {
              waterSources.push(`Water Station (${waterFromTower.toLocaleString()}L)`);
              remainingNeed -= waterFromTower;
              waterUsage.towers.set(tower.towerId, used + waterFromTower);
              
              // Log if we're using a significant portion of the tower's capacity
              const usagePercentage = ((used + waterFromTower) / tower.currentWater) * 100;
              if (usagePercentage > 80) {
                console.warn(`Tower ${tower.towerId} is ${usagePercentage.toFixed(1)}% utilized`);
              }
            }
          }
        }
      }
      // Branch 2: Can we partially satisfy this barangay's needs?
      else if (remainingTotalWater > 0) {
        allocated = true;
        waterAllocated = remainingTotalWater;
        
        // Allocate all remaining water
        let remainingNeed = remainingTotalWater;
        
        // From other barangays first (prioritized by stability)
        const sortedSuppliers = [...potentialSuppliers].sort((a, b) => {
          // Sort by time to shortage (longest first) to prioritize most stable suppliers
          const aPrediction = shortagePredictions.find(p => p.barangay.id === a.barangay.id);
          const bPrediction = shortagePredictions.find(p => p.barangay.id === b.barangay.id);
          return (bPrediction?.timeToShortage || 0) - (aPrediction?.timeToShortage || 0);
        });
        
        for (const supplier of sortedSuppliers) {
          if (remainingNeed <= 0) break;
          
          const used = waterUsage.suppliers.get(supplier.barangay.id) || 0;
          const available = Math.max(0, supplier.excessWater - used);
          const waterFromSupplier = Math.min(remainingNeed, available);
          
          if (waterFromSupplier > 0) {
            waterSources.push(`${supplier.barangay.name} (${waterFromSupplier.toLocaleString()}L)`);
            remainingNeed -= waterFromSupplier;
            waterUsage.suppliers.set(supplier.barangay.id, used + waterFromSupplier);
          }
        }
        
        // From towers (respecting individual tower capacities)
        if (remainingNeed > 0) {
          for (const mapping of towerStationMapping) {
            if (remainingNeed <= 0) break;
            
            const tower = liveTowerData.find(t => t.towerId === mapping.towerId);
            if (!tower) continue;
            
            const used = waterUsage.towers.get(tower.towerId) || 0;
            const available = Math.max(0, (tower.currentWater || 0) - used);
            
            // Additional safety check: ensure we never exceed tower capacity
            if (available <= 0) continue;
            
            const waterFromTower = Math.min(remainingNeed, available);
            
            if (waterFromTower > 0) {
              waterSources.push(`Water Station (${waterFromTower.toLocaleString()}L)`);
              remainingNeed -= waterFromTower;
              waterUsage.towers.set(tower.towerId, used + waterFromTower);
              
              // Log if we're using a significant portion of the tower's capacity
              const usagePercentage = ((used + waterFromTower) / tower.currentWater) * 100;
              if (usagePercentage > 80) {
                console.warn(`Tower ${tower.towerId} is ${usagePercentage.toFixed(1)}% utilized`);
              }
            }
          }
        }
      }
      // Branch 3: No water available (bound)
      else {
        allocated = false;
        waterAllocated = 0;
      }
    } catch (error) {
      console.error(`Error allocating water for barangay ${needyBarangay.barangay.name}:`, error);
      allocated = false;
      waterAllocated = 0;
    }

    allocations.push({
      barangay: needyBarangay.barangay,
      allocated,
      waterNeeded: needyBarangay.waterNeeded,
      waterAllocated,
      priority: needyBarangay.priority,
      status: needyBarangay.status,
      waterSources
    });
  }

  return allocations;
}

// Algorithm 3: Improved Heuristic Assignment for Water Distribution Network
export function assignStationsToBarangays(
  barangays: Barangay[],
  pumpingStations: PumpingStation[],
  assignmentMatrix: AssignmentMatrix[],
  waterAllocations: WaterAllocation[],
  liveBarangayData: LiveBarangayData[],
  shortagePredictions: ShortagePrediction[],
  liveTowerData: LiveTowerData[],
  towerStationMapping: TowerStationMapping[]
): StationAssignment[] {
  // Validate inputs
  if (!barangays || barangays.length === 0) {
    console.warn("No barangays provided for station assignment");
    return [];
  }
  
  if (!pumpingStations || pumpingStations.length === 0) {
    console.warn("No pumping stations provided for assignment");
    return [];
  }
  
  if (!assignmentMatrix || assignmentMatrix.length === 0) {
    console.warn("No assignment matrix provided");
    return [];
  }
  
  if (!waterAllocations || waterAllocations.length === 0) {
    console.warn("No water allocations provided for station assignment");
    return [];
  }

  // Get barangays that received water allocation
  const allocatedBarangays = waterAllocations.filter(wa => wa.allocated);

  // Track tower water usage to ensure we don't exceed tower capacities
  const towerWaterUsage = new Map<string, number>();
  liveTowerData.forEach(tower => {
    towerWaterUsage.set(tower.towerId, 0);
  });

  // Create water distribution network assignments
  const assignments: StationAssignment[] = [];

  // For each allocated barangay, determine the best pumping station for delivery
  for (const waterAllocation of allocatedBarangays) {
    const barangay = waterAllocation.barangay;
    
    try {
      // Check if this barangay received water from towers (not just from other barangays)
      const receivedFromTowers = waterAllocation.waterSources?.some(source => 
        source.includes("Water Station")
      );
      
      // Only assign pumping stations if the barangay received water from towers
      if (receivedFromTowers) {
        // Find all pumping stations that can serve this barangay
        const possibleStations = pumpingStations.filter(station => {
          const assignment = assignmentMatrix.find(am =>
            am.stationId === station.id && am.barangayId === barangay.id
          );
          return assignment !== undefined;
        });

        if (possibleStations.length > 0) {
          // Choose the nearest station for delivery
          const bestStation = possibleStations.reduce((nearest, station) => {
            const nearestDistance = assignmentMatrix.find(am =>
              am.stationId === nearest.id && am.barangayId === barangay.id
            )?.distance || Infinity;
            const stationDistance = assignmentMatrix.find(am =>
              am.stationId === station.id && am.barangayId === barangay.id
            )?.distance || Infinity;
            return stationDistance < nearestDistance ? station : nearest;
          });

          const distance = assignmentMatrix.find(am =>
            am.stationId === bestStation.id && am.barangayId === barangay.id
          )?.distance || 0;

          // Find the tower that supplies this station
          const towerMapping = towerStationMapping.find(mapping => mapping.stationId === bestStation.id);
          if (!towerMapping) {
            console.warn(`No tower mapping found for station ${bestStation.name}`);
            continue;
          }

          const tower = liveTowerData.find(t => t.towerId === towerMapping.towerId);
          if (!tower) {
            console.warn(`No tower data found for tower ${towerMapping.towerId}`);
            continue;
          }

          // Calculate how much water this station needs to deliver
          // Only count water that came from towers, not from other barangays
          const totalTowerWaterNeeded = waterAllocation.waterSources?.reduce((total, source) => {
            if (source.includes("Water Station")) {
              const match = source.match(/\(([^)]+)\)/);
              if (match) {
                const amount = parseInt(match[1].replace(/,/g, ''));
                return total + (isNaN(amount) ? 0 : amount);
              }
            }
            return total;
          }, 0) || 0;

          // Check if the tower has enough capacity to deliver this water
          const currentTowerUsage = towerWaterUsage.get(tower.towerId) || 0;
          const availableTowerWater = Math.max(0, tower.currentWater - currentTowerUsage);
          const actualWaterDelivered = Math.min(totalTowerWaterNeeded, availableTowerWater);

          if (actualWaterDelivered > 0) {
            // Update tower usage
            towerWaterUsage.set(tower.towerId, currentTowerUsage + actualWaterDelivered);

            // Create or update assignment for this station
            let existingAssignment = assignments.find(a => a.station.id === bestStation.id);
            
            if (existingAssignment) {
              // Add barangay to existing assignment
              existingAssignment.assignedBarangays.push(barangay);
              existingAssignment.totalWaterDelivered += actualWaterDelivered;
              existingAssignment.totalDistance += distance;
            } else {
              // Create new assignment
              assignments.push({
                station: bestStation,
                assignedBarangays: [barangay],
                totalWaterDelivered: actualWaterDelivered,
                totalDistance: distance
              });
            }

            // Log if we couldn't deliver the full amount
            if (actualWaterDelivered < totalTowerWaterNeeded) {
              console.warn(`Station ${bestStation.name} (Tower ${tower.towerId}) could only deliver ${actualWaterDelivered.toLocaleString()}L out of ${totalTowerWaterNeeded.toLocaleString()}L needed due to tower capacity limit`);
            }
          } else {
            console.warn(`Station ${bestStation.name} (Tower ${tower.towerId}) has no available water capacity`);
          }
        } else {
          console.warn(`No pumping stations can serve barangay ${barangay.name}`);
        }
      }
    } catch (error) {
      console.error(`Error assigning stations for barangay ${barangay.name}:`, error);
    }
  }

  return assignments;
}

// Main function to run all algorithms
export function runEmergencyWaterSystem(
  waterTowers: WaterTower[],
  pumpingStations: PumpingStation[],
  barangays: Barangay[],
  assignmentMatrix: AssignmentMatrix[],
  liveBarangayData: LiveBarangayData[],
  liveTowerData: LiveTowerData[],
  towerStationMapping: TowerStationMapping[],
  userInput: UserInput
): SystemState {
  // Validate all inputs
  if (!barangays || barangays.length === 0) {
    console.error("No barangays provided to emergency water system");
    throw new Error("No barangays provided");
  }
  
  if (!pumpingStations || pumpingStations.length === 0) {
    console.error("No pumping stations provided to emergency water system");
    throw new Error("No pumping stations provided");
  }
  
  if (!liveBarangayData || liveBarangayData.length === 0) {
    console.error("No live barangay data provided to emergency water system");
    throw new Error("No live barangay data provided");
  }
  
  if (!userInput || userInput.emergencyDuration <= 0) {
    console.error("Invalid emergency duration provided to emergency water system");
    throw new Error("Invalid emergency duration");
  }

  try {
  // Step 1: A* Shortage Prediction
  const shortagePredictions = predictShortages(barangays, liveBarangayData, userInput)

  // Step 2: Knapsack Water Allocation
    const waterAllocations = allocateWater(barangays, liveBarangayData, liveTowerData, towerStationMapping, shortagePredictions, userInput)

  // Step 3: Assignment Problem
  const stationAssignments = assignStationsToBarangays(
    barangays,
    pumpingStations,
    assignmentMatrix,
    waterAllocations,
      liveBarangayData,
      shortagePredictions,
      liveTowerData,
      towerStationMapping
  )

  // Calculate summary metrics
    const totalWaterNeeded = waterAllocations.reduce((sum, wa) => sum + (wa.waterNeeded || 0), 0)
    const totalWaterAvailable = liveTowerData.reduce((sum, tower) => sum + (tower.currentWater || 0), 0)
    const totalWaterAllocated = waterAllocations.reduce((sum, wa) => sum + (wa.waterAllocated || 0), 0)
    
    // Barangays Helped = number of barangays that can donate water (have excess capacity)
    const barangaysHelped = shortagePredictions.filter(prediction => {
      return prediction.timeToShortage > userInput.emergencyDuration;
    }).length
    
    // Barangays Needed Help = number of barangays that need water (are in waterAllocations)
    const barangaysNeededHelp = waterAllocations.length

  return {
      waterTowers: waterTowers || [],
      pumpingStations: pumpingStations || [],
      barangays: barangays || [],
      assignmentMatrix: assignmentMatrix || [],
      liveBarangayData: liveBarangayData || [],
      liveTowerData: liveTowerData || [],
    userInput,
      shortagePredictions: shortagePredictions || [],
      waterAllocations: waterAllocations || [],
      stationAssignments: stationAssignments || [],
    totalWaterNeeded,
    totalWaterAvailable,
    totalWaterAllocated,
    barangaysHelped,
      barangaysNeededHelp
    }
  } catch (error) {
    console.error("Error in emergency water system:", error);
    throw error;
  }
}

export type { ShortagePrediction, WaterAllocation, StationAssignment };
