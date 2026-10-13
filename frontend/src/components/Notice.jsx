import { CheckCircle2, CircleAlert } from "lucide-react";

export default function Notice({ message, type = "error" }) {
  if (!message) return null;
  return (
    <div
      className={`notice ${type === "success" ? "notice-success" : "notice-error"}`}
    >
      {type === "success" ? (
        <CheckCircle2 size={15} />
      ) : (
        <CircleAlert size={15} />
      )}
      <span>{message}</span>
    </div>
  );
}
