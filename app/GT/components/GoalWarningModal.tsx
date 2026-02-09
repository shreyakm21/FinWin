// app/GT/components/GoalWarningModal.tsx
"use client";

import React from "react";

type Violation = {
  goalId: number;
  title: string;
  limit: number;
  currentSpent: number;
  projected: number;
  exceededBy: number;
};

interface Props {
  violations: Violation[];
  onCancel: () => void;
  onProceed: () => void;
}

const GoalWarningModal: React.FC<Props> = ({
  violations,
  onCancel,
  onProceed,
}) => {
  if (!violations.length) return null;

  return (
    <div className="gt-modal-backdrop">
      <div className="gt-modal">
        {/* Title */}
        <h2 className="gt-modal-title">⚠️ Goal Alert</h2>

        {/* Subtitle */}
        <p className="gt-modal-subtitle">
          This transaction violates the following goals:
        </p>

        {/* Violations */}
        <div className="gt-violations">
          {violations.map((v) => (
            <div key={v.goalId} className="gt-violation-card">
              <h4>{v.title}</h4>
              <p>
                Limit: <strong>₹{v.limit}</strong>
              </p>
              <p>
                Current: ₹{v.currentSpent} → After:{" "}
                <strong>₹{v.projected}</strong>
              </p>
              <p className="gt-exceeded">Exceeded by ₹{v.exceededBy}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="gt-modal-actions">
          <button
            type="button"
            className="transaction-btn-secondary"
            onClick={onCancel}
          >
            Cancel Payment
          </button>
          <button
            type="button"
            className="transaction-btn-primary"
            onClick={onProceed}
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalWarningModal;
