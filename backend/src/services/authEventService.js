import {pool} from "../config/db.js"
import { writeAuthEvent } from "./logger.js";
import { sendToSplunk } from "./splunk.js";

//region and city cols and removed for the time being but can be added later

export async function insertAuthEvent(event, db = pool){
    const {
        user_id = null,
        username = null,
        email = null,
        event_type,
        risk_label = "normal",
        severity = "low",
        detected_rule = null,
        ip_address = null,
        country = null,
        user_agent = null,
        details = {}
    } = event;

    const query = `
        INSERT INTO auth_events (
            user_id,
            username,
            email,
            event_type,
            risk_label,
            severity,
            detected_rule,
            ip_address,
            country,
            user_agent,
            details
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING id, created_at
    `;
    const values = [
    user_id,
    username,
    email,
    event_type,
    risk_label,
    severity,
    detected_rule,
    ip_address,
    country,
    user_agent,
    details
  ];

  const result = await db.query(query, values)
  return { ...event, ...result.rows[0] };
}

export async function publishAuthEvent(event) {
  const { id, created_at, user_id, event_type, ip_address, country,
    risk_label, severity, detected_rule } = event;
  const record = {
    event_id: String(id), timestamp: new Date(created_at).toISOString(),
    service: "ironclad", user_id, event_type, source_ip: ip_address,
    country, risk_label, severity, reason_code: detected_rule,
  };
  await writeAuthEvent(record).catch(error => {
    console.error("Local auth event write failed:", error.code);
  });
  if (process.env.SPLUNK_HEC_ENABLED === "true") {
    void sendToSplunk(record);
  }
}
