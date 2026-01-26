"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import CreateReminderModal from "./components/CreateReminderModal";
import ReminderCard from "./components/ReminderCard";
import "./styles/reminders.css";

export default function ReminderPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const loadReminders = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const res = await fetch("/api/reminders", {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`,
      },
    });

    const data = await res.json();
    setReminders(data || []);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  return (
    <div className="gt-page">
      <div className="gt-header">
        <h1>⏰ Payment Reminders</h1>
        <button className="transaction-btn-primary" onClick={() => setOpen(true)}>
          + Add Reminder
        </button>
      </div>

      <div className="gt-grid">
        {reminders.length === 0 && (
          <p className="gt-empty">No reminders set</p>
        )}

        {reminders.map(r => (
          <ReminderCard key={r.reminderId} reminder={r} />
        ))}
      </div>

      {open && (
        <CreateReminderModal
          onClose={() => setOpen(false)}
          onCreated={loadReminders}
        />
      )}
    </div>
  );
}
