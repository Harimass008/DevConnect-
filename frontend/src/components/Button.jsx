export default function Button({ children, secondary = false, ...props }) {
  return (
    <button className={`button ${secondary ? "secondary" : ""}`} {...props}>
      {children}
    </button>
  );
}
