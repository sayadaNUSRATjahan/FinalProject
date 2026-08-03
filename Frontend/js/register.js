// ১. হেলপার ফাংশন: আপলোড করা ছবিকে Base64 স্ট্রিং-এ কনভার্ট করার জন্য
const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// ২. প্রধান রেজিস্ট্রেশন হ্যান্ডলার
const handleRegister = async () => {
    // HTML DOM এলিমেন্টগুলো ধরা
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const dobInput = document.getElementById('dob');
    const quoteInput = document.getElementById('quote');
    const profilePicInput = document.getElementById('profile-pic');
    const errorElement = document.getElementById('user-register-error');

    // এরর দেখানোর ফাংশন
    const showError = (message) => {
        if (errorElement) {
            errorElement.innerText = message;
            errorElement.classList.remove("hidden");
            errorElement.style.display = "block";
        }
    };

    // আগের কোনো এরর থাকলে রিমুভ করা
    if (errorElement) {
        errorElement.classList.add("hidden");
        errorElement.innerText = "";
        errorElement.style.display = "none";
    }

    // ইনপুট ভ্যালু নেওয়া
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';
    const dob = dobInput ? dobInput.value : '';
    const quote = quoteInput ? quoteInput.value.trim() : '';

    // ৩. ফ্রন্টএন্ড ভ্যালিডেশন (Front-end Validation)
    if (!name || !email || !password || !confirmPassword || !dob) {
        showError("Please fill in all required fields!");
        return;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match!");
        return;
    }

    if (password.length < 6) {
        showError("Password must be at least 6 characters long!");
        return;
    }

    // ৪. প্রোফাইল পিকচার হ্যান্ডলিং (যদি ছবি আপলোড করে থাকে)
    let profilePicBase64 = "";
    if (profilePicInput && profilePicInput.files.length > 0) {
        try {
            profilePicBase64 = await convertFileToBase64(profilePicInput.files[0]);
        } catch (err) {
            console.error("Error converting image:", err);
            showError("Failed to process profile picture!");
            return;
        }
    }

    // ৫. সার্ভারে পাঠানোর জন্য পেলোড অবজেক্ট
    const newUser = {
        name: name,
        email: email,
        password: password,
        dob: dob,
        quote: quote,
        profilePic: profilePicBase64
    };

    console.log("Sending payload to server:", newUser);

    // ৬. Express Backend-এ POST রিকোয়েস্ট পাঠানো
    try {
        const res = await fetch('http://localhost:5000/register', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        });

        const data = await res.json();
        console.log("Response from server:", data);

        if (res.ok) {
            alert("Registration successful!");
            window.location.href = "index.html"; // লগইন পেজে রিডাইরেক্ট
        } else {
            showError(data.message || "Registration failed! Email might already exist.");
        }
    } 
    catch (err) {
        console.error("Error connecting to the server:", err);
        showError("Unable to connect to the server. Please try again later.");
    }
};

// পাসওয়ার্ড শো/হাইডের ফাংশন (এটি আলাদাভাবে বাইরে থাকবে)
function togglePasswordVisibility(inputId, iconId) {
    const inputField = document.getElementById(inputId);
    const toggleIcon = document.getElementById(iconId);

    if (inputField.type === "password") {
        inputField.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash"); // চোখ কাটা আইকন আসবে
    } else {
        inputField.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye"); // সাধারণ চোখ আইকন আসবে
    }
}