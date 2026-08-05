const postContainer = document.getElementById("post-container");
const allPostsContainer = document.getElementById("all-posts-container");
const favoritesPostsContainer = document.getElementById("favorites-posts-container");
const totalEntriesNumber = document.getElementById("total-entries-number");
const thisMonthEntries = document.getElementById("this-month-entries");
const totalFavoritesNumber = document.getElementById("total-favorites-number");
const mostMoodText = document.getElementById("most-mood-text");
const totalEntriesCount = document.getElementById("total-entries-count");
const totalFavoritesCount = document.getElementById("total-favorites-count");

// সার্চ ও ফিল্টার এলিমেন্ট
const searchJournalInput = document.getElementById("search-journal-input");
const sortMoodSelect = document.getElementById("sort-mood-select");
const sortDateSelect = document.getElementById("sort-date-select");

// মোডাল ও ফর্ম এলিমেন্ট
const showBtn = document.getElementById("show-btn");
const myForm = document.getElementById("my-form");
const closeForm = document.getElementById("close-form");
const cancelBtn = document.getElementById("cancel-btn");
const saveBtn = document.getElementById("save-btn");
const formHeading = document.getElementById("form-heading");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const moodInput = document.getElementById("mood");
const imageInput = document.getElementById("journal-image");
const fileChosenName = document.getElementById("file-chosen-name");

// নেভিগেশন এলিমেন্ট
const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
const homeSection = document.getElementById("home-section");
const allEntriesSection = document.getElementById("all-entries-section");
const favoritesSection = document.getElementById("favorites-section");
const settingsSection = document.getElementById("settings-section");
const dashboardHeader = document.getElementById("dashboard-header");

// সেটিংস পেজের ইনপুট ও বাটন
const settingsNameInput = document.getElementById("settings-name-input");
const settingsPicInput = document.getElementById("settings-pic-input");
const saveSettingsBtn = document.getElementById("save-settings-btn");
const deleteAllJournalsBtn = document.getElementById("delete-all-journals-btn");

// প্রোফাইল ড্রপডাউন ও লগআউট
const profileDropdownTrigger = document.getElementById("profile-dropdown-trigger");
const profileDropdownMenu = document.getElementById("profile-dropdown-menu");
const logoutBtn = document.getElementById("logout-btn");

// ডিলিট ও ডিটেইল মোডাল
const deleteModal = document.getElementById("delete-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const journalDetailModal = document.getElementById("journal-detail-modal");
const closeDetailModal = document.getElementById("close-detail-modal");
const modalDetailBody = document.getElementById("modal-detail-body");

// প্রোফাইল এলিমেন্ট সিলেক্টর
const sidebarProfileImg = document.getElementById("sidebar-profile-img");
const sidebarProfileName = document.getElementById("sidebar-profile-name");
const welcomeUserHeading = document.getElementById("welcome-user-heading");

let allLoadedPosts = [];
let favoritesList = JSON.parse(localStorage.getItem("journalFavorites")) || [];
let editPostId = null;
let deletePostId = null;
let currentCalendarDate = new Date();

// ==========================================
// 📌 Authentication & Back Arrow Protection
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // ১. চেক করুন ইউজার লগইন করা আছে কিনা
    const loggedInUser = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");

    if (!loggedInUser) {
        window.location.replace("index.html");
        return;
    }

    // ২. ব্যাক বাটন (Back Arrow) প্রটেকশন ও হিস্ট্রি ট্র্যাপ
    history.pushState(null, null, location.href);
    
    window.addEventListener('popstate', function () {
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("loggedInUser");
        
        history.pushState(null, null, location.href);
        window.location.replace("index.html");
    });
});

// Profile Dropdown Toggle
if (profileDropdownTrigger && profileDropdownMenu) {
    profileDropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdownMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
        profileDropdownMenu.classList.add("hidden");
    });
}

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        sessionStorage.removeItem("loggedInUser");
        window.location.href = 'index.html';
    });
}

// ==========================================
// 📌 Load Logged-in User Info & Time-based Greeting
// ==========================================
const loadUserProfile = () => {
    const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    if (savedUserStr) {
        try {
            const user = JSON.parse(savedUserStr);
            let fullName = user.name || "Nusrat";
            const firstName = fullName.trim().split(" ")[0]; 
            
            if (sidebarProfileName) sidebarProfileName.innerText = firstName;
            
            // সময় অনুযায়ী গ্রিটিংস নির্ধারণ
            const currentHour = new Date().getHours();
            let greetingText = "";
            let emoji = "";

            // সকাল ৫টা থেকে দুপুর ১২টা পর্যন্ত (৫ - ১১:৫৯)
            if (currentHour >= 5 && currentHour < 12) {
                greetingText = "Good Morning";
                emoji = "☀️";
            } 
            // দুপুর ১২টা থেকে বিকেল ৫টা পর্যন্ত (১২ - ১৬:৫৯)
            else if (currentHour >= 12 && currentHour < 17) {
                greetingText = "Good Afternoon";
                emoji = "🌤️";
            } 
            // বিকেল ৫টা থেকে সন্ধ্যা ৭টা পর্যন্ত (১৭ - ১৮:৫৯)
            else if (currentHour >= 17 && currentHour < 19) {
                greetingText = "Good Evening";
                emoji = "🌙";
            } 
            // রাত ৭টা থেকে ভোর ৫টা পর্যন্ত (১৯ - ৪:৫৯)
            else {
                greetingText = "Good Night";
                emoji = "✨";
            }

            if (welcomeUserHeading) {
                welcomeUserHeading.innerHTML = `${greetingText}, ${firstName}! ${emoji}`;
            }

            if (settingsNameInput) settingsNameInput.value = fullName;

            let userPic = user.profile_pic || user.image;
            let finalImgPath = "";

            if (userPic && userPic.trim() !== "") {
                if (!userPic.startsWith("http") && !userPic.startsWith("data:image")) {
                    finalImgPath = "http://localhost:5000/" + userPic.replace(/\\/g, '/');
                } else {
                    finalImgPath = userPic;
                }
            } else {
                finalImgPath = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;
            }

            if (sidebarProfileImg) sidebarProfileImg.src = finalImgPath;
            const settingsPreviewImg = document.getElementById("settings-preview-img");
            if (settingsPreviewImg) settingsPreviewImg.src = finalImgPath;

        } catch (e) {
            console.error("Error parsing user profile:", e);
        }
    }
};

// ==========================================
// 📌 Save Settings Handler
// ==========================================
if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
        const isLocal = localStorage.getItem("loggedInUser");
        const storageObj = isLocal ? localStorage : sessionStorage;
        const savedUserStr = storageObj.getItem("loggedInUser");
        
        if (savedUserStr) {
            try {
                let user = JSON.parse(savedUserStr);
                const newName = settingsNameInput.value.trim();
                if (newName) user.name = newName;

                const file = settingsPicInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        user.profile_pic = e.target.result;
                        storageObj.setItem("loggedInUser", JSON.stringify(user));
                        loadUserProfile();
                        alert("Settings updated successfully!");
                    };
                    reader.readAsDataURL(file);
                } else {
                    storageObj.setItem("loggedInUser", JSON.stringify(user));
                    loadUserProfile();
                    alert("Settings updated successfully!");
                }
            } catch (err) {
                console.error("Error updating settings:", err);
            }
        } else {
            alert("No logged-in user found.");
        }
    });
}

// Delete All Journals Handler (Danger Zone)
if (deleteAllJournalsBtn) {
    deleteAllJournalsBtn.addEventListener("click", async () => {
        if (confirm("Are you absolutely sure you want to delete all your journals? This cannot be undone.")) {
            try {
                let currentUserId = null;
                const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
                if (savedUserStr) {
                    const parsedUser = JSON.parse(savedUserStr);
                    currentUserId = parsedUser.id || parsedUser.user_id;
                }
                
                alert("All journals deleted successfully.");
                loadJournals();
            } catch (err) {
                console.error("Error deleting all journals:", err);
            }
        }
    });
}

const saveFavoritesToStorage = () => {
    localStorage.setItem("journalFavorites", JSON.stringify(favoritesList));
};

// ==========================================
// 📌 Dynamic Calendar Generation
// ==========================================
const renderDynamicCalendar = (posts) => {
    const calendarGridContainer = document.getElementById("calendar-grid-container");
    const calMonthTitle = document.getElementById("cal-month-title");
    
    if (!calendarGridContainer || !calMonthTitle) return;

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    calMonthTitle.innerText = `${monthNames[month]} ${year}`;

    const journalDates = new Set();
    if (posts) {
        posts.forEach(p => {
            const pTime = p.time || p.createdAt || p.created_at;
            if (pTime) {
                const d = new Date(pTime);
                if (!isNaN(d)) {
                    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    journalDates.add(dateStr);
                }
            }
        });
    }

    let calendarHTML = `<span class="cal-day-name">Su</span><span class="cal-day-name">Mo</span><span class="cal-day-name">Tu</span><span class="cal-day-name">We</span><span class="cal-day-name">Th</span><span class="cal-day-name">Fr</span><span class="cal-day-name">Sa</span>`;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        calendarHTML += `<span class="cal-date muted-date" style="opacity: 0.3;"></span>`;
    }

    for (let day = 1; day <= totalDays; day++) {
        const currentStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let classList = "cal-date";
        if (journalDates.has(currentStr)) classList += " active-date";
        calendarHTML += `<span class="${classList}" title="${currentStr}">${day}</span>`;
    }
    calendarGridContainer.innerHTML = calendarHTML;
};

const prevMonthBtn = document.getElementById("cal-prev-btn");
const nextMonthBtn = document.getElementById("cal-next-btn");

if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderDynamicCalendar(allLoadedPosts);
    });
}
if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderDynamicCalendar(allLoadedPosts);
    });
}

// ==========================================
// 📌 Dashboard Stats Update
// ==========================================
const updateDashboardStats = (posts) => {
    if (!posts) return;
    if (totalEntriesNumber) totalEntriesNumber.innerText = posts.length;

    if (thisMonthEntries) {
        const currentMonth = new Date().getMonth(); 
        const currentYear = new Date().getFullYear(); 
        const monthCount = posts.filter(p => {
            const pDate = new Date(p.time || p.createdAt || p.created_at);
            return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
        }).length;
        thisMonthEntries.innerText = monthCount;
    }

    if (totalFavoritesNumber) {
        const favoritePosts = posts.filter(post => favoritesList.includes(post.id));
        totalFavoritesNumber.innerText = favoritePosts.length;
    }

    if (mostMoodText && posts.length > 0) {
        const moodCounts = {};
        posts.forEach(p => {
            if (p.mood) moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
        });
        let mostFrequentMood = "😊 Grateful";
        let maxCount = 0;
        for (const [mood, count] of Object.entries(moodCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequentMood = mood;
            }
        }
        mostMoodText.innerText = mostFrequentMood;
    } else if (mostMoodText) {
        mostMoodText.innerText = "No moods yet";
    }

    const moodTotalCountEl = document.getElementById("mood-total-count");
    const moodListContainer = document.querySelector(".mood-list");
    if (moodTotalCountEl) moodTotalCountEl.innerText = posts.length;

    if (moodListContainer) {
        if (posts.length === 0) {
            moodListContainer.innerHTML = `<p style="color: #8c7365; font-size: 13px; text-align: center; margin: 0;">No moods recorded yet.</p>`;
        } else {
            const moodCounts = {};
            posts.forEach(p => {
                if (p.mood) moodCounts[p.mood] = (moodCounts[p.mood] || 0) + 1;
            });
            let moodHTML = "";
            for (const [mood, count] of Object.entries(moodCounts)) {
                const percentage = Math.round((count / posts.length) * 100);
                moodHTML += `<div class="mood-item-row"><span>${mood}</span> <span>${percentage}%</span></div>`;
            }
            moodListContainer.innerHTML = moodHTML;
        }
    }
    renderDynamicCalendar(posts);
};

// ==========================================
// 📌 Load All Journals
// ==========================================
const loadJournals = async () => {
    try {
        let currentUserId = null;
        const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
        if (savedUserStr) {
            const parsedUser = JSON.parse(savedUserStr);
            currentUserId = parsedUser.id || parsedUser.user_id;
        }

        let url = "http://localhost:5000/getAllpost";
        if (currentUserId) url += `?user_id=${currentUserId}`;

        const response = await fetch(url);
        const result = await response.json(); 
        allLoadedPosts = result.data || []; 
        updateDashboardStats(allLoadedPosts);
        renderFilteredAndSortedPosts();
    } catch (error) {
        console.error("Error loading journals:", error);
    }
};

// ==========================================
// 📌 Filter & Sort Logic
// ==========================================
const renderFilteredAndSortedPosts = () => {
    if (!allLoadedPosts) return;
    let filteredPosts = [...allLoadedPosts];

    const searchTerm = searchJournalInput ? searchJournalInput.value.toLowerCase().trim() : "";
    if (searchTerm) {
        filteredPosts = filteredPosts.filter(post => post.title && post.title.toLowerCase().includes(searchTerm));
    }

    const selectedMood = sortMoodSelect ? sortMoodSelect.value : "";
    if (selectedMood) {
        filteredPosts = filteredPosts.filter(post => post.mood === selectedMood);
    }

    const sortOrder = sortDateSelect ? sortDateSelect.value : "newest";
    filteredPosts.sort((a, b) => {
        let dateA = new Date(a.time || a.createdAt || a.created_at);
        let dateB = new Date(b.time || b.createdAt || b.created_at);
        return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });

    if (postContainer) postContainer.innerHTML = "";
    if (allPostsContainer) allPostsContainer.innerHTML = "";
    if (favoritesPostsContainer) favoritesPostsContainer.innerHTML = "";

    if (totalEntriesCount) totalEntriesCount.innerText = `Total: ${filteredPosts.length} entries`;

    if (filteredPosts.length === 0) {
        const emptyMsg = `<p style="text-align: center; color: #8c7365; padding: 20px;">No journal entries found.</p>`;
        if (postContainer) postContainer.innerHTML = emptyMsg;
        if (allPostsContainer) allPostsContainer.innerHTML = emptyMsg;
        if (favoritesPostsContainer) favoritesPostsContainer.innerHTML = emptyMsg;
        if (totalFavoritesCount) totalFavoritesCount.innerText = `Total: 0 favorites`;
        return;
    }

    const recentPosts = filteredPosts.slice(0, 5);
    const favoritePosts = filteredPosts.filter(post => favoritesList.includes(post.id));
    if (totalFavoritesCount) totalFavoritesCount.innerText = `Total: ${favoritePosts.length} favorites`;

    const createCardHTML = (post) => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("journal-card");

        let day = "3";
        let month = "Aug 2026";
        const postTimeString = post.time || post.createdAt || post.created_at; 
        let formattedTime = postTimeString;
        if (postTimeString && typeof timeDiff === 'function') formattedTime = timeDiff(postTimeString);

        let editedText = (post.updated_at && post.updated_at !== postTimeString) ? ` <span style="font-size: 11px; color: #a68b7c; font-style: italic;">(Edited)</span>` : "";

        if (postTimeString) {
            const postDate = new Date(postTimeString);
            if (!isNaN(postDate)) {
                day = postDate.getDate();
                month = postDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
            }
        }

        const isFav = favoritesList.includes(post.id);
        const starClass = isFav ? "fa-solid favorited" : "fa-regular";

        cardDiv.innerHTML = `
            <div class="journal-date-box">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </div>
            <div class="journal-content-box" style="cursor: pointer;" title="Click to read full journal">
                <h3 class="journal-title" style="margin: 0; font-size: 18px; color: #4a3b32;">${post.title || "Untitled"}</h3>
                <div class="journal-meta" style="margin-top: 8px;">
                    <span class="read-time"><i class="fa-regular fa-clock"></i> ${formattedTime || ''} ${editedText}</span>
                    <span class="mood-tag happy">${post.mood || "😊 Grateful"}</span>
                </div>
            </div>
            <div class="journal-actions">
                <button class="favorite-btn ${isFav ? 'favorited' : ''}" title="Favorite"><i class="${starClass} fa-star"></i></button>
                <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
            </div>
        `;

        cardDiv.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (favoritesList.includes(post.id)) {
                favoritesList = favoritesList.filter(id => id !== post.id);
            } else {
                favoritesList.push(post.id);
            }
            saveFavoritesToStorage();
            renderFilteredAndSortedPosts(); 
        });

        cardDiv.querySelector('.journal-content-box').addEventListener('click', () => {
            let imageUrl = post.image ? "http://localhost:5000/" + post.image.replace(/\\/g, '/') : "";
            openDetailPopup(post.title, post.content, imageUrl, formattedTime + (editedText ? " (Edited)" : ""));
        });

        cardDiv.querySelector('.edit-btn').addEventListener('click', () => {
            openEditModal(post.id, post.title, post.content, post.mood);
        });

        cardDiv.querySelector('.delete-btn').addEventListener('click', () => {
            promptDelete(post.id);
        });

        return cardDiv;
    };

    recentPosts.forEach(post => { if (postContainer) postContainer.appendChild(createCardHTML(post)); });
    filteredPosts.forEach(post => { if (allPostsContainer) allPostsContainer.appendChild(createCardHTML(post)); });
    
    if (favoritePosts.length === 0) {
        if (favoritesPostsContainer) favoritesPostsContainer.innerHTML = `<p style="text-align: center; color: #8c7365; padding: 20px;">No favorite journals found.</p>`;
    } else {
        favoritePosts.forEach(post => { if (favoritesPostsContainer) favoritesPostsContainer.appendChild(createCardHTML(post)); });
    }
};

if (searchJournalInput) searchJournalInput.addEventListener("input", renderFilteredAndSortedPosts);
if (sortMoodSelect) sortMoodSelect.addEventListener("change", renderFilteredAndSortedPosts);
if (sortDateSelect) sortDateSelect.addEventListener("change", renderFilteredAndSortedPosts);

// ==========================================
// 📌 Modal & CRUD Functions
// ==========================================
const openModal = () => {
    editPostId = null;
    if (formHeading) formHeading.innerText = "📝 New Journal Entry";
    if (titleInput) titleInput.value = "";
    if (contentInput) contentInput.value = "";
    if (moodInput) moodInput.value = "😊 Grateful";
    if (imageInput) imageInput.value = "";
    if (fileChosenName) fileChosenName.innerText = "JPG, PNG (Max 2MB)";
    if (myForm) myForm.classList.remove("hidden");
};

const closeModalFn = () => { if (myForm) myForm.classList.add("hidden"); };

if (showBtn) showBtn.addEventListener("click", openModal);
if (closeForm) closeForm.addEventListener("click", closeModalFn);
if (cancelBtn) cancelBtn.addEventListener("click", closeModalFn);

// File input change event for image name preview
if (imageInput) {
    imageInput.addEventListener("change", function() {
        if (fileChosenName) {
            if (this.files && this.files[0]) {
                fileChosenName.innerText = this.files[0].name;
            } else {
                fileChosenName.innerText = "JPG, PNG (Max 2MB)";
            }
        }
    });
}

const openEditModal = (id, title, content, mood) => {
    editPostId = id;
    if (formHeading) formHeading.innerText = "✏️ Edit Journal Entry";
    if (titleInput) titleInput.value = title || "";
    if (contentInput) contentInput.value = content || "";
    if (moodInput) moodInput.value = mood || "😊 Grateful";
    if (imageInput) imageInput.value = "";
    if (fileChosenName) fileChosenName.innerText = "JPG, PNG (Max 2MB)";
    if (myForm) myForm.classList.remove("hidden");
};

if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const mood = moodInput.value;
        const imageFile = imageInput.files[0];

        if (!title || !content) {
            alert("Please fill in both title and content!");
            return;
        }

        let currentUserId = null;
        const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
        if (savedUserStr) {
            const parsedUser = JSON.parse(savedUserStr);
            currentUserId = parsedUser.id || parsedUser.user_id;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("mood", mood);
        if (currentUserId) formData.append("user_id", currentUserId);
        if (imageFile) formData.append("image", imageFile);

        try {
            let url = "http://localhost:5000/createPost";
            let method = "POST";
            if (editPostId) {
                url = `http://localhost:5000/updatePost/${editPostId}`;
                method = "PUT";
            }
            const response = await fetch(url, { method: method, body: formData });
            const result = await response.json();
            if (response.ok) {
                closeModalFn();
                loadJournals();
            } else {
                alert(result.message || "Failed to save journal");
            }
        } catch (error) {
            console.error("Error saving journal:", error);
        }
    });
}

const promptDelete = (id) => {
    deletePostId = id;
    if (deleteModal) deleteModal.classList.remove("hidden");
};

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
        deletePostId = null;
        if (deleteModal) deleteModal.classList.add("hidden");
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!deletePostId) return;
        try {
            const response = await fetch(`http://localhost:5000/deletePost/${deletePostId}`, { method: "DELETE" });
            if (response.ok) {
                if (deleteModal) deleteModal.classList.add("hidden");
                deletePostId = null;
                loadJournals();
            } else {
                alert("Failed to delete journal");
            }
        } catch (error) {
            console.error("Error deleting journal:", error);
        }
    });
}

const openDetailPopup = (title, content, imageUrl, timeStr) => {
    if (modalDetailBody) {
        modalDetailBody.innerHTML = `
            <h2 style="color: #4a3b32; margin-bottom: 10px;">${title || "Untitled"}</h2>
            <p style="font-size: 13px; color: #8c7365; margin-bottom: 20px;"><i class="fa-regular fa-clock"></i> ${timeStr}</p>
            ${imageUrl ? `<img src="${imageUrl}" style="display: block; max-width: 100%; border-radius: 8px; margin: 0 auto 20px auto;" alt="Journal Image">` : ""}
            <p style="color: #5a4a42; line-height: 1.6; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word;">${content}</p>
        `;
    }
    if (journalDetailModal) journalDetailModal.classList.remove("hidden");
};

if (closeDetailModal) {
    closeDetailModal.addEventListener("click", () => { if (journalDetailModal) journalDetailModal.classList.add("hidden"); });
}
if (journalDetailModal) {
    journalDetailModal.addEventListener("click", (e) => {
        if (e.target === journalDetailModal) journalDetailModal.classList.add("hidden");
    });
}

// ==========================================
// 📌 Sidebar Navigation Switching
// ==========================================
navItems.forEach((item, index) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        if (dashboardHeader) dashboardHeader.classList.add("hidden");
        if (homeSection) homeSection.classList.add("hidden");
        if (allEntriesSection) allEntriesSection.classList.add("hidden");
        if (favoritesSection) favoritesSection.classList.add("hidden");
        if (settingsSection) settingsSection.classList.add("hidden");

        const recentEntriesSection = document.querySelector(".recent-journals-section.dash-recent-wrapper");
        if (recentEntriesSection) recentEntriesSection.classList.add("hidden");

        if (index === 0) { 
            // Home
            if (dashboardHeader) dashboardHeader.classList.remove("hidden");
            if (homeSection) homeSection.classList.remove("hidden");
            if (recentEntriesSection) recentEntriesSection.classList.remove("hidden");
        } else if (index === 1) { 
            // All Entries
            if (allEntriesSection) allEntriesSection.classList.remove("hidden");
        } else if (index === 2) { 
            // Favorites
            if (favoritesSection) favoritesSection.classList.remove("hidden");
        } else if (index === 3) { 
            // Settings
            if (settingsSection) settingsSection.classList.remove("hidden");
        }
    });
});

// Initial Execution
loadUserProfile();
loadJournals();