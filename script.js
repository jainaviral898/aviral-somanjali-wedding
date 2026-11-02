// Wedding starts 13 March 2027, Indian Standard Time
const WEDDING = new Date("2027-03-13T00:00:00+05:30");
const TITLE = "Aviral & Somanjali's Wedding";
const DETAILS = "Save the date! Formal invitation & details to follow.";

const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const diff = Math.max(0, WEDDING - Date.now());
  const s = Math.floor(diff / 1000);
  document.getElementById("cd-d").textContent = Math.floor(s / 86400);
  document.getElementById("cd-h").textContent = pad(Math.floor((s % 86400) / 3600));
  document.getElementById("cd-m").textContent = pad(Math.floor((s % 3600) / 60));
  document.getElementById("cd-s").textContent = pad(s % 60);
}
tick();
setInterval(tick, 1000);

// Calendar: all-day event spanning 13–14 March (end date is exclusive)
const gcal = new URL("https://calendar.google.com/calendar/render");
gcal.searchParams.set("action", "TEMPLATE");
gcal.searchParams.set("text", TITLE);
gcal.searchParams.set("dates", "20270313/20270315");
gcal.searchParams.set("details", DETAILS);
document.getElementById("gcal").href = gcal.toString();

document.getElementById("ics").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//aviral-somanjali//save-the-date//EN",
    "BEGIN:VEVENT",
    "UID:aviral-somanjali-wedding-2027@save-the-date",
    "DTSTAMP:20261102T000000Z",
    "DTSTART;VALUE=DATE:20270313",
    "DTEND;VALUE=DATE:20270315",
    `SUMMARY:${TITLE}`,
    `DESCRIPTION:${DETAILS}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "aviral-somanjali-wedding.ics" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Marigold petals
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const colors = ["#e8902a", "#f2b134", "#d9472b", "#f6c75a"];
  const box = document.querySelector(".petals");
  const count = window.innerWidth < 600 ? 14 : 26;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 9 + Math.random() * 10 + "s";
    p.style.animationDelay = -Math.random() * 18 + "s";
    p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    p.style.transform = `scale(${0.6 + Math.random() * 0.8})`;
    box.appendChild(p);
  }
}
