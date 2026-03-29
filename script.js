const STORAGE_KEY = "vg-birthday-rsvp-responses";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxl5FuAfN0qJqGUw5QG9GmWOkPl-_2WarHQ0c9hWBtITuNOaEGTTuV39LcehiuLncqB/exec";

const form = document.getElementById("rsvp-form");
const submitButton = document.getElementById("submit-button");
const successMessage = document.getElementById("success-message");
const syncNote = document.getElementById("sync-note");
const confirmationCard = document.getElementById("confirmation-card");
const confirmationDetails = document.getElementById("confirmation-details");

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

function renderConfirmation(response) {
  confirmationDetails.innerHTML = `
    <div class="confirmation-row">
      <span class="confirmation-label">Full Name</span>
      <span class="confirmation-value">${escapeHtml(response.fullName)}</span>
    </div>
    <div class="confirmation-row">
      <span class="confirmation-label">Address</span>
      <span class="confirmation-value">${escapeHtml(response.address)}</span>
    </div>
    <div class="confirmation-row">
      <span class="confirmation-label">RSVP Response</span>
      <span class="confirmation-value confirmation-badge">${escapeHtml(response.attendance)}</span>
    </div>
  `;

  confirmationCard.hidden = false;
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
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  successMessage.textContent = "";

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
      ? "Thanks! Your RSVP was received successfully."
      : "Thanks! Your RSVP has been saved successfully.";
    renderConfirmation(newResponse);
    form.reset();
  } catch (error) {
    console.error(error);
    successMessage.textContent = "Your RSVP was saved, but Google Sheets sync did not go through yet.";
    renderConfirmation(newResponse);
    form.reset();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});

const savedResponses = getResponses();
if (savedResponses.length > 0) {
  renderConfirmation(savedResponses[0]);
}
