// tokenInfo.js

const config = require('./client_config.json');

function printTokenInfo(token) {
  if (!token) {
    console.log("No token provided");
    return;
  }

  // JWTs are in format: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) {
    console.log("Invalid JWT token");
    return;
  }

  try {
    // Decode the payload (base64)
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));

    console.log("=== JWT Token Info ===");
    console.log("Subject (sub):", payload.sub);
    console.log("Email:", payload.email);
    console.log("Email verified:", payload.email_verified);
    console.log("Issuer (iss):", payload.iss);
    console.log("Audience (aud):", payload.aud);
    console.log("Issued At (iat):", new Date(payload.iat * 1000).toLocaleString());
    console.log("Expires At (exp):", new Date(payload.exp * 1000).toLocaleString());
    console.log("JWT ID (jti):", payload.jti);

    // Print all other claims
    Object.keys(payload).forEach((key) => {
      if (!["sub","email","email_verified","iss","aud","iat","exp","jti"].includes(key)) {
        console.log(`${key}:`, payload[key]);
      }
    });

    console.log("======================");
  } catch (err) {
    console.error("Failed to decode JWT token:", err);
  }
}

// Example usage:
const jwtToken = config.CURR_TOKEN;
printTokenInfo(jwtToken);
