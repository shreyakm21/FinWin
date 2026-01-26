// app/GT/components/CreateGoalModal.tsx
"use client";

import GoalForm from "./GoalForm";

export default function CreateGoalModal({ onClose, onCreated }: any) {
  return (
    <div className="gt-modal-backdrop">
      <div className="gt-modal">
        <h2>Create New Goal</h2>

        <GoalForm
          onSuccess={() => {
            onCreated();
            onClose();
          }}
        />

        <button className="transaction-btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
