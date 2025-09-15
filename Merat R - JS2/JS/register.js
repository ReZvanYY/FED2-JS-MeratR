// Get the form element
const form = document.getElementById('register-form');

// Create divs for displaying messages
const errorDiv = document.createElement('div');
form.appendChild(errorDiv);
const successDiv = document.createElement('div');
form.appendChild(successDiv);

// Event listener for form submission
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Clear previous messages, if any
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    
    // Get form values
    const nameInput = document.getElementById('name').value.trim();
    const emailInput = document.getElementById('email').value.trim().toLowerCase();
    const passwordInput = document.getElementById('password').value;
    const confirmPasswordInput = document.getElementById('confirm-password').value;

    //Validation
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        errorDiv.textContent = 'All fields are required.';
        errorDiv.style.color = 'red';
        return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(passwordInput)) {
        errorDiv.textContent = 'Password must be at least 8 characters long and contain both letters and numbers.';
        errorDiv.style.color = 'red';
        return;
    }
    if (passwordInput !== confirmPasswordInput) {
        errorDiv.textContent = 'Passwords do not match.';
        errorDiv.style.color = 'red';
        return;
    }

    // If all validations pass
    successDiv.textContent = 'Registration successful!';
    successDiv.style.color = 'green';

    // Prepare data for API
    const registerData = {
        name: nameInput,
        email: emailInput,
        password: passwordInput
    };
    //
    // API call to register the user
    try {
        const registrationResponse = await fetch ("https://v2.api.noroff.dev/auth/register", {
        method: "POST",
        headers:{
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(registerData)
    });
    // Check if registration was successful
    if(!registrationResponse.ok){
        const registrationError = await registrationResponse.json();
        throw new Error(registrationError.message || 'Registration failed, HTML response not OK');
    }
    // If registration is successful, log in the user
    const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login", {
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
    });
    // Check if login was successful
    if(!loginResponse.ok){
        const loginError = await loginResponse.json();
        throw new Error(loginError.message || 'Login failed, HTML response not OK');
    }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.color = 'red';
        return;
    }
    // If login is successful, store the token and username in localStorage
    const loginData = await loginResponse.json();
    localStorage.setItem('token', loginData.accessToken);
    localStorage.setItem('username', loginData.name);

    // Redirect to home page after successful registration and login
    successDiv.textContent = 'Registration and login successful! Redirecting to home page...';
    form.reset(); // Clear the form
    setTimeout(() => {
        window.location.href = 'index.html'; // Redirect to home page
    }, 2000);

});