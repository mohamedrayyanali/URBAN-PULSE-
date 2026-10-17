# UrbanPulse

> **An IoT-Driven Spatial Analytics Platform for Modeling Microclimate Dynamics and Cascading Infrastructure Failure Net-Effects.**

UrbanPulse is an interactive urban-planning and diagnostic platform that models how localized environmental shocks (e.g., intense solar radiation, heatwaves, loss of vegetative cover) trigger a domino effect of failures across interconnected city infrastructure.

The platform pairs a **spatial thermodynamics engine** (tracking 2D urban heat islands, solar irradiance, albedo, and evaporative cooling) with a **network graph layout** (tracking utility dependencies between power substations, water pump facilities, data centers, and hospitals).

By linking the system to a physical **BBC micro:bit (V1/V2) sensor node**, planners can use a real-world flashlight to simulate solar radiation spikes and watch in real time as localized overheating cascades into power plant overloads, water pump cavitation, and catastrophic hospital blackouts.

---

## ⚡ Key Platform Features

### 1. Interactive Spatial Microclimate Canvas
- Responsive **8x8 grid dashboard (64 city blocks)** allowing planners to reconfigure urban land cover.
- **6 Mathematically Distinct Node Types**:
  1. **Concrete Skyscrapers (`CS`)**: Low albedo (0.15), massive thermal inertia (85 kJ/m²·K), high anthropogenic heat output (+8.5 W/m² HVAC rejection), and wind resistance that traps heat in urban street canyons.
  2. **Asphalt Roads (`AR`)**: Extreme low albedo (0.05), absorbs 95% of direct solar flux, fast thermal response, forming searing ground thermal pools.
  3. **Utility Hubs (`UH`)**: Critical municipal infrastructure nodes (Power Substations Alpha & Beta, Water Pumps North & South, City Central Hospital, Data Center). Operates with strict thermal safety trip thresholds (41.5°C – 48.5°C).
  4. **Tree Canopies (`TC`)**: Dense urban forest canopy with high evapotranspiration cooling (-7.5 W/m² latent cooling), 80% solar radiation shielding, and an active 1.8-cell Gaussian cooling radius.
  5. **Pocket Parks (`PP`)**: Permeable soil, grassy bioswales, moderate albedo (0.28), and broad 2.2-cell radial thermal buffer.
  6. **Water Bodies (`WB`)**: Massive specific heat capacity (240 kJ/m²·K) and evaporative heat absorption (-9.0 W/m²) acting as an urban thermal damper and microclimate stabilizer.

### 2. Dual-Overlay Visualizer Toggle
Switch smoothly between different diagnostic layers:
- **Dual-Overlay (Hybrid)**: Blends the continuous radiant heatmap with high-contrast architectural tiles and the glowing infrastructure vector graph.
- **Thermal Heatmap**: Full 2D thermodynamic gradient rendered using scientific colormaps (cool blues -> greens -> ambers -> crimson -> white-hot overheat).
- **Network Graph**: Shows electrical transmission lines and chilled water coolant loops with real-time particle animation and status rings.
- **Land Cover**: Architectural schematic view of material distribution.

### 3. Cascading Failure Engine
- Automated multi-stage failure propagation:
  - **Stage 1 (Thermal Breach)**: Power Substation Alpha overheats past 48.5°C -> circuit breaker trips to prevent transformer explosion.
  - **Stage 2 (Power Loss Cascade)**: Water Pump North loses electricity from Substation Alpha -> pumping pressure collapses to 0 PSI.
  - **Stage 3 (Hospital Code Red)**: Hospital Central chiller plant is starved of water coolant while ambient temperatures exceed 40°C -> emergency generators overheat -> **Hospital Blackout**!
- Real-time financial downtime ticker calculating accrued economic loss ($/min).
- Grid resilience health index (0 - 100%).

### 4. AI Strategic Optimization Solver
- Evaluates the 8x8 city grid to identify systemic vulnerabilities in the utility dependency tree.
- Uses a heuristic ROI algorithm to test virtual green interventions (replacing asphalt or concrete with Tree Canopies or Pocket Parks).
- Computes:
  - Exact localized temperature reduction (-3°C to -6°C).
  - Systemic cascade risk reduction percentage.
  - Financial downtime loss prevented vs. implementation cost.
  - **1-Click "Deploy Solution"**: Instantly transforms the grid cell and cools downstream utilities.

### 5. IoT Weather Node (BBC micro:bit Integration & Simulator)
- **Physical Hardware Link**: Connects to a physical BBC micro:bit over USB using the **Web Serial API** (baud rate 115200).
  - Uses the micro:bit's 5x5 LED matrix as an ambient light sensor.
  - Shining a flashlight or phone light directly on the micro:bit injects an immediate environmental heat shock.
- **Virtual IoT Sensor Simulator**:
  - Interactive Flashlight / Solar radiation slider (0 - 255 lux / 0 - 1100 W/m²).
  - **"Simulate Flashlight Shock"** button to trigger instant solar burst tests.
  - Real-time virtual 5x5 LED matrix display on the dashboard.

### 6. Analytical Telemetry Suite
- Real-time rolling 60-second temperature trend sparkline (Peak vs Average temp with 48.5°C trip line).
- Chronological Failure & Event Stream with severity badges (`[INFO]`, `[WARN]`, `[CRITICAL]`, `[CASCADE]`, `[DISASTER]`).
- Export incident reports in JSON format.

---

## 🚀 How to Run the Application

### Option A: Local Dev Server (Recommended)
UrbanPulse includes a lightweight zero-dependency server:
```bash
# In the project directory:
npm start
# Or: node server.js
```
Open your browser and navigate to:
```
http://localhost:3000
```

### Option B: Direct Browser Launch
Because UrbanPulse is built with standard ES modules and modern JavaScript:
- You can also open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Firefox, Brave, Safari).

---

## 📟 BBC micro:bit Hardware Setup Instructions

1. Connect your BBC micro:bit (V1 or V2) to your computer with a micro-USB cable.
2. Open the official MicroPython editor in Chrome or Edge: [https://python.microbit.org/](https://python.microbit.org/).
3. Paste the contents of `microbit_firmware.py`:
   ```python
   from microbit import *
   import utime

   uart.init(baudrate=115200)
   display.show(Image.SUNNY)
   utime.sleep_ms(1000)

   while True:
       light = display.read_light_level()
       temp = temperature()
       
       display.clear()
       bars = int((light / 255.0) * 5)
       for y in range(4, 4 - bars, -1):
           for x in range(5):
               display.set_pixel(x, y, 9)

       telemetry = '{"light":' + str(light) + ',"temp":' + str(temp) + '}\n'
       uart.write(telemetry)
       utime.sleep_ms(150)
   ```
4. Click **Send to micro:bit** or copy the downloaded `.hex` file to the `MICROBIT` USB drive.
5. In the UrbanPulse web app, click **"Connect Micro:bit"** in the top navigation bar and select the micro:bit port.
6. The status pill will turn green: **● BBC micro:bit (USB Live)**.
7. Shine your smartphone flashlight directly onto the micro:bit to simulate solar radiation shocks!

---

## 📂 Project Directory Structure

```
d:\URBAN PULSE/
├── index.html               # Main dashboard UI structure
├── style.css                # Cyberpunk SCADA design system & responsive layout
├── server.js                # Lightweight zero-dependency HTTP server
├── package.json             # Project metadata and run scripts
├── microbit_firmware.py     # MicroPython firmware for BBC micro:bit
├── README.md                # Full system documentation
└── js/
    ├── config.js            # Thermodynamic constants, 6 node types, thresholds
    ├── thermodynamics.js    # 2D heat diffusion, solar flux, wind advection engine
    ├── network.js           # Infrastructure dependency topology & animated vectors
    ├── cascade.js           # Cascading failure domino logic & downtime cost tracker
    ├── ai_optimizer.js      # AI Strategic Planning Assistant & ROI solver
    ├── microbit_serial.js   # Web Serial API hardware driver & virtual sensor
    ├── presets.js           # 4 Pre-configured city block scenarios
    ├── telemetry.js         # Rolling sparklines, event log stream, audio synthesizer
    └── main.js              # Application controller & physics loop
```

---

## 📜 License
MIT License — UrbanPulse Project.
