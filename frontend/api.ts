// frontend/src/api.ts
const API_BASE_URL = "/api"; // relative path for production, works with Nginx reverse proxy

// Generic GET request
export async function getInstructions(category: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/instructions/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch instructions for ${category}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching instructions:", error);
    throw error;
  }
}

// Generic POST request
export async function postValidate(category: string, data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/validate/${category}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to validate for ${category}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error posting validation:", error);
    throw error;
  }
}

// Download sample
export async function downloadSample(category: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/download-sample/${category}`);
    if (!response.ok) {
      throw new Error(`Failed to download sample for ${category}`);
    }
    return await response.blob();
  } catch (error) {
    console.error("Error downloading sample:", error);
    throw error;
  }
}
