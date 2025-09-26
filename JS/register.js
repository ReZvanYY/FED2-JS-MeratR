// Get the form element
const form = document.getElementById("register-form");

// Create divs for displaying messages
const errorDiv = document.createElement("div");
form.appendChild(errorDiv);
const successDiv = document.createElement("div");
form.appendChild(successDiv);

// Event listener for form submission
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Clear previous messages
  errorDiv.textContent = "";
  successDiv.textContent = "";

  // Get form values
  const nameInput = document.getElementById("name").value.trim();
  const emailInput = document
    .getElementById("email")
    .value.trim()
    .toLowerCase();
  const passwordInput = document.getElementById("password").value;
  const confirmPasswordInput =
    document.getElementById("confirm-password").value;

  // Validation
  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    errorDiv.textContent = "All fields are required.";
    errorDiv.style.color = "darkred";
    return;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(passwordInput)) {
    errorDiv.textContent =
      "Password must be at least 8 characters long and contain letters and numbers.";
    errorDiv.style.color = "darkred";
    return;
  }

  if (passwordInput !== confirmPasswordInput) {
    errorDiv.textContent = "Passwords do not match.";
    errorDiv.style.color = "darkred";
    return;
  }

  // Prepare registration payload
  const registerData = {
    name: nameInput,
    email: emailInput,
    password: passwordInput,
  };

  try {
    // API call to register the user
    const registrationResponse = await fetch(
      "https://v2.api.noroff.dev/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      }
    );

    const registrationResult = await registrationResponse.json();

    if (!registrationResponse.ok) {
      const message =
        registrationResult.errors?.[0]?.message ||
        registrationResult.message ||
        "Registration failed";
      throw new Error(message);
    }

    // Register successful -> login to get token
    const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({
            email: emailInput,
            password: passwordInput,
        }),
    });
    const loginResult = await loginResponse.json();
    if(!loginResponse.ok){
        throw new Error(loginResult.message || "Login after registeration failed");
    }
    const { accessToken, ...userData } = loginResult.data;

    //Store token and user
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Create API key with token
    const apiKeyResponse = await fetch("https://v2.api.noroff.dev/auth/create-api-key",{
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json" 
        },
    });
    
    const apiKeyResult = await apiKeyResponse.json();
    if (!apiKeyResult.ok){
        throw new Error(apiKeyResult.message || "Failed to generate API Key");
    }

    const apiKey = apiKeyResult.data.key;
    localStorage.setItem("apiKey", apiKey);

    // Success message
    successDiv.textContent = "Register successful! Redirecting to Home Page"
    successDiv.style.color = "green";
    form.reset();

    //Time function for redirect
    setTimeout(() =>{
        window.location.href = "../index.html";
    }, 2000);
    } catch (error){
        errorDiv.textContent = error.message
        errorDiv.style.color = "darkred";
    }
});
