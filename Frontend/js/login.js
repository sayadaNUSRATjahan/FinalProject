// ১. ফেচ ফাংশন
const fetchUserInfo = async (user) => {
    let data;
    try {
        const res = await fetch('http://localhost:5000/getuserinfo', {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(user),
        });
        data = await res.json();
    } 
    catch (err) {
        console.log("Error connecting to the server", err);
    } 
    finally {
        return data;
    }
};

// ২. মেইন হ্যান্ডলার ফাংশন
const handleLogin = async () => {
    const emailInput = document.getElementById('email');
    const userpassInput = document.getElementById('password');
    const errorElement = document.getElementById('user-login-error');

    if (!emailInput || !userpassInput) return;

    const email = emailInput.value.trim();
    const password = userpassInput.value.trim();

    const user = {
        email: email,
        password: password,
    };

    console.log(user);
    const userInfo = await fetchUserInfo(user);

    // ইউজার ডেটা না মিললে বা ভুল হলে নির্দিষ্ট টেক্সট দেখাবে
    if (!userInfo || userInfo.length === 0) {
        if (errorElement) {
            errorElement.innerText = "Your email or password must be wrong";
            errorElement.classList.remove("hidden");
        }
    } else {
        if (errorElement) {
            errorElement.classList.add("hidden");
        }

        // লোকাল স্টোরেজে ইউজার ইনফো সেভ করা
        localStorage.setItem("loggedInUser", JSON.stringify(userInfo[0]));

        // জর্নাল পেজে রিডাইরেক্ট করা
        window.location.href = "journal.html";
    }
};

// ৩. পাসওয়ার্ড চোখের আইকন দিয়ে টগল করার ফাংশন
const togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password');

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
};