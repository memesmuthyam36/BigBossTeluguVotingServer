const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or file:// protocol)
    if (!origin || origin.startsWith("file://")) return callback(null, true);

    // In development, allow all origins for testing
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ CORS allowing origin: ${origin}`);
      return callback(null, true);
    }

    // Production: Allow specific origins
    const allowedOrigins = [
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500", // Live Server
      "http://127.0.0.1:5500", // Live Server
      "https://big-boss-telugu-voting.vercel.app", // Vercel frontend
      "https://big-boss-telugu-voting.vercel.app/", // Vercel frontend with trailing slash
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS rejected origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count"],
};

module.exports = corsOptions;
