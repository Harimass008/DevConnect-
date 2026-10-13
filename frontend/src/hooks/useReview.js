import { useState } from "react";
import { api } from "../services/api.js";
import { errText } from "../utils.js";

export default function useReview({ setBusy, setError }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [reviewResult, setReviewResult] = useState(null);
  async function runReview(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setReviewResult(null);
    try {
      setReviewResult(await api.review({ code, language }));
    } catch (e) {
      setError(errText(e));
    } finally {
      setBusy(false);
    }
  }
  return { code, setCode, language, setLanguage, reviewResult, runReview };
}
