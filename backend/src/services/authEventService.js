import {pool} from "../config/db.js"

//region and city cols and removed for the time being but can be added later

export async function insertAuthEvent(event){
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

  const result = await pool.query(query, values)
  return result.rows[0]
        
}