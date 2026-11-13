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
        account_role = null,
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
            details,
            account_role
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
    details,
    account_role
  ];

  const result = await db.query(query, values)
  return { ...event, ...result.rows[0] };
}

export async function publishAuthEvent(event) {
  const { id, created_at, user_id, event_type, ip_address, country, account_role,
    risk_label, severity, detected_rule, details } = event;
  const record = {
    event_id: String(id), timestamp: new Date(created_at).toISOString(),
    service: "ironclad", user_id, event_type, source_ip: ip_address,
    country, role: account_role ?? "unknown", risk_label, severity, reason_code: detected_rule,
    failure_count: details?.failure_count,
    attempt_limit: details?.attempt_limit,
    detection_rule: details?.detection_rule,
    lockout_seconds: details?.lockout_seconds,
  };
  await writeAuthEvent(record).catch(error => {
    console.error("Local auth event write failed:", error.code);
  });
  if (process.env.SPLUNK_HEC_ENABLED === "true") {
    void sendToSplunk(record);
  }
}
