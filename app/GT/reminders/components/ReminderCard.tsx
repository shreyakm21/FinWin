export default function ReminderCard({ reminder }: any) {
  return (
    <div className="gt-card">
      <h3>{reminder.displayName}</h3>

      <p>Account: {reminder.accountNumber}</p>
      <p>Frequency: {reminder.frequency}</p>
      <p>
        Next reminder:{" "}
        {new Date(reminder.nextTriggerAt).toLocaleDateString()}
      </p>

      <p>Status: {reminder.isActive ? "Active" : "Paused"}</p>
    </div>
  );
}
