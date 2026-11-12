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
