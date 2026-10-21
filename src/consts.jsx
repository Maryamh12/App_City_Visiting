// Set VITE_API_URL in .env (local) or in the hosting provider's settings.
// .env.production points production builds at the deployed API.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

// Cloudinary unsigned upload settings (public values, safe in the browser)
export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwxrq5htq";
export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "rtjhoiu5";
