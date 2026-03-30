const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzmoinmQF1QUivCAuWZGF3BB2RYZZGe-5diKFzxd0je8pUijmYCP474o8U7QONQHww6/exec";

const form = document.getElementById("rsvp-form");
const submitButton = document.getElementById("submit-button");
const successMessage = document.getElementById("success-message");
const attendanceSelect = document.getElementById("attendance");
const captchaQuestion = document.getElementById("captcha-question");
const captchaAnswer = document.getElementById("captchaAnswer");
const yesDetails = document.getElementById("yes-details");
const comments = document.getElementById("comments");
const commentsCount = document.getElementById("comments-count");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const zipInput = document.getElementById("zip");

let currentCaptchaAnswer = "";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
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
    city: response.city,
    state: response.state,
    zip: response.zip,
    phone: response.phone,
    attendance: response.attendance,
    comments: response.comments,
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

function updateConditionalFields() {
  const isAttending = attendanceSelect.value === "Yes";

  addressInput.required = isAttending;
  cityInput.required = isAttending;
  stateInput.required = isAttending;
  zipInput.required = isAttending;

  if (isAttending) {
    yesDetails.hidden = false;
    requestAnimationFrame(() => {
      yesDetails.classList.add("is-open");
    });
    return;
  }

  yesDetails.classList.remove("is-open");

  addressInput.value = "";
  cityInput.value = "";
  stateInput.value = "";
  zipInput.value = "";
  comments.value = "";
  commentsCount.textContent = "0 / 200";

  window.setTimeout(() => {
    if (!yesDetails.classList.contains("is-open")) {
      yesDetails.hidden = true;
    }
  }, 260);
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
    city: formData.get("city")?.toString().trim() ?? "",
    state: formData.get("state")?.toString().trim() ?? "",
    zip: formData.get("zip")?.toString().trim() ?? "",
    phone: formData.get("phone")?.toString().trim() ?? "",
    attendance: formData.get("attendance")?.toString() ?? "",
    comments: formData.get("comments")?.toString().trim() ?? "",
  };

  if (newResponse.email && !isValidEmail(newResponse.email)) {
    successMessage.textContent = "Please enter a valid email address or leave it blank.";
    form.querySelector("#email")?.focus();
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
    return;
  }

  if (!/^\d{10,15}$/.test(newResponse.phone)) {
    successMessage.textContent = "Please enter a valid phone number using numbers only.";
    phoneInput.focus();
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
    return;
  }

  if (newResponse.attendance === "Yes" && (!newResponse.address || !newResponse.city || !newResponse.state || !newResponse.zip)) {
    successMessage.textContent = "Please complete the address details before submitting.";
    addressInput.focus();
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
    return;
  }

  try {
    const result = await sendToGoogleSheets(newResponse);
    successMessage.textContent = result.synced
      ? `Thanks ${newResponse.fullName}! Your RSVP response was "${newResponse.attendance}".`
      : `Thanks ${newResponse.fullName}! Your RSVP response was "${newResponse.attendance}".`;
    form.reset();
    commentsCount.textContent = "0 / 200";
    updateConditionalFields();
    generateCaptcha();
  } catch (error) {
    console.error(error);
    successMessage.textContent = "Your RSVP could not be submitted right now. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit";
  }
});

comments.addEventListener("input", () => {
  commentsCount.textContent = `${comments.value.length} / 200`;
});

phoneInput.addEventListener("input", () => {
  phoneInput.value = phoneInput.value.replace(/\D/g, "");
});

zipInput.addEventListener("input", () => {
  zipInput.value = zipInput.value.replace(/\D/g, "");
});

attendanceSelect.addEventListener("change", updateConditionalFields);

generateCaptcha();
updateConditionalFields();
