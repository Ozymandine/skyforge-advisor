
# Skyforge

**Skyforge** is an open-source, web-based analytics dashboard and profile inspector built for Hypixel SkyBlock. It processes live player data from the Hypixel REST API and parses compressed, in-game binary NBT payloads to deliver a real-time visual breakdown of player progression, gear, collections, and account statistics.

Designed as a modern, lightweight web application, Skyforge focuses on low client-side latency, responsive layouts, and accurate item rendering—using a custom multi-tiered texture pipeline to handle legacy Minecraft data and community texture packs seamlessly.

---

## Technical Overview

* **Core Stack:** React 18, Vite, TypeScript
* **Routing & State:** TanStack Router (type-safe file-based routing) and TanStack Query (API caching & rate-limit handling)
* **Payload Parsing:** In-browser binary NBT decompression (`nbt.js` + `pako`)
* **Graphics & Rendering:** HTML5 Canvas API for animated $16\times16\text{px}$ sprite sheets and custom texture fallbacks
* **Styling:** Tailwind CSS with dark glassmorphism themes

---

## Getting Started

### Prerequisites

* **Node.js** v18.0.0 or higher
* `npm`, `pnpm`, or `yarn`

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-username/skyforge.git
cd skyforge

```


2. Install dependencies:
```bash
npm install

```


3. Run the development server:
```bash
npm run dev

```


4. Build for production:
```bash
npm run build

```
