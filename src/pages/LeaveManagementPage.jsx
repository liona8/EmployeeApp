import React, { useState, useEffect } from "react";
import { leaveService } from "../services/leaveService";

const LEAVE_TYPES = [
  { value: "annual_leave", label: "Annual Leave" },
  { value: "medical_leave", label: "Medical Leave" },
  { value: "compassionate_leave", label: "Compassionate Leave" },
  { value: "paternity_leave", label: "Paternity Leave" },
  { value: "maternity_leave", label: "Maternity Leave" },
];

const statusBadge = (status) => {
  const map = {
    approved: ["badge-green", "Approved"],
    pending_approval: ["badge-orange", "Pending"],
    rejected: ["badge-red", "Rejected"],
    cancelled: ["badge-gray", "Cancelled"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};

function countWorkingDays(start, end) {
  if (!start || !end) return 0;
  let s = new Date(start), e = new Date(end), count = 0;
  while (s <= e) {
    const d = s.getDay();
    if (d !== 0 && d !== 6) count++;
    s.setDate(s.getDate() + 1);
  }
  return count;
}

export default function LeaveManagement() {
  const [tab, setTab] = useState("apply"); // apply | history | balance
  const [form, setForm] = useState({
    leave_type: "annual_leave",
    start_date: "",
    end_date: "",
    reason: "",
    is_half_day: false,
    half_day_period: "morning",
    emergency: false,
    relationship: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [balanceData, setBalanceData] = useState({});
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const workingDays = form.is_half_day ? 0.5 : countWorkingDays(form.start_date, form.end_date);
  const balance = balanceData?.[form.leave_type] || {};

  const validateForm = () => {
    const errors = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = form.start_date ? new Date(form.start_date) : null;
    const end = form.end_date ? new Date(form.end_date) : null;

    if (!form.start_date) errors.push("Start date is required.");
    if (!form.end_date) errors.push("End date is required.");

    if (start && start < today) {
      errors.push("Start date cannot be in the past.");
    }

    if (start && end && end < start) {
      errors.push("End date cannot be earlier than start date.");
    }

    if (
      form.leave_type === "compassionate_leave" &&
      !form.relationship
    ) {
      errors.push("Please select relationship for compassionate leave.");
    }

    const requestedDays = form.is_half_day
      ? 0.5
      : countWorkingDays(form.start_date, form.end_date);

    const currentBalance = balanceData?.[form.leave_type]?.remaining ?? 0;

    if (requestedDays <= 0) {
      errors.push("Invalid leave duration.");
    }

    if (requestedDays > currentBalance) {
      errors.push(
        `Requested ${requestedDays} day(s) exceeds your remaining balance of ${currentBalance}.`
      );
    }

    return errors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = "EMP001";

        const balance = await leaveService.getLeaveBalance(userId);
        setBalanceData(balance);

        // If you have history endpoint
        const historyRes = await leaveService.getLeaveHistory?.(userId);
        if (historyRes) setHistoryData(historyRes);

      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setValidationResult(null);

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setValidationResult({
        is_valid: false,
        errors: formErrors,
        warnings: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    // Build payload matching your backend's /leave/apply expected body
    const payload = {
      employee_id: "EMP001",            // replace with auth user ID
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason || "Not specified",   // backend requires reason
      is_half_day: form.is_half_day,
      half_day_period: form.is_half_day ? form.half_day_period : null,
      emergency: form.emergency,
      relationship: form.relationship || null,
      supporting_documents: [],
    };

    try {
      const result = await leaveService.applyLeave(payload);

      // Success — result.validation_summary has warnings
      setValidationResult({
        is_valid: true,
        warnings: result.validation_summary?.warnings || [],
        errors: [],
        leave_id: result.leave_id,
      });
      setSubmitted(true);

      // Refresh balance after successful submission
      const updatedBalance = await leaveService.getLeaveBalance("EMP001");
      setBalanceData(updatedBalance);

      // Optionally refresh history
      const updatedHistory = await leaveService.getLeaveHistory("EMP001");
      if (updatedHistory) setHistoryData(updatedHistory);

    } catch (err) {
      console.log("Full error:", err);

      if (err.detail?.errors) {
        setValidationResult({
          is_valid: false,
          errors: err.detail.errors,
          warnings: err.detail.warnings || [],
        });

      } else if (err.detail?.message) {
        setValidationResult({
          is_valid: false,
          errors: [err.detail.message],
          warnings: [],
        });

      } else {
        setValidationResult({
          is_valid: false,
          errors: ["An unexpected error occurred. Please try again."],
          warnings: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setValidationResult(null);
    setForm({ leave_type: "annual_leave", start_date: "", end_date: "", reason: "", is_half_day: false, half_day_period: "morning", emergency: false, relationship: "" });
  };

  return (
    <div className="leave-page">
      <div className="page-header">
        <div className="page-title">Leave Management</div>
        <div className="page-subtitle">Apply for leave, track applications, and view your entitlements</div>
      </div>

      {/* Tabs */}
      <div className="leave-tabs" style={{ marginBottom: 20, display: "flex", gap: 4, borderBottom: "1px solid var(--border)" }}>
        {[["apply", "Apply Leave"], ["history", "History"], ["balance", "Entitlements"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px 16px", fontFamily: "DM Sans", fontSize: 14,
              color: tab === key ? "var(--accent)" : "var(--text2)",
              borderBottom: tab === key ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1, transition: "all 0.15s"
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Apply Leave */}
      {tab === "apply" && (
        <div className="leave-grid">
          {/* Form */}
          <div className="card">
            {submitted ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div className="font-syne" style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                  Application Submitted!
                </div>
                <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 8 }}>
                  Your leave request has been submitted for approval.
                </div>
                <div style={{ color: "var(--text3)", fontSize: 12, marginBottom: 24 }}>
                  Reference: LA-2026-{Math.random().toString(36).slice(2,7).toUpperCase()}
                </div>
                {validationResult?.warnings?.map((w, i) => (
                  <div key={i} style={{ fontSize: 12, color: "var(--warning)", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 8, textAlign: "left" }}>
                    ⚠ {w}
                  </div>
                ))}
                <button className="btn btn-primary mt-16" onClick={reset}>New Application</button>
              </div>
            ) : (
              <>
                <div className="card-title">New Leave Application</div>

                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-select" value={form.leave_type}
                    onChange={e => setForm({ ...form, leave_type: e.target.value })}>
                    {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                {/* Date range */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" value={form.start_date}
                      onChange={e => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" value={form.end_date}
                      onChange={e => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>

                {/* Half Day */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text2)" }}>
                    <input type="checkbox" checked={form.is_half_day}
                      onChange={e => setForm({ ...form, is_half_day: e.target.checked })} />
                    Half Day Leave
                  </label>
                  {form.is_half_day && (
                    <select className="form-select" style={{ width: "auto" }} value={form.half_day_period}
                      onChange={e => setForm({ ...form, half_day_period: e.target.value })}>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  )}
                </div>

                {/* Emergency */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text2)" }}>
                    <input type="checkbox" checked={form.emergency}
                      onChange={e => setForm({ ...form, emergency: e.target.checked })} />
                    Emergency Leave (notify supervisor before 9:00 AM)
                  </label>
                </div>

                {/* Compassionate relationship */}
                {form.leave_type === "compassionate_leave" && (
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <select className="form-select" value={form.relationship}
                      onChange={e => setForm({ ...form, relationship: e.target.value })}>
                      <option value="">Select relationship...</option>
                      {["spouse", "child", "parent", "brother", "sister", "parent_in_law", "grandparent_paternal"].map(r => (
                        <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Reason (Optional)</label>
                  <textarea className="form-textarea" placeholder="Provide a reason for your leave request..."
                    value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
                </div>

                {/* Validation Errors */}
                {validationResult && !validationResult.is_valid && (
                  <div style={{ marginBottom: 12 }}>
                    {validationResult.errors.map((err, i) => (
                      <div key={i} style={{ fontSize: 12, color: "var(--danger)", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                        ✕ {err}
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSubmit}>
                  Submit Leave Application
                </button>
              </>
            )}
          </div>

          {/* Summary / Preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card">
              <div className="card-title">Application Preview</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>
                {[
                  ["Type", LEAVE_TYPES.find(t => t.value === form.leave_type)?.label || "—"],
                  ["Start", form.start_date || "—"],
                  ["End", form.end_date || "—"],
                  ["Working Days", form.start_date && form.end_date ? `${workingDays} day(s)` : "—"],
                  ["Half Day", form.is_half_day ? `Yes (${form.half_day_period})` : "No"],
                  ["Emergency", form.emergency ? "Yes" : "No"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <span>{k}</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance Check */}
            <div className="card">
              <div className="card-title">Balance Check</div>
              {balance.remaining !== undefined ? (
                <div>
                  <div className="progress-bar-wrap">
                    <div className="progress-header">
                      <span className="progress-name">{LEAVE_TYPES.find(t => t.value === form.leave_type)?.label}</span>
                      <span className="progress-count">{balance.remaining} remaining</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill fill-blue" style={{
                        width: `${Math.round(((balance.used || 0) / balance.total_entitlement) * 100)}%`
                      }} />
                    </div>
                  </div>
                  {balance.carry_forward_from_previous > 0 && (
                    <div style={{ fontSize: 12, color: "var(--warning)", marginTop: 8 }}>
                      ⚠ {balance.carry_forward_from_previous} carry-forward days expire {balance.carry_forward_expiry_date}
                    </div>
                  )}
                  {workingDays > 0 && (
                    <div style={{
                      marginTop: 12, padding: "8px 12px", borderRadius: 8, fontSize: 12,
                      background: workingDays <= balance.remaining ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                      border: `1px solid ${workingDays <= balance.remaining ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                      color: workingDays <= balance.remaining ? "var(--accent3)" : "var(--danger)"
                    }}>
                      {workingDays <= balance.remaining ? `✓ Balance sufficient (${balance.remaining - workingDays} remaining after)` : `✕ Insufficient balance`}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--text3)" }}>Select a leave type to see balance.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="leave-history-section">
          {/* Desktop table */}
          <div className="card leave-history-table">
            <div className="card-title">Leave Application History</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map(l => (
                  <tr key={l.id}>
                    <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{l.id}</span></td>
                    <td style={{ color: "var(--text)", fontWeight: 500 }}>{l.leave_type}</td>
                    <td>{l.start_date} → {l.end_date}</td>
                    <td>{l.requested_days}d</td>
                    <td>{l.reason}</td>
                    <td>{statusBadge(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="card leave-history-mobile">
            <div className="card-title">Leave Application History</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {historyData.map(l => (
                <div key={l.id} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg3)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{l.leave_type}</span>
                    {statusBadge(l.status)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
                    <span>Period</span>
                    <span style={{ color: "var(--text2)" }}>{l.start_date} → {l.end_date}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)", marginBottom: 4 }}>
                    <span>Days</span>
                    <span style={{ color: "var(--text2)" }}>{l.requested_days}d</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text3)" }}>
                    <span>Reason</span>
                    <span style={{ color: "var(--text2)", textAlign: "right", maxWidth: "60%" }}>{l.reason}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "monospace", marginTop: 6 }}>{l.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Balance — stat cards match Service Tickets layout */}
      {tab === "balance" && (
        <div className="leave-entitlements-section">
          <div className="ticket-stats leave-entitlement-stats">
            {[
              { key: "annual_leave", label: "Annual Leave", color: "blue" },
              { key: "medical_leave", label: "Medical Leave", color: "green" },
              { key: "compassionate_leave", label: "Compassionate Leave", color: "purple" },
            ].map(({ key, label, color }) => {
              const b = balanceData?.[key] || {};
              const total = b.total_entitlement || b.max_per_year || 9;
              const used = b.used || 0;
              const remaining = b.remaining !== undefined ? b.remaining : total;
              const underline = { blue: "var(--accent)", green: "var(--accent3)", purple: "var(--accent2)" }[color];
              return (
                <div
                  key={key}
                  className="ticket-stat-card leave-entitlement-card"
                  style={{ borderTop: `2px solid ${underline}` }}
                >
                  <div className="ticket-stat-label">{label}</div>
                  <div className="ticket-stat-count">{remaining}</div>
                  <div className="ticket-stat-footer">days</div>
                  <div className="leave-entitlement-meta">
                    {used} used · {total} total
                  </div>
                  {key === "annual_leave" && b.carry_forward_from_previous > 0 && (
                    <div className="leave-entitlement-carry">
                      ↩ {b.carry_forward_from_previous} carry-forward (exp. {b.carry_forward_expiry_date})
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card leave-policy-notes">
            <div className="card-title">Policy Notes</div>
            <div className="leave-policy-grid">
              {[
                { title: "Advance Notice", desc: "Annual leave requires minimum 5 working days advance notice." },
                { title: "Emergency Leave", desc: "Same-day leave must be notified before 9:00 AM with supporting documents." },
                { title: "Carry Forward", desc: "Maximum 10 days can be carried forward to June 30 of the following year." },
                { title: "Half Day Leave", desc: "Calculated as 0.5 days. Specify morning or afternoon." },
                { title: "Working Days", desc: "Leave calculations exclude weekends and Malaysian public holidays." },
                { title: "Medical Leave", desc: "Valid medical certificate from registered practitioner required on return." },
              ].map((n) => (
                <div key={n.title} style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 13, marginBottom: 4 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>{n.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}