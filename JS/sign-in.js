// Sign-in form
const loginForm = document.getElementById('login-form');
// Divs for displaying messages
const logInErrorDiv = document.createElement('div');
const logInSuccessDiv = document.createElement('div');

loginForm.appendChild(logInErrorDiv);
loginForm.appendChild(logInSuccessDiv);

// Event listener for form submission
loginForm.addEventListener('submit', async function (event){
    event.preventDefault();

    // Clear previous messages
    logInErrorDiv.textContent = '';
    logInSuccessDiv.textContent = '';

    // Get and validate input values
    const emailInput = document.getElementById('email-login').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password-login').value;

    // Basic validation
    if (!emailInput || !passwordInput){
        logInErrorDiv.textContent = 'Please fill in all fields';
        logInErrorDiv.style.color = 'darkred';
        return;
    }
 
    // Send login request
    try {
        const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login",{
            method: "POST",
            headers: { "Content-Type" : "application/json" 
            },
            body: JSON.stringify({email: emailInput, password: passwordInput })
        });
        // Parse json and respons
        const loginResult = await loginResponse.json();

        if (!loginResponse.ok){
            logInErrorDiv.textContent = loginResult.message || 'Login failed';
            logInErrorDiv.style.color = 'darkred';
            return;
        }
        const { accessToken, ...userData } = loginResult.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        const apiKeyResponse = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "AuthKey" })
        });

        const apiKeyResult = await apiKeyResponse.json();
        if(!apiKeyResponse.ok){
            throw new Error(apiKeyResult.message || "Failed to generate API key");
        }

        localStorage.setItem("apiKey", apiKeyResult.data.key);

        // Successful login
        logInSuccessDiv.textContent = 'Login successful! Redirecting...';
        logInSuccessDiv.style.color = 'green';
        loginForm.reset();

        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = '../index.html'
        }, 2000);

        //catch errors during fetch
    } catch (error) {
        logInErrorDiv.textContent = 'An error occurred. Please try again later.';
        logInErrorDiv.style.color = 'darkred';
        console.error('Error during login:', error);
    }
});
