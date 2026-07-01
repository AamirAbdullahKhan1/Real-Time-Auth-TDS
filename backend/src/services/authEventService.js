import {pool} from "../config/db.js"

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
        region = null,
        city = null,
        user_agent = null,
        details = {}
    } = event;

    const query = `
        INSERT INTO auth_events (
            user_id,
            username.
            email,
            event_type,
            risk_label,
            severity,
            detected_rule,
            ip_address,
            country,
            region,
            city,
            user_agent,
            details
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
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
    region,
    city,
    user_agent,
    details
  ];

  const result = await pool.query(query, values)
  return result.rows[0]
        
}