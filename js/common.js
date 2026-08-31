const API_BASE_URL = "http://localhost:8080";

async function apiFetch(path, options = {}) {
    const config = {
        credentials: "include",
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    };

    const response = await fetch(`${API_BASE_URL}${path}`, config);

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message =
            (data && typeof data === "object" && (data.message || data.error)) ||
            (typeof data === "string" && data) ||
            `요청에 실패했습니다. (${response.status})`;

        throw new Error(message);
    }

    return data;
}

function getPathId() {
    const parts = location.pathname.split("/").filter(Boolean);
    const last = parts.at(-1);
    const value = Number(last);
    return Number.isInteger(value) && value > 0 ? value : null;
}

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("ko-KR");
}

function showError(error, selector = "#error-message") {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = error?.message || "오류가 발생했습니다.";
        element.hidden = false;
    } else {
        alert(error?.message || "오류가 발생했습니다.");
    }
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value ?? "-";
}

function setImage(selector, src, alt = "") {
    const image = document.querySelector(selector);
    if (!image) return;

    if (src) {
        image.src = src;
        image.alt = alt;
        image.hidden = false;
    } else {
        image.hidden = true;
    }
}

function redirectAfterLogin() {
    localStorage.setItem("adminLoggedIn", "true");
    location.href = "/admin/index.html";
}

function requireAdmin() {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
        location.replace("/admin/login.html");
        return false;
    }
    return true;
}

function logoutAdmin() {
    localStorage.removeItem("adminLoggedIn");
    location.href = "/admin/login.html";
}
