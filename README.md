# ClimaSense 🌍⚡

<div align="center">
  <a href="https://clima-sense-fmwp.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🔴_Live_Demo-clima--sense.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</div>
<br/>

**ClimaSense** is an advanced, AI-powered atmospheric intelligence and disaster management dashboard. Built to provide real-time situational awareness, it combines predictive weather modeling, crowdsourced incident mapping, and actionable AI safety recommendations into a single, highly aesthetic interface.

Whether you're tracking severe storms, monitoring urban air quality, or calculating emergency evacuation routes, ClimaSense delivers critical climate data instantly.

---

## 🚀 Features

- **Live Global Atmospheric Intelligence:** A beautiful, interactive 3D globe visualizing global weather anomalies and storm tracks.
- **Intelligent Location Detection:** Automatically detects your location using IP fallback, or requests ultra-precise GPS coordinates.
- **AI Meteorologist (ClimaChat):** Powered by Llama 3.3 70B, get interactive, conversational insights and 5-step actionable safety checklists based on real-time localized weather data.
- **Time-Travel Forecast Slider:** Fast-forward up to 24 hours into the future on our interactive heat maps to track moving weather systems.
- **Emergency Evacuation Routing:** One-click generation of safe driving routes away from danger zones using Open Source Routing Machine (OSRM).
- **Crowdsourced Incident Reporting:** Right-click on the map to drop pins and report localized flooding, fires, or structural damage.
- **Comprehensive Air Quality (AQI) Panel:** Monitor PM2.5, UV Index, Dew Point, and overall air quality with dynamic health warnings.
- **Alert Subscriptions:** Sign up for emergency SMS/Email alerts for specific geographical zones.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| 🎨 **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js) ![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer) |
| 🗺️ **Maps & Viz** | ![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white) ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js) `React-Globe.gl` |
| ⚙️ **Backend** | ![Next.js APIs](https://img.shields.io/badge/Route_Handlers-black?logo=next.js) |
| 🗄️ **Database** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) `PostgreSQL` |
| 📡 **Data APIs** | `Open-Meteo` `OpenWeather` `Tomorrow.io` `OSRM` |
| 🧠 **AI Engine** | ![Groq](https://img.shields.io/badge/Groq_API-F55036) `Meta Llama 3.3 70B` |

---

## 💻 Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for database setup)
- Groq API Key

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kiyansh13karan/ClimaSense.git
   cd ClimaSense
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

4. **Initialize the Database:**
   Run the SQL commands found in `supabase_schema.sql` in your Supabase SQL editor to create the necessary tables for incidents and subscriptions.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/kiyansh13karan/ClimaSense/issues).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
