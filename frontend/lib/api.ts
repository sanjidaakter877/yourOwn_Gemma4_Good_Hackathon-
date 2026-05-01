export function apiUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const configured = process.env.NEXT_PUBLIC_API_URL;

  if (configured) {
    return `${configured.replace(/\/$/, "")}${cleanPath}`;
  }

  if (
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) {
    return `http://localhost:5000${cleanPath}`;
  }

  return `/_/backend${cleanPath}`;
}
