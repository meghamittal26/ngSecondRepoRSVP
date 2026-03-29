const STORAGE_KEY = "vg-birthday-rsvp-responses";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxl5FuAfN0qJqGUw5QG9GmWOkPl-_2WarHQ0c9hWBtITuNOaEGTTuV39LcehiuLncqB/exec";

const form = document.getElementById("rsvp-form");
const successMessage = document.getElementById("success-message");
const responsesList = document.getElementById("responses-list");
const clearResponsesButton = document.getElementById("clear-responses");
const syncNote = document.getElementById("sync-note");

if (GOOGLE_SCRIPT_URL) {
  syncNote.textContent = "Google Sheets sync is on. Each RSVP will save locally and be sent to your sheet.";
}

function getResponses() {
  const savedResponses = localStorage.getItem(STORAGE_KEY);

  if (!savedResponses) {
    return [];
  }

  try {
    const parsedResponses = JSON.parse(savedResponses);
    return Array.isArray(parsedResponses) ? parsedResponses : [];
  } catch (error) {
    console.error("Unable to parse stored RSVP responses.", error);
    return [];
  }
}

function saveResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

async function sendToGoogleSheets(response) {
  if (!GOOGLE_SCRIPT_URL) {
    return { synced: false };
  }

  const payload = new URLSearchParams({
    fullName: response.fullName,
    address: response.address,
    attendance: response.attendance,
  });

  const request = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: payload,
  });

  if (!request.ok) {
    throw new Error(`Google Sheets sync failed with status ${request.status}.`);
  }

  return { synced: true };
}

function renderResponses() {
  const responses = getResponses();

  if (responses.length === 0) {
    responsesList.innerHTML = `
      <div class="empty-state">
        <p>No RSVP submissions yet. Submit the form above to see responses here.</p>
      </div>
    `;
    return;
  }

  responsesList.innerHTML = responses
    .map((response) => {
      return `
        <article class="response-item">
          <h3>${escapeHtml(response.fullName)}</h3>
          <p class="response-meta"><strong>Address:</strong> ${escapeHtml(response.address)}</p>
          <p class="response-meta">
            <span class="response-attendance">${escapeHtml(response.attendance)}</span>
          </p>
        </article>
      `;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const newResponse = {
    fullName: formData.get("fullName")?.toString().trim() ?? "",
    address: formData.get("address")?.toString().trim() ?? "",
    attendance: formData.get("attendance")?.toString() ?? "",
  };

  const responses = getResponses();
  responses.unshift(newResponse);
  saveResponses(responses);

  try {
    const result = await sendToGoogleSheets(newResponse);
    successMessage.textContent = result.synced
      ? "Thanks! Your RSVP was saved in this browser and sent to Google Sheets."
      : "Thanks! Your RSVP has been saved in this browser.";
  } catch (error) {
    console.error(error);
    successMessage.textContent = "Saved in this browser, but Google Sheets sync did not go through yet.";
  } finally {
    form.reset();
    renderResponses();
  }
});

clearResponsesButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  successMessage.textContent = "";
  renderResponses();
});

renderResponses();
