import { useCallback, useState } from "react";
import { api } from "../services/api.js";
import { unwrap, errText } from "../utils.js";

export default function useChat({ setBusy, setError }) {
  const [chatProjectId, setChatProjectId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const loadMessages = useCallback(async (projectId) => {
    if (!projectId) {
      setMessages([]);
      return;
    }
    const data = await api.messages(projectId);
    setMessages(unwrap(data, "messages"));
  }, []);
  async function sendMessage(event) {
    event.preventDefault();
    if (!messageText.trim() || !chatProjectId) return;
    setBusy(true);
    setError("");
    try {
      await api.sendMessage(chatProjectId, messageText.trim());
      setMessageText("");
      await loadMessages(chatProjectId);
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return {
    chatProjectId,
    setChatProjectId,
    messages,
    messageText,
    setMessageText,
    loadMessages,
    sendMessage,
  };
}
