const API_URL = "http://localhost:5000"; // Replace with your Flask backend URL

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json(); // Return the JSON response
  } catch (error) {
    console.error("Error during login:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};

export const signup = async (email, password, role) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });
    return await response.json(); // Return the JSON response
  } catch (error) {
    console.error("Error during signup:", error);
    return { error: "Something went wrong. Please try again later." };
  }
};
