// ==========================================
// ১. ইনপুটে টাইপ করা শুরু করলেই এরর মেসেজ গায়েব করার ফাংশন
// ==========================================
const clearErrorOnInput = () => {
    const errorElement = document.getElementById('user-login-error');
    if (errorElement) {
        errorElement.classList.add("hidden");
    }
};

// ==========================================
// ২. ফেচ ফাংশন (সার্ভার রিকোয়েস্ট)
// ==========================================
const fetchUserInfo = async (user) => {
    try {
        const res = await fetch('http://localhost:5000/login', {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(user),
        });

        const data = await res.json();
        return data; 
    } 
    catch (err) {
        console.error("Error connecting to the server:", err);
        return { success: false, error: err.message };
    }
};

// ==========================================
// ৩. মেইন হ্যান্ডলার ফাংশন
// ==========================================
const handleLogin = async (event) => {
    if (event) event.preventDefault();

    const emailInput = document.getElementById('email');
    const userpassInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember-me'); 
    const errorElement = document.getElementById('user-login-error');
    const loginBtn = document.querySelector('.login-btn');

    if (!emailInput || !userpassInput) return;

    const email = emailInput.value.trim();
    const password = userpassInput.value.trim();

    // ফিল্ড খালি থাকলে
    if (!email || !password) {
        if (errorElement) {
            errorElement.innerText = "Please fill in both Email and Password!";
            errorElement.classList.remove("hidden");
        }
        return;
    }

    // --- রিকোয়েস্ট শুরু: বাটন ডিসেবল ও লোডিং স্টেট ---
    if (loginBtn) {
        loginBtn.innerText = "Logging in...";
        loginBtn.disabled = true;
        loginBtn.style.opacity = "0.7";
        loginBtn.style.cursor = "not-allowed";
    }

    if (errorElement) errorElement.classList.add("hidden");

    const user = {
        email: email,
        password: password
    };

    // সার্ভারে ডেটা পাঠানো
    const responseData = await fetchUserInfo(user);

    // --- রিকোয়েস্ট শেষ: বাটন পুনরায় এনাবল করা ---
    if (loginBtn) {
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
        loginBtn.style.opacity = "1";
        loginBtn.style.cursor = "pointer";
    }

    // রেসপন্স চেক করা
    if (!responseData || !responseData.success) {
        if (errorElement) {
            errorElement.innerText = responseData.message || "Your email or password must be wrong";
            errorElement.classList.remove("hidden");
        }
    } else {
        if (errorElement) {
            errorElement.classList.add("hidden");
        }

        const loggedUser = responseData.user; 

        // 📌 Remember Me চেকের ওপর ভিত্তি করে ডেটা সেভ
        if (rememberMeInput && rememberMeInput.checked) {
            localStorage.setItem("loggedInUser", JSON.stringify(loggedUser)); 
            localStorage.setItem("savedEmail", email); 
            localStorage.setItem("savedPassword", password); 
        } else {
            sessionStorage.setItem("loggedInUser", JSON.stringify(loggedUser)); 
            localStorage.removeItem("savedEmail");
            localStorage.removeItem("savedPassword");
        }

        window.location.href = "journal.html"; // ড্যাশবোর্ড পেজে রিডাইরেক্ট
    }
};

// ==========================================
// ৪. পাসওয়ার্ড শো/হাইডের ফাংশন
// ==========================================
const togglePassword = () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggle-password');

    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        if (toggleIcon) {
            toggleIcon.classList.remove("fa-eye");
            toggleIcon.classList.add("fa-eye-slash");
        }
    } else {
        passwordInput.type = "password";
        if (toggleIcon) {
            toggleIcon.classList.remove("fa-eye-slash");
            toggleIcon.classList.add("fa-eye");
        }
    }
};

// ==========================================
// ৫. সমস্ত DOMContentLoaded লজিক একত্রিত করা হলো
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeInput = document.getElementById('remember-me');
    
    // ইনপুট দিলে এরর মুছে ফেলা
    emailInput?.addEventListener('input', clearErrorOnInput);
    passwordInput?.addEventListener('input', clearErrorOnInput);

    // ফর্ম সাবমিশন ইভেন্ট কানেক্ট করা
    const loginForm = document.querySelector('form') || document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 📌 অটো-ফিল চেক (Remember Me)
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");

    if (savedEmail && savedPassword && emailInput && passwordInput) {
        emailInput.value = savedEmail;
        passwordInput.value = savedPassword;
        if (rememberMeInput) {
            rememberMeInput.checked = true;
        }
    }

    // 📌 রেজিস্ট্রেশন সফল হয়ে আসলে সাকসেস মেসেজ দেখানোর লজিক
    // (আপনার HTML এ মেসেজ বক্সের আইডি যদি success-message হয়, তবে নিচকার আইডি পরিবর্তন করে নেবেন)
    const successBox = document.getElementById('success-banner') || document.querySelector('.success-message');
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('registered') === 'true') {
        if (successBox) {
            successBox.style.display = 'block'; // বা 'flex' আপনার ডিজাইন অনুযায়ী
        }
    } else {
        if (successBox) {
            successBox.style.display = 'none'; // নরমাল অবস্থায় হাইড থাকবে
        }
    }

    // ইউজার লিখতে শুরু করলেই মেসেজটি গায়েব হয়ে যাবে এবং URL ক্লিন হবে
    const hideSuccessMessage = () => {
        if (successBox && (successBox.style.display === 'block' || successBox.style.display === 'flex')) {
            successBox.style.display = 'none';
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    if (emailInput) emailInput.addEventListener('input', hideSuccessMessage);
    if (passwordInput) passwordInput.addEventListener('input', hideSuccessMessage);
});