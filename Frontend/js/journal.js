const postContainer = document.getElementById("post-container");
const formModal = document.getElementById("my-form");
const showBtn = document.getElementById("show-btn");
const closeForm = document.getElementById("close-form");
const cancelBtn = document.getElementById("cancel-btn");
const saveBtn = document.getElementById("save-btn");
const formHeading = document.getElementById("form-heading");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const moodInput = document.getElementById("mood");
const imageInput = document.getElementById("journal-image");

const deleteModal = document.getElementById("delete-modal");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");

const journalDetailModal = document.getElementById("journal-detail-modal");
const closeDetailModal = document.getElementById("close-detail-modal");
const modalDetailBody = document.getElementById("modal-detail-body");

const dayStreakElement = document.getElementById("day-streak-number");
const totalEntriesElement = document.getElementById("total-entries-number");
const mostMoodElement = document.getElementById("most-mood-text");

// নাম এবং ডেট দেখানোর এলিমেন্ট
const userNameElement = document.getElementById("user-name");
const dateDisplayElement = document.getElementById("date-display");

let isEditMode = false;
let editPostId = null;
let postIdToDelete = null;

// ==========================================
// 📌 ড্যাশবোর্ড হেডার ও টাইম-বেসড গ্রেটিংস সেটআপ
// ==========================================
const setupDashboardHeader = () => {
    // ১. লগইন করা ইউজারের নাম সেট করা
    const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
    let userName = "User";
    if (savedUserStr) {
        try {
            const user = JSON.parse(savedUserStr);
            userName = user.name || "User";
        } catch (e) {
            console.error("User parse error", e);
        }
    }

    // ২. আপনার দেওয়া নির্দিষ্ট সময় অনুযায়ী গ্রেটিংস সেট করা
    if (userNameElement) {
        const currentHour = new Date().getHours();
        let greeting = "Good Night";

        if (currentHour >= 5 && currentHour < 12) {
            // 5:00 AM – 11:59 AM
            greeting = "Good Morning";
        } else if (currentHour >= 12 && currentHour < 17) {
            // 12:00 PM – 4:59 PM (17 মানে বিকাল ৫টা)
            greeting = "Good Afternoon";
        } else if (currentHour >= 17 && currentHour < 19) {
            // 5:00 PM – 6:59 PM (19 মানে সন্ধ্যা ৭টা)
            greeting = "Good Evening";
        } else {
            // 7:00 PM – 4:59 AM
            greeting = "Good Night";
        }

        userNameElement.innerHTML = `${greeting},<br>${userName} 🌼`;
    }

    // ৩. আজকের রিয়েল-টাইম তারিখ সেট করা
    if (dateDisplayElement) {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const today = new Date();
        dateDisplayElement.innerText = today.toLocaleDateString('en-GB', options);
    }
};

// ==========================================
// 📌 ড্যাশবোর্ড স্ট্যাটস ক্যালকুলেশন
// ==========================================
function calculateTotalEntries(journals) {
    if (!Array.isArray(journals)) return 0;
    return journals.length;
}

function calculateDayStreak(journals) {
    if (!Array.isArray(journals) || journals.length === 0) return 0;

    const uniqueDates = [...new Set(journals.map(j => {
        const postDate = j.time || j.createdAt || j.created_at;
        return postDate ? new Date(postDate).toDateString() : null;
    }))].filter(Boolean);

    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let today = new Date().toDateString();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let yesterdayString = yesterday.toDateString();

    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterdayString)) {
        return 0;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
        let expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);

        if (uniqueDates.includes(expectedDate.toDateString())) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateMostMood(journals) {
    if (!Array.isArray(journals) || journals.length === 0) return "😊 Happy";

    const moodCounts = {};
    journals.forEach(j => {
        if (j.mood) {
            moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
        }
    });

    let mostCommonMood = "😊 Happy";
    let maxCount = 0;

    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            mostCommonMood = mood;
        }
    }

    return mostCommonMood;
}

const updateDashboardStats = (posts) => {
    if (dayStreakElement) dayStreakElement.innerText = calculateDayStreak(posts);
    if (totalEntriesElement) totalEntriesElement.innerText = calculateTotalEntries(posts);
    if (mostMoodElement) mostMoodElement.innerText = calculateMostMood(posts);
};

// ==========================================
// 📌 1. Load All Journals
// ==========================================
const loadJournals = async () => {
    try {
        const response = await fetch("http://localhost:5000/getAllpost");
        const result = await response.json(); 
        
        const posts = result.data || []; 
        updateDashboardStats(posts);

        if (!postContainer) return;
        postContainer.innerHTML = "";

        if (!posts || posts.length === 0) {
            postContainer.innerHTML = `<p style="text-align: center; color: #8c7365; padding: 20px;">No journal entries found.</p>`;
            return;
        }

        posts.forEach((post) => {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("journal-card");

            let day = "3";
            let month = "Aug 2026";
            
            const postTimeString = post.time || post.createdAt || post.created_at; 
            
            // 📌 আপনার timeDiff ফাংশন ব্যবহার করা হলো
            let formattedTime = postTimeString;
            if (postTimeString && typeof timeDiff === 'function') {
                formattedTime = timeDiff(postTimeString);
            }

            let editedText = "";
            if (post.updated_at && post.updated_at !== postTimeString) {
                editedText = ` <span style="font-size: 11px; color: #a68b7c; font-style: italic;">(Edited)</span>`;
            }

            if (postTimeString) {
                const postDate = new Date(postTimeString);
                if (!isNaN(postDate)) {
                    day = postDate.getDate();
                    month = postDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
                }
            }

            cardDiv.innerHTML = `
                <div class="journal-date-box">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>

                <div class="journal-content-box" style="cursor: pointer;" title="Click to read full journal">
                    <h3 class="journal-title" style="margin: 0; font-size: 18px; color: #4a3b32;">${post.title || "Untitled"}</h3>
                    <div class="journal-meta" style="margin-top: 8px;">
                        <span class="read-time"><i class="fa-regular fa-clock"></i> ${formattedTime || ''} ${editedText}</span>
                        <span class="mood-tag happy">${post.mood || "😊 Happy"}</span>
                    </div>
                </div>

                <div class="journal-actions">
                    <button class="favorite-btn" title="Favorite"><i class="fa-regular fa-star"></i></button>
                    <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete-btn" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
                </div>
            `;

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

            postContainer.appendChild(cardDiv);
        });

    } catch (error) {
        console.error("Error loading journals:", error);
    }
};

// ==========================================
// 📌 2. Open Detail Popup
// ==========================================
window.openDetailPopup = function(title, content, imageUrl, time) {
    if (!journalDetailModal || !modalDetailBody) return;

    let imageSection = imageUrl ? `<div style="margin-top: 25px; text-align: center;"><img src="${imageUrl}" alt="Journal Image" style="max-width: 100%; max-height: 450px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1);"></div>` : "";
    
    modalDetailBody.innerHTML = `
        <h1 style="color: #6c5ce7; font-size: 28px; font-weight: 700; margin-bottom: 10px; line-height: 1.3;">${title || "Untitled"}</h1>
        <div style="font-size: 14px; color: #8c7365; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 12px;">
            <span><i class="fa-regular fa-clock"></i> ${time || ''}</span>
        </div>
        <p style="color: #333; line-height: 1.8; white-space: pre-wrap; font-size: 16px; margin-bottom: 20px;">${content || ""}</p>
        ${imageSection}
    `;
    
    journalDetailModal.classList.remove("hidden");
};

if (closeDetailModal) {
    closeDetailModal.addEventListener("click", () => journalDetailModal.classList.add("hidden"));
}

window.addEventListener("click", (e) => {
    if (e.target === journalDetailModal) journalDetailModal.classList.add("hidden");
});

// ==========================================
// 📌 3. Form Modal Logic (Add / Edit)
// ==========================================
if (showBtn) {
    showBtn.addEventListener("click", () => {
        isEditMode = false;
        editPostId = null;
        formHeading.innerText = "📝 New Journal Entry";
        saveBtn.innerText = "Save Entry";
        titleInput.value = "";
        contentInput.value = "";
        if (imageInput) imageInput.value = "";
        formModal.classList.remove("hidden");
    });
}

const closeModal = () => formModal.classList.add("hidden");
if (closeForm) closeForm.addEventListener("click", closeModal);
if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const mood = moodInput ? moodInput.value : "😊 Happy";
        const imageFile = imageInput && imageInput.files.length > 0 ? imageInput.files[0] : null;

        if (!title || !content) {
            alert("Please fill in both title and content!");
            return;
        }

        let currentUserId = 1;
        try {
            const savedUserStr = localStorage.getItem("loggedInUser") || sessionStorage.getItem("loggedInUser");
            if (savedUserStr) {
                const parsedUser = JSON.parse(savedUserStr);
                currentUserId = parsedUser.id || parsedUser.user_id || 1;
            }
        } catch (e) {
            console.error("Could not parse logged-in user", e);
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("mood", mood);
        formData.append("user_id", currentUserId);
        
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            let response;
            if (isEditMode) {
                response = await fetch(`http://localhost:5000/updatePost/${editPostId}`, { method: "PUT", body: formData });
            } else {
                response = await fetch(`http://localhost:5000/addNewPost`, { method: "POST", body: formData });
            }

            const resData = await response.json();

            if (!response.ok || !resData.success) {
                alert("Database Error: " + (resData.error || "Failed to save journal"));
                return;
            }

            if (imageInput) imageInput.value = "";
            closeModal();
            loadJournals();
        } catch (error) {
            console.error("Error saving journal:", error);
            alert("Server Error: " + error.message);
        }
    });
}

window.openEditModal = function(id, title, content, mood) {
    isEditMode = true;
    editPostId = id;
    formHeading.innerText = "✏️ Edit Journal Entry";
    saveBtn.innerText = "Update Entry";
    titleInput.value = title || "";
    contentInput.value = content || "";
    if (moodInput) moodInput.value = mood || "😊 Happy";
    if (imageInput) imageInput.value = "";
    formModal.classList.remove("hidden");
};

// ==========================================
// 📌 4. Delete Logic
// ==========================================
window.promptDelete = function(id) {
    postIdToDelete = id;
    if (deleteModal) deleteModal.classList.remove("hidden");
};

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
        postIdToDelete = null;
        if (deleteModal) deleteModal.classList.add("hidden");
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
        if (!postIdToDelete) return;
        try {
            await fetch(`http://localhost:5000/deletePost/${postIdToDelete}`, { method: "DELETE" });
            if (deleteModal) deleteModal.classList.add("hidden");
            loadJournals();
        } catch (error) {
            console.error("Error deleting journal:", error);
        }
    });
}

// Initial Calls
setupDashboardHeader();
loadJournals();