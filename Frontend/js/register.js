const handleRegister = async () => {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('user-register-error');

    if (!nameInput || !emailInput || !passwordInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const newUser = {
        name: name,
        email: email,
        password: password
    };

    console.log(newUser);

    try {
        const res = await fetch('http://localhost:5000/register', {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(newUser),
        });

        const data = await res.json();
        console.log(data);

        // সফলভাবে রেজিস্টার হলে বা রেজাল্ট আসলে লগইন পেজে রিডাইরেক্ট করবে
        if (data) {
            if (errorElement) {
                errorElement.classList.add("hidden");
            }
            alert("Registration successful!");
            window.location.href = "index.html";
        }
    } 
    catch (err) {
        console.log("Error connecting to the server", err);
        if (errorElement) {
            errorElement.innerText = "Registration failed! Email might already exist.";
            errorElement.classList.remove("hidden");
        }
    }
};