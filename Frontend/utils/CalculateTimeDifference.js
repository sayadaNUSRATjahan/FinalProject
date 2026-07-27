// সময় হিসেব করার ইউটিলিটি ফাংশন
function timeDiff(dateTimeString) {
    const now = new Date();
    const past = new Date(dateTimeString);

    let timedDiff = Math.floor((now - past) / 1000);
    
    // যদি ভবিষ্যৎ বা ভুল টাইম হয়
    if (timedDiff < 0) return "Just now";

    const days = Math.floor(timedDiff / (60 * 60 * 24));
    timedDiff = timedDiff - days * 60 * 60 * 24;

    const hours = Math.floor(timedDiff / (60 * 60));
    timedDiff = timedDiff - hours * 60 * 60;

    const minutes = Math.floor(timedDiff / 60);
    const seconds = timedDiff - minutes * 60;

    let result = "";

    if (days > 0) {
        result = result + `${days} days ago`;
    } else if (hours > 0) {
        result = result + `${hours} hours ago`;
    } else if (minutes > 0) {
        result = result + `${minutes} minutes ago`;
    } else {
        result = result + `${seconds} seconds ago`;
    }

    return result;
}