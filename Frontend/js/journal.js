const formBox = document.getElementById("my-form");
const showBtn = document.getElementById("show-btn");
const cancelBtn = document.getElementById("cancel-btn");
const closeForm = document.getElementById("close-form");

const saveBtn = document.getElementById("save-btn");
const logoutBtn = document.getElementById("logout-btn");

const postContainer = document.getElementById("post-container");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const moodInput = document.getElementById("mood");

const formHeading = document.getElementById("form-heading");

let editMode = false;
let editPostId = null;

// ===============================
// SHOW NEW ENTRY FORM
// ===============================
showBtn.addEventListener("click", () => {
    editMode = false;
    editPostId = null;

    titleInput.value = "";
    contentInput.value = "";
    moodInput.value = "😊 Grateful";

    formHeading.textContent = "📝 New Journal Entry";
    saveBtn.textContent = "Save Entry";
    formBox.classList.remove("hidden");
});

// ===============================
// CLOSE FORM
// ===============================
cancelBtn.addEventListener("click", () => {
    formBox.classList.add("hidden");
});

closeForm.addEventListener("click", () => {
    formBox.classList.add("hidden");
});

// ===============================
// LOAD ALL JOURNALS
// ===============================
const loadJournals = async () => {
    try {
        const response = await fetch("http://localhost:5000/getAllpost");
        let posts = await response.json();

        posts.sort(
            (a, b) =>
                new Date(b.time || b.id) -
                new Date(a.time || a.id)
        );

        postContainer.innerHTML = "";

        posts.forEach(post => {
            const div = document.createElement("div");
            div.classList.add("card");

            let formattedTime = "Just now";
            let formattedDate = "";

            if (post.time) {
                const postDate = new Date(post.time);
                formattedTime = timeDiff(post.time);
                formattedDate = postDate.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                });
            }

            const rawContent = (post.content || "").trim();
            const maxLength = 120;
            let contentBody = rawContent;
            let showMoreHtml = "";

            if (rawContent.length > maxLength) {
                const shortText = rawContent.substring(0, maxLength) + "...";
                const uniqueId = `content-${post.id}`;

                contentBody = `
                    <span id="${uniqueId}-short">${shortText}</span>
                    <span id="${uniqueId}-full" style="display: none;">${rawContent}</span>
                `;

                showMoreHtml = ` <span id="${uniqueId}-btn" style="color: #8B4513; cursor: pointer; font-weight: bold; text-decoration: underline; display: inline;" onclick="toggleReadMore(${post.id})">Show More</span>`;
            }

            div.innerHTML = `
                <div class="card-content">
                    <h3>
                        ${post.title}
                    </h3>

                    <p class="card-meta">
                        ${formattedDate ? `${formattedDate}` : "Today"}
                        &nbsp; • &nbsp;
                        ${formattedTime}
                        &nbsp; • &nbsp;
                        ${post.mood || "😌 Peaceful"}
                    </p>

                    <p class="journal-text" style="margin-top: 8px; margin-bottom: 0; line-height: 1.4; word-break: break-word;">
                        ${contentBody}${showMoreHtml}
                    </p>
                </div>

                <div class="card-actions">
                    <button
                        class="edit-btn"
                        onclick="openEditModal(
                            ${post.id},
                            '${escapeText(post.title)}',
                            '${escapeText(post.content)}',
                            '${escapeText(post.mood || "")}'
                        )"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteJournal(${post.id})"
                    >
                        Delete
                    </button>
                </div>
            `;

            postContainer.appendChild(div);
        });

    } catch (error) {
        console.log("Error loading journals:", error);
    }
};

// ===============================
// TOGGLE SHOW MORE / SHOW LESS
// ===============================
window.toggleReadMore = (id) => {
    const shortSpan = document.getElementById(`content-${id}-short`);
    const fullSpan = document.getElementById(`content-${id}-full`);
    const btn = document.getElementById(`content-${id}-btn`);

    if (fullSpan.style.display === "none") {
        shortSpan.style.display = "none";
        fullSpan.style.display = "inline";
        btn.textContent = "Show Less";
    } else {
        shortSpan.style.display = "inline";
        fullSpan.style.display = "none";
        btn.textContent = "Show More";
    }
};

// ===============================
// ESCAPE TEXT
// ===============================
function escapeText(text) {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n");
}

// ===============================
// OPEN EDIT FORM
// ===============================
window.openEditModal = (
    id,
    title,
    content,
    mood
) => {
    editMode = true;
    editPostId = id;

    titleInput.value = title;
    contentInput.value = content;
    moodInput.value = mood;

    formHeading.textContent = "✏️ Edit Journal Entry";
    saveBtn.textContent = "Update Entry";
    formBox.classList.remove("hidden");
};

// ===============================
// SAVE OR UPDATE JOURNAL
// ===============================
saveBtn.addEventListener("click", async () => {
    let user = localStorage.getItem("loggedInUser");

    if (user) {
        user = JSON.parse(user);
    }

    const postedUserID = user ? user.id : 1;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const mood = moodInput.value;

    if (!title || !content) {
        alert("Please fill title and content!");
        return;
    }

    try {
        if (editMode) {
            await fetch(
                `http://localhost:5000/updatePost/${editPostId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        mood
                    })
                }
            );

            editMode = false;
            editPostId = null;
        } else {
            const newPost = {
                postedUserID,
                title,
                content,
                mood
            };

            await fetch(
                "http://localhost:5000/addNewPost",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newPost)
                }
            );
        }

        formBox.classList.add("hidden");

        titleInput.value = "";
        contentInput.value = "";
        moodInput.value = "😊 Grateful";

        formHeading.textContent = "📝 New Journal Entry";
        saveBtn.textContent = "Save Entry";

        loadJournals();

    } catch (error) {
        console.log("Error saving journal:", error);
    }
});

// ===============================
// DELETE JOURNAL
// ===============================
window.deleteJournal = async (id) => {
    try {
        await fetch(
            `http://localhost:5000/deletePost/${id}`,
            {
                method: "DELETE"
            }
        );

        loadJournals();

    } catch (error) {
        console.log("Error deleting journal:", error);
    }
};

// ===============================
// LOGOUT
// ===============================
logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// ===============================
// INITIAL LOAD
// ===============================
loadJournals();