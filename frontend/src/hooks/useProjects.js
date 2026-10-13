import { useCallback, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { unwrap, errText } from "../utils.js";

export default function useProjects({ setBusy, setError, setSuccess }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    language: "JavaScript",
  });
  const loadProjects = useCallback(async () => {
    const data = await api.projects();
    setProjects(unwrap(data, "projects"));
  }, []);
  const filteredProjects = useMemo(
    () =>
      projects.filter((p) =>
        `${p.name || ""} ${p.description || ""} ${p.language || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [projects, search],
  );
  async function createProject(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.createProject(projectForm);
      setProjectForm({ name: "", description: "", language: "JavaScript" });
      setShowCreate(false);
      await loadProjects();
      setSuccess("Project created.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return {
    projects,
    setProjects,
    search,
    setSearch,
    showCreate,
    setShowCreate,
    projectForm,
    setProjectForm,
    loadProjects,
    filteredProjects,
    createProject,
  };
}
