const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxl5FuAfN0qJqGUw5QG9GmWOkPl-_2WarHQ0c9hWBtITuNOaEGTTuV39LcehiuLncqB/exec";

const form = document.getElementById("rsvp-form");
const submitButton = document.getElementById("submit-button");
const successMessage = document.getElementById("success-message");
const syncNote = document.getElementById("sync-note");
const captchaQuestion = document.getElementById("captcha-question");
const captchaAnswer = document.getElementById("captchaAnswer");

let currentCaptchaAnswer = "";

if (GOOGLE_SCRIPT_URL) {
  syncNote.textContent = "Google Sheets sync is on. Each RSVP will be sent to your sheet.";
}

function generateCaptcha() {
  const firstNumber = Math.floor(Math.random() * 8) + 2;
  const secondNumber = Math.floor(Math.random() * 8) + 2;
  currentCaptchaAnswer = String(firstNumber + secondNumber);
  captchaQuestion.textContent = `What is ${firstNumber} + ${secondNumber}?`;
}

async function sendToGoogleSheets(response) {
  if (!GOOGLE_SCRIPT_URL) {
    return { synced: false };
  }

  const payload = new URLSearchParams({
    fullName: response.fullName,
    email: response.email,
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
  successMessage.textContent = "";

  const submittedCaptcha = captchaAnswer.value.trim();
  if (submittedCaptcha !== currentCaptchaAnswer) {
    successMessage.textContent = "Please answer the human check correctly before submitting.";
    generateCaptcha();
    captchaAnswer.value = "";
    captchaAnswer.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  const formData = new FormData(form);
  const newResponse = {
    fullName: formData.get("fullName")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    address: formData.get("address")?.toString().trim() ?? "",
    attendance: formData.get("attendance")?.toString() ?? "",
  };

  try {
    const result = await sendToGoogleSheets(newResponse);
    successMessage.textContent = result.synced
      ? `Thanks ${newResponse.fullName}! Your RSVP response was "${newResponse.attendance}".`
      : `Thanks ${newResponse.fullName}! Your RSVP response was "${newResponse.attendance}".`;
    form.reset();
    generateCaptcha();
  } catch (error) {
    console.error(error);
    successMessage.textContent = "Your RSVP could not be submitted right now. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});

generateCaptcha();
