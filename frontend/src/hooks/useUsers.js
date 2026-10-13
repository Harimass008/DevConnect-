import { useCallback, useState } from "react";
import { api } from "../services/api.js";
import { unwrap, errText } from "../utils.js";

export default function useUsers({ role, can, setBusy, setError, setSuccess }) {
  const [users, setUsers] = useState([]);
  const loadUsers = useCallback(async () => {
    if (!can("users.read")) return;
    const data = await api.adminUsers();
    setUsers(unwrap(data, "users"));
    // Role is supplied by the authenticated backend user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);
  async function changeRole(id, nextRole) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.updateUserRole(id, nextRole);
      await loadUsers();
      setSuccess("User role updated.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return { users, setUsers, loadUsers, changeRole };
}
