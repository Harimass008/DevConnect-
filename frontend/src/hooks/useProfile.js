import { api } from "../services/api.js";
import { userFrom, errText } from "../utils.js";

export default function useProfile({
  profile,
  setProfile,
  setUser,
  setBusy,
  setError,
  setSuccess,
}) {
  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const data = await api.updateProfile(profile);
      const current = userFrom(data);
      setUser((prev) => ({ ...prev, ...current }));
      setProfile({
        name: current.name || profile.name,
        email: current.email || profile.email,
      });
      setSuccess("Profile updated.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return { profile, setProfile, saveProfile };
}
