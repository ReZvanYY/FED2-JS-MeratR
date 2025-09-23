// Sign-in form
const loginForm = document.getElementById('login-form');
// Divs for displaying messages
const logInErrorDiv = document.createElement('div');
loginForm.appendChild(logInErrorDiv);
const logInSuccessDiv = document.createElement('div');
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
    // Prepare login data
    const loginData = {
        email: emailInput,
        password: passwordInput
    };
    // Send login request
    try {
        const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login",{
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify(loginData)
        });
        // Parse response
        if (!loginResponse.ok){
            const loginResult = await loginResponse.json();
            logInErrorDiv.textContent = loginResult.message || 'Login failed';
            logInErrorDiv.style.color = 'darkred';
            return;
        }
        // encrypt user data for storage
        const emailStart = loginResult.email.split('@')[0];
        const includeName = loginResult.name;
        const combineBoth = `${emailStart}:(${includeName})`;
        const encryptionData = btoa(combineBoth);

        // Store token and user info in localStorage
        localStorage.setItem('accessToken', encryptionData);
        localStorage.setItem('user', JSON.stringify(loginResult));
        
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
