//app\GT\components\CreateGoalModal.tsx
"use client";

import GoalForm from "./GoalForm";

export default function CreateGoalModal({ onClose, onCreated }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl shadow-2xl shadow-slate-950/50 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Create New Goal</h2>
          <p className="text-sm text-slate-400 mt-1">Set a new financial goal to track</p>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          <GoalForm
            onSuccess={() => {
              onCreated();
              onClose();
            }}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-lg transition-colors duration-200 border border-slate-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
