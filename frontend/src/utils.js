export const unwrap = (data, key) =>
  Array.isArray(data)
    ? data
    : data?.[key] || data?.data?.[key] || data?.data || [];
export const userFrom = (data) =>
  data?.user || data?.data?.user || data?.data || data;
export const errText = (error) =>
  error?.message || "Something went wrong. Please try again.";
export const initials = (name) =>
  String(name || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
