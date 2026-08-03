// utils/timeUtils.js
function timeDiff(dateTimeString) {
    if (!dateTimeString) return "Just now";
    
    const now = new Date();
    const past = new Date(dateTimeString);

    let timedDiff = Math.floor((now - past) / 1000);
    if (timedDiff < 0) return "Just now";

    const days = Math.floor(timedDiff / (60 * 60 * 24));
    timedDiff = timedDiff - days * 60 * 60 * 24;

    const hours = Math.floor(timedDiff / (60 * 60));
    timedDiff = timedDiff - hours * 60 * 60;

    const minutes = Math.floor(timedDiff / 60);
    const seconds = timedDiff - minutes * 60;

    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hours ago`;
    if (minutes > 0) return `${minutes} minutes ago`;
    return `${seconds} seconds ago`;
}