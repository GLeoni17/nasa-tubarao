# SharkTrack Predictive Model – Conceptual Technical Proposal

This document presents the **conceptual design** of the SharkTrack Predictive Model, intended to forecast **shark foraging habitats** and support ecological monitoring and conservation. The model is currently **conceptual**; implementation requires real-world tag and satellite data.

---

## 1. Overview

Understanding where sharks forage is critical for:

- **Ecology:** Detecting unusual movement or feeding patterns  
- **Fisheries management:** Preventing overfishing of key prey species  
- **Conservation:** Protecting endangered sharks and vulnerable prey  

The predictive model integrates **satellite environmental data** with **in-situ measurements from Smart Tags** to identify high-probability foraging areas.  


## 2. Objectives

- Predict shark foraging habitats using environmental and behavioral data  
- Provide high-resolution spatial information for management and research  
- Enable integration with visualization platforms for real-time interpretation  
- Support early detection of ecological anomalies  


## 3. Input Data

The model combines multiple data sources:

### 3.1 NASA Satellite Data
- Sea Surface Temperature (SST)  
- Sea Surface Height anomalies (SSH)  
- Chlorophyll-a concentration  

### 3.2 Smart Tag Data
- Geolocation (latitude/longitude)  
- Depth and temperature profiles  
- Salinity and water composition  
- Behavioral events (e.g., feeding detected via accelerometer, sonar, camera)  


## 4. Methodology

- **Model Type:** Random Forest Machine Learning (conceptual)  
- **Rationale:**  
  - Handles nonlinear relationships between environmental variables and foraging probability  
  - Provides feature importance for ecological interpretability  
- **Processing Steps:**  
  1. Combine satellite and tag data into unified datasets  
  2. Train Random Forest to classify foraging vs. non-foraging locations  
  3. Generate confidence scores for each spatial coordinate  
  4. Update predictions in near-real-time when new tag or satellite data arrives  


## 5. Output

- Spatial maps indicating **likelihood of foraging activity**  
- Feature importance highlighting key environmental drivers  
- Temporal patterns of feeding behavior across tracked sharks  
- Data formatted for integration with the **SharkTrack visualization platform**  


## 6. Applications

- Identify hotspots for shark foraging  
- Support sustainable fisheries management (e.g., avoiding conflicts with commercial species)  
- Detect shifts in prey selection or unusual diet patterns  
- Inform conservation strategies for endangered species  
- Provide context for rare ecological events (e.g., anomalous migrations)  


## 7. Challenges

- **Data availability:** Relies on the collection of high-quality Smart Tag data combined with NASA satellite observations for accurate predictions.
- **Behavioral variability:** Sharks may display unpredictable or rare foraging behaviors  
- **Model validation:** Needs field data to confirm predictions  


## 8. Future Work

- Explore alternative models for higher accuracy  
- Scale model for **global shark populations** and multiple species  
- Incorporate real-time updates into visualization platform for dynamic ecological monitoring  

## Notes

This document represents a **conceptual framework** for predictive modeling of shark foraging habitats. 
