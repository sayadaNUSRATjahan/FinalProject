// ==========================================
// 1. Total Entries (মোট কতটি জার্নাল এন্ট্রি আছে)
// ==========================================
export function calculateTotalEntries(journals) {
    if (!journals) return 0;
    return journals.length;
}

// ==========================================
// 2. Day Streak (ধারাবাহিক কত দিন লেখা হয়েছে)
// ==========================================
export function calculateDayStreak(journals) {
    if (!journals || journals.length === 0) return 0;

    // জার্নালের ডেটগুলো থেকে শুধুমাত্র তারিখের অংশটুকু আলাদা করে নেওয়া (YYYY-MM-DD ফরম্যাটে রূপান্তর)
    const uniqueDates = [...new Set(journals.map(j => {
        const postDate = j.time || j.createdAt;
        return postDate ? new Date(postDate).toDateString() : null;
    }))].filter(Boolean);

    // তারিখগুলোকে নতুন থেকে পুরোনো ক্রমানুসারে সাজানো
    uniqueDates.sort((a, b) => new Date(b) - new Date(a));

    let streak = 0;
    let today = new Date().toDateString();
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let yesterdayString = yesterday.toDateString();

    // যদি আজ বা গতকাল কোনো এন্ট্রি না থাকে, তবে স্ট্রীক ০ হয়ে যাবে
    if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterdayString)) {
        return 0;
    }

    // ধারাবাহিক দিনগুলো গণনা করা
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

// ==========================================
// 3. Most Mood (সবচেয়ে বেশি কোন মুডটি ব্যবহার করা হয়েছে)
// ==========================================
export function calculateMostMood(journals) {
    if (!journals || journals.length === 0) return "No Mood";

    const moodCounts = {};
    journals.forEach(j => {
        if (j.mood) {
            moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
        }
    });

    let mostCommonMood = "😊 Happy"; // ডিফল্ট ভ্যালু
    let maxCount = 0;

    for (const mood in moodCounts) {
        if (moodCounts[mood] > maxCount) {
            maxCount = moodCounts[mood];
            mostCommonMood = mood;
        }
    }

    return mostCommonMood;
}