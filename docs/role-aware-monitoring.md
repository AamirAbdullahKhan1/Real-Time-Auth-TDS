# Role-aware authentication monitoring

Apply `backend/migrations/003_roles_and_password_reset.sql` after the MFA migration when upgrading an existing database. Restart Express and refresh the frontend. Public signups and existing accounts default to `customer`. Assign staff roles from the Neon SQL editor as a database administrator, after confirming the intended account.

```sql
UPDATE users SET role = 'admin'
WHERE email = 'replace-with-your-admin-account@example.com'
RETURNING id, email, role;
```

Use `employee` for a staff account that should only see its own activity. Admins can see recent authentication events across accounts. Role changes are read from the database on each authenticated request.

Password reset uses the same verified sending domain and Resend configuration as sign-in. In the app, choose **Forgot password?**, request a code, enter the code and a new password, then sign in again. A successful reset revokes all sessions for the account.

## Splunk searches

Use `ironclad_auth` or replace it with the configured HEC index. The `role` field is the account role at event time. Older events and attempts against unrecognized accounts appear as `unknown`. Start with a 15-minute time range and adjust thresholds against lab and normal traffic before enabling alerts.

### Event counts by role

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| eval role=coalesce(role,"unknown")
| stats count by role event_type
| sort - count
```

### Repeated password, OTP, or reset failures

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| search event_type IN ("LOGIN_FAILED","OTP_FAILED","PASSWORD_RESET_FAILED")
| eval role=coalesce(role,"unknown"), account=coalesce(user_id,"unknown")
| where isnotnull(source_ip) AND source_ip!=""
| sort 0 _time
| streamstats time_window=5m count AS failures by event_type role account source_ip
| where failures=5
| table _time event_type role account source_ip failures
```

For events with no known account, this groups by source IP and failure type. A threshold crossing is a triage signal. Check account history and the surrounding timeline before taking action.

### Completed sign-in after repeated password failures

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| search event_type IN ("LOGIN_FAILED","LOGIN_SUCCESS")
| eval role=coalesce(role,"unknown")
| where isnotnull(user_id) AND isnotnull(source_ip) AND source_ip!=""
| sort 0 _time
| streamstats time_window=5m current=f count(eval(event_type="LOGIN_FAILED")) AS failures by user_id source_ip
| where event_type="LOGIN_SUCCESS" AND failures>=5
| table _time event_id role user_id source_ip failures
```

Verify each search with your test account and save it to the dashboard or as a search in Splunk. For scheduled searches, include the full correlation lookback and configure alert suppression as appropriate.

## Role-based lockouts

Apply `backend/migrations/004_auth_lockouts.sql` before deploying the backend. Password failures are counted per account across source IPs. A correct password resets the streak. Five minutes without another password failure starts a new streak. OTP attempts are counted per challenge. Both types trigger a five-minute account sign-in lock at 2 failures for admins, 3 for employees, and 5 for customers. Password recovery remains available. A successful reset clears the lock.

### Detection counts over time

Save this as a line or stacked column chart.

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| where isnotnull(detection_rule)
| dedup event_id
| timechart span=5m count by detection_rule
```

### Lockouts by role and severity

Save this as a table or bar chart.

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| where isnotnull(detection_rule)
| dedup event_id
| stats count as detections by role severity detection_rule
| sort - detections
```

### Separate alert for high-priority lockouts

Run the search below over the last five minutes. In Search & Reporting choose **Save As → Alert**, schedule it every five minutes, set the trigger to **Number of Results > 0**, and enable **Add to Triggered Alerts** if available in your license. Use a separate dashboard table for the wider list of suspicious events. Re-run with a wider time range when investigating historical events.

```spl
index=ironclad_auth source="ironclad-auth" earliest=-5m latest=now
| spath
| where isnotnull(detection_rule) AND (severity="high" OR severity="critical")
| dedup event_id
| table _time event_id event_type role severity user_id source_ip country failure_count attempt_limit detection_rule
```

Source IP and country provide triage context. They do not alter the lockout severity because geographic history and IP reputation are not evaluated.

### Suspicious sign-ins table

```spl
index=ironclad_auth source="ironclad-auth"
| spath
| search risk_label="suspicious" event_type IN ("LOGIN_FAILED","OTP_FAILED")
| dedup event_id
| table _time event_type role severity user_id source_ip country failure_count attempt_limit detection_rule
| sort 0 - _time
```
