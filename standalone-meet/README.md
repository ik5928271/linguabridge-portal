# Dedicated 3-Way Interpreter Meeting Portal 🚀

A lightweight, enterprise-grade, **100% Free & Unlimited** multi-party audio/video meeting portal designed specifically for 3-way live interpretation sessions (Client 👤, Interpreter 🎧, Third-Party/Provider 🏢).

---

## ✨ Key Features & Advantages

1. **Carrier-Grade Global SFU Audio/Video Engine (100% Free)**
   - Powered by standard Jitsi Meet Web SDK / 8x8 global relay nodes.
   - Bypasses mobile 4G/5G Carrier-Grade NAT (CGNAT) and corporate firewalls.
   - Zero offer/answer glare collisions or dropped audio transceivers.

2. **Zero Server Load / Zero Server Cost**
   - Audio/video streams are distributed directly through global cloud media bridges without burdening your web server memory or bandwidth.

3. **Instant One-Click Join via URL**
   - Direct room access with query parameters:
     ```
     https://your-meet-domain.com/?roomId=LB-9821&role=client&name=Ahmed&lang=Urdu
     ```
   - Automatically bypasses lobby and launches directly into the call.

4. **Built-in Device Testing Lobby**
   - Real-time animated microphone volume level bar.
   - Camera preview & device toggle before joining.
   - Pre-configured role & language selectors.

---

## 🏃 Quick Start (Local Development)

```bash
# 1. Navigate to the standalone-meet folder
cd standalone-meet

# 2. Run local development server
npm run dev

# 3. Open in browser:
# http://localhost:5173
```

---

## 📦 Production Deployment Options (100% Free)

### Option A: Free Vercel / Netlify Deployment (Recommended)
1. Push `standalone-meet` to a GitHub repository or subfolder.
2. In Vercel / Netlify, set **Build Command**: `npm run build` and **Output Directory**: `dist`.
3. You get a permanent free fast CDN URL (e.g. `https://linguabridge-meet.vercel.app`).

### Option B: Free Render / Railway / VPS Web Service
1. In Render, create a **Web Service**.
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `node server.js`
4. Port `process.env.PORT` will be served automatically.

### Option C: Co-Hosted with Main Server
The main server (`server/index.js`) is already configured to automatically serve this meeting portal at `/meet`:
- Local: `http://localhost:3001/meet`
- Production: `https://your-domain.com/meet`

---

## 🔗 URL Query Parameters Reference

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `roomId` | String | `LB-8842` | Unique meeting room code |
| `role` | String | `client` / `interpreter` / `third_party` | User's role badge & color |
| `name` | String | `Zeeshan` | Display name of the participant |
| `lang` | String | `Urdu / Punjabi` | Target language badge |
| `autojoin`| Boolean | `true` | Skip lobby and connect immediately |
