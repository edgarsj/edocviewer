import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";

/**
 * Configure Shoelace's base path for loading assets
 */
export function configureShoelace() {
  try {
    // Important: The path must end with a trailing slash!
    setBasePath("/shoelace/");

    console.log("Shoelace base path configured to /shoelace/");
  } catch (error) {
    console.error("Error configuring Shoelace base path:", error);
  }
}
