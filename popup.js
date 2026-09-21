const btn = document.getElementById("fillBtn");
const status = document.getElementById("status");

btn.addEventListener("click", async () => {
  btn.disabled = true;
  status.textContent = "Filling...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      status.textContent = "No active tab found";
      btn.disabled = false;
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"]
    });

    // Sum the filled-in fields across all frames on the page
    const total = results.reduce((sum, r) => sum + (typeof r.result === "number" ? r.result : 0), 0);

    if (total > 0) {
      status.textContent = `${total} fields filled in`;
    } else {
      status.textContent = "No compatible fields found on this page";
    }
  } catch (err) {
    status.textContent = "Unable to perform actions on this page";
  } finally {
    btn.disabled = false;
  }
});
