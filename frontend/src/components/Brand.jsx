import { Code2 } from "lucide-react";

export default function Brand({ small = false }) {
  return (
    <div className={`brand ${small ? "auth-brand" : ""}`}>
      <span className="brand-mark">
        <Code2 size={20} />
      </span>
      <span>
        DevConnect<span className="brand-light">.io</span>
        <small>BUILD TOGETHER</small>
      </span>
    </div>
  );
}
