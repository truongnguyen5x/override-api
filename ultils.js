export function getStatusText(status) {
  const statusTexts = {
    200: "OK",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error",
    // Thêm các mã trạng thái khác nếu cần
  };
  return statusTexts[status] || "Unknown Status";
}

export const showToast = (txt) => {
  const toastContainer = document.getElementById("_extension_toast");

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.style.position = "fixed";
  toast.style.padding = "5px";
  toast.style.top = "11px";
  toast.style.right = "21px";
  toast.style.zIndex = "999999";
  toast.style.borderRadius = "3px";
  toast.style.backgroundColor = "#3b8cd0";

  toast.innerHTML = "&#x1F6C8; " + txt;
  toastContainer.appendChild(toast);
};
