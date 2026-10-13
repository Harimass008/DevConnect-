import { useState } from "react";
import { api } from "../services/api.js";
import { errText } from "../utils.js";

export default function useNotifications({ setBusy, setError, setSuccess }) {
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailEnabled: true,
    smsEnabled: false,
    projectUpdates: true,
    securityAlerts: true,
    teamMessages: true,
    phone: "",
  });
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  async function loadNotificationPrefs() {
    try {
      const data = await api.notificationPreferences();
      const prefs =
        data?.preferences ||
        data?.data?.preferences ||
        data?.data ||
        data ||
        {};
      setNotificationPrefs((prev) => ({ ...prev, ...prefs }));
      setPrefsLoaded(true);
    } catch (e) {
      setPrefsLoaded(false);
      throw e;
    }
  }
  async function sendPhoneOtp() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.sendPhoneOtp({ phone: notificationPrefs.phone });
      setPhoneOtpSent(true);
      setSuccess("Verification code requested. Check your phone.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  async function verifyPhoneOtp() {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.verifyPhoneOtp({
        phone: notificationPrefs.phone,
        otp: phoneOtp,
      });
      setPhoneVerified(true);
      setSuccess("Phone number verified.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  async function saveNotificationPrefs(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.updateNotificationPreferences(notificationPrefs);
      setSuccess("Notification preferences saved to the backend.");
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return {
    notificationPrefs,
    setNotificationPrefs,
    prefsLoaded,
    phoneOtp,
    setPhoneOtp,
    phoneOtpSent,
    phoneVerified,
    loadNotificationPrefs,
    sendPhoneOtp,
    verifyPhoneOtp,
    saveNotificationPrefs,
  };
}
