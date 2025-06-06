// window.localStorage.getItem("overrides");
// import { getStatusText, showToast } from "./ultils";
const originalXHR = window.XMLHttpRequest;
document.addEventListener("yourCustomEvent", function (e) {
  let MAP_DATA = e.detail?.filter((i) => !!i.enabled);
  console.log("new event", MAP_DATA);
  // Ghi đè XMLHttpRequest với URL và JSON nhận được

  function newXHR() {
    const realXHR = new originalXHR();

    realXHR.open = function (method, url) {
      this._url = url;
      this._method = method;
      return originalXHR.prototype.open.apply(this, arguments);
    };

    realXHR.send = function () {
      // console.log(this);
      this.onloadstart && this.onloadstart();

      const find = MAP_DATA?.find(
        (i) => this._url.includes(i.url) && this._method == i.method
      );

      // Kiểm tra URL và gửi phản hồi giả
      if (!!find && !!find.url) {
        const statusNumber = parseInt(find.status);
        const response = {
          data: find.json, // Sử dụng JSON nhận được
          status: statusNumber,
          statusText: getStatusText(statusNumber),
          headers: {},
          config: {},
          request: this
        };

        setTimeout(() => {
          Object.defineProperty(this, "readyState", { value: 4 });
          Object.defineProperty(this, "status", { value: statusNumber });
          Object.defineProperty(this, "responseText", {
            value: JSON.stringify(response.data)
          });
          Object.defineProperty(this, "response", {
            value: response
          });

          this.onreadystatechange && this.onreadystatechange();
          this.onloadend && this.onloadend();
          if (statusNumber >= 400) {
            this.onerror && this.onerror();
          }
          showToast(
            `Override ${find.method} ${find.url} with status ${statusNumber}`
          );
        }, 200);
      } else {
        return originalXHR.prototype.send.apply(this, arguments);
      }
    };

    return realXHR;
  }
  // Ghi đè XMLHttpRequest bằng hàm mới
  window.XMLHttpRequest = newXHR;
});

function getStatusText(status) {
  const statusTexts = {
    200: "OK",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    500: "Internal Server Error"
    // Thêm các mã trạng thái khác nếu cần
  };
  return statusTexts[status] || "Unknown Status";
}

const showToast = (txt) => {
  const toastContainer = document.getElementById("_extension_toast");
  const numberOfToasts = toastContainer ? toastContainer.children.length : 0;

  const toast = document.createElement("div");

  // Thiết lập các thuộc tính CSS cho toast
  toast.style.position = "fixed";
  toast.style.padding = "5px";
  toast.style.top = `${11 + numberOfToasts * 40}px`;
  toast.style.right = "21px";
  toast.style.zIndex = "999999";
  toast.style.borderRadius = "3px";
  toast.style.backgroundColor = "#ee0033";
  toast.style.color = "white";
  toast.style.transition = "opacity 0.5s ease, transform 0.5s ease"; // Thêm transition
  toast.style.opacity = "0"; // Bắt đầu với opacity 0
  toast.style.transform = "translateX(100%)"; // Bắt đầu từ bên phải

  toast.innerHTML = "&#x1F6C8; " + txt;
  toastContainer.appendChild(toast);

  // Kích hoạt hiệu ứng fade in
  setTimeout(() => {
    toast.style.opacity = "1"; // Hiện thị khi show
    toast.style.transform = "translateX(0)"; // Về vị trí ban đầu
  }, 10); // Thêm một chút delay để hiệu ứng hoạt động

  setTimeout(() => {
    // Kích hoạt hiệu ứng fade out
    toast.style.opacity = "0"; // Bắt đầu fade out
    toast.style.transform = "translateX(100%)"; // Di chuyển sang bên phải
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 500); // Thời gian chờ để fade out hoàn tất
  }, 3000);
};
