console.log("content js");

chrome.storage.local.get("overrides", function (v) {
  document.dispatchEvent(
    new CustomEvent("yourCustomEvent", { detail: v.overrides })
  );
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName === "local" && changes.overrides) {
    console.log("storage on change", changes);
    document.dispatchEvent(
      new CustomEvent("yourCustomEvent", { detail: changes.overrides.newValue })
    );
  }
});

const toastContainer = document.createElement("div");
toastContainer.id = "_extension_toast";

document.body.appendChild(toastContainer);
