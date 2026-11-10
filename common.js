// Shared behaviour for the event pages.
// Countdown: elements with data-cd="d|h|m|s". Calendar: [data-gcal] links and [data-ics] buttons.
// Each page sets its event on <body>: data-start / data-end (YYYY-MM-DD, end exclusive) and data-title.
const EVENT = {
  start: document.body.dataset.start || "2027-03-13",
  end: document.body.dataset.end || "2027-03-15",
  title: document.body.dataset.title || "Aviral & Somanjali's Wedding",
};
const WEDDING = new Date(`${EVENT.start}T00:00:00+05:30`);
const TITLE = EVENT.title;
const ymd = (d) => d.replaceAll("-", "");
const DETAILS = "Save the date! Formal invitation & details to follow.";

const pad = (n) => String(n).padStart(2, "0");

function tick() {
  const s = Math.floor(Math.max(0, WEDDING - Date.now()) / 1000);
  const parts = {
    d: Math.floor(s / 86400),
    h: pad(Math.floor((s % 86400) / 3600)),
    m: pad(Math.floor((s % 3600) / 60)),
    s: pad(s % 60),
  };
  document.querySelectorAll("[data-cd]").forEach((el) => (el.textContent = parts[el.dataset.cd]));
}
tick();
setInterval(tick, 1000);

const gcal = new URL("https://calendar.google.com/calendar/render");
gcal.searchParams.set("action", "TEMPLATE");
gcal.searchParams.set("text", TITLE);
gcal.searchParams.set("dates", `${ymd(EVENT.start)}/${ymd(EVENT.end)}`);
gcal.searchParams.set("details", DETAILS);
document.querySelectorAll("[data-gcal]").forEach((a) => {
  a.href = gcal.toString();
  a.target = "_blank";
  a.rel = "noopener";
});

document.querySelectorAll("[data-ics]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//aviral-somanjali//save-the-date//EN",
      "BEGIN:VEVENT",
      `UID:aviral-somanjali-${ymd(EVENT.start)}@save-the-date`,
      "DTSTAMP:20261102T000000Z",
      `DTSTART;VALUE=DATE:${ymd(EVENT.start)}`,
      `DTEND;VALUE=DATE:${ymd(EVENT.end)}`,
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
  })
);
