import { Code2, ChevronRight, FolderKanban } from "lucide-react";

export default function ProjectRows({ projects, onOpen }) {
  if (!projects.length)
    return (
      <div className="empty-state">
        <FolderKanban size={25} />
        <h3>No projects yet</h3>
        <p>Create a project or connect an existing project API.</p>
      </div>
    );
  return (
    <>
      <div className="project-table-head">
        <span>PROJECT</span>
        <span>LANGUAGE</span>
        <span>STATUS</span>
        <span>OPEN</span>
      </div>
      {projects.map((p, i) => (
        <div className="project-row" key={p.id || p._id || i}>
          <span
            className={`project-logo ${["", "blue", "green", "orange"][i % 4]}`}
          >
            <Code2 size={17} />
          </span>
          <span className="project-main">
            <b>{p.name || "Untitled project"}</b>
            <small>{p.description || "No description"}</small>
          </span>
          <span className="project-language">{p.language || "—"}</span>
          <span className="badge success">{p.status || "Active"}</span>
          <button
            className="round-arrow"
            title="Open project chat"
            onClick={() => onOpen(p.id || p._id)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      ))}
    </>
  );
}
