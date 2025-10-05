# SharkTrack Smart Tag – Conceptual Technical Proposal

This document presents the **conceptual design** of the SharkTrack Smart Tag, a device intended to monitor shark movements, foraging behavior, and environmental conditions. This is a **technical proposal**; the tag is not yet implemented.  

---

## 1. Overview

Sharks are **keystone species** that maintain marine ecosystem balance. Tracking their movements and diet is crucial for:

- **Ecology:** Detect deviations in normal movement patterns  
- **Fisheries management:** Identify interactions with commercial species  
- **Conservation:** Protect vulnerable or endangered species  

The Smart Tag is designed to be **autonomous, modular, and minimally invasive**, providing high-resolution behavioral and environmental data while respecting the animal’s natural behavior.

## 2. Sensors

The Smart Tag combines **conventional and behavioral sensors**:

- **Environmental Sensors:**  
  - Temperature  
  - Salinity / water composition  
  - Depth  
  - Geolocation (satellite-based)  

- **Behavioral Sensors:**  
  - Accelerometers to detect sudden movements (e.g., hunting or tail beats)  

- **Active Observation Systems:**  
  - **Sonar (DIDSON):** High-resolution ultrasonic mapping of the frontal area  
  - **Camera:** Behavior-triggered recording, activated during feeding events  

> Sensors generate a **complete environmental and behavioral profile**, enabling identification of prey, movement patterns, and habitat use.


## 3. Energy Management

Deploying sensors underwater faces **challenges of energy and communication**. The Smart Tag addresses this via:

- **Battery system** for primary operation  
- **Piezoelectric energy generation**, harvesting energy from shark swimming motion without affecting hydrodynamics or natural behavior  

### 3.1 Operational Modes
1. **Full Operation Mode**  
   - All sensors and observation systems active  
   - Piezoelectric generation supplements battery to extend high-capacity operation  

2. **Battery-Saving / Recharge Mode**  
   - Activated when battery drops below 20%  
   - Non-essential components (camera, sonar) deactivated  
   - Energy from movement is stored in the battery  

> This dynamic management ensures long-term deployment, maximizes data collection during high activity, and preserves energy during low activity periods.


## 4. Data Collection and Communication

- Environmental sensors continuously log temperature, salinity, depth, and geolocation  
- Accelerometer triggers camera and sonar during hunting or feeding  
- Data stored locally in regions without satellite connectivity  
- When a connection is available, all collected data is transmitted to servers for analysis  

### 4.1 Data Use

- Identify prey consumed and foraging areas  
- Track movement and habitat usage  
- Detect ecological anomalies (e.g., unusual migrations, shifts in diet)  
- Support predictive modeling and conservation strategies
- 

## 5. Tag Architecture

### 5.1 Design Philosophy

- **Modular design**: adaptable to target species  
- **Weight <5% of body mass** to minimize impact  
- **Corrosion and pressure resistant** for deep-sea deployment  

### 5.2 Configurations

#### 5.2.1 Sentinel Oceanic (Full Analysis)  
- **Target Species:** Tiger Shark (*Galeocerdo cuvier*)  
- **Sensors:** Sonar DIDSON, camera, GPS, environmental sensors, high-capacity piezoelectric system  
- **Use Case:** Detailed diet and behavior analysis in high human-interaction regions  

#### 5.2.2 Coastal Tracker (Essential Monitoring)  
- **Target Species:** Lemon Shark (*Negaprion brevirostris*) and juveniles  
- **Sensors:** GPS, accelerometers, depth sensor  
- **Use Case:** Long-term habitat mapping, particularly sensitive nursery areas  

## 6. Strategic Applications

- **Local:** Track species behavior, detect feeding on commercial fish or endangered species, understand local ecosystem dynamics  
- **Global Context:** Data can explain rare events, such as the appearance of certain sharks outside their normal range, by correlating environmental and prey data  
- **Scalability:** Conceptual design allows adaptation to other large marine predators worldwide


## 7. Challenges

- Engineering for **corrosion resistance** and **deep-sea pressure**  
- Avoid interference with natural behavior or local fauna  
- Maintaining **long-term energy autonomy**  
- Effective data storage and communication in remote areas  

## Notes

This document represents a **conceptual framework** for Smart Tag design and deployment. All systems are proposed for modeling and planning purposes and are not yet implemented.
