# Google Sheets Setup

Use this to store RSVP submissions in your Google Sheet.

## 1. Create the sheet

1. Open Google Sheets and create a spreadsheet.
2. Name the first tab `RSVP Responses`.

## 2. Add the Apps Script

1. In that sheet, click `Extensions` -> `Apps Script`.
2. Replace the default code with the contents of [google-apps-script/Code.gs](C:/Users/ngupta/Documents/ngSecondRepoRSVP/google-apps-script/Code.gs).
3. Save the project.

## 3. Deploy it as a web app

1. Click `Deploy` -> `New deployment`.
2. Choose type `Web app`.
3. Set `Execute as` to `Me`.
4. Set access to `Anyone`.
5. Deploy and copy the web app URL.

## 4. Paste the URL into the site

Open [script.js](C:/Users/ngupta/Documents/ngSecondRepoRSVP/script.js) and set:

```js
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
#https://meghamittal26.github.io/ngSecondRepoRSVP/
```

## 5. Test

1. Open [index.html](C:/Users/ngupta/Documents/ngSecondRepoRSVP/index.html).
2. Submit an RSVP.
3. Confirm the response appears:
   in the browser list below the form
   in your Google Sheet

## Notes

- The site still saves to browser local storage so you can see submitted responses immediately.
- If Google Sheets sync fails, the browser copy is still kept.
- If you redeploy Apps Script and get a new URL, update `GOOGLE_SCRIPT_URL` again.
