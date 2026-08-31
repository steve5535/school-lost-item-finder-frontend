document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const itemList = document.querySelector("#admin-item-list");
    const temporaryList = document.querySelector("#temporary-item-list");
    const searchForm = document.querySelector("#admin-search-form");
    const searchInput = searchForm?.querySelector("input");

    async function loadItems(keyword = "") {
        try {
            const items = await apiFetch("/items");
            const filtered = (Array.isArray(items) ? items : []).filter(item => {
                if (!keyword.trim()) return true;
                const q = keyword.trim().toLowerCase();
                return [item.itemName, item.itemDetail, item.itemPlace]
                    .some(v => String(v ?? "").toLowerCase().includes(q));
            });
            renderItems(itemList, filtered, "/admin/item-detail.html");
        } catch (error) {
            showError(error);
        }
    }

    async function loadTemporaryItems() {
        if (!temporaryList) return;

        try {
            const items = await apiFetch("/temporary-item");
            renderTemporaryItems(Array.isArray(items) ? items : []);
        } catch (error) {
            showError(error);
        }
    }

    function renderItems(target, items, basePath) {
        if (!target) return;
        target.innerHTML = "";
        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "item-card";
            card.innerHTML = `
                <a href="${basePath}?id=${item.itemId}">
                    <div class="item-image">
                        ${item.itemImg ? `<img src="${escapeHtml(item.itemImg)}" alt="${escapeHtml(item.itemName)}">` : "이미지 없음"}
                    </div>
                    <h3>${escapeHtml(item.itemName)}</h3>
                    <p>${escapeHtml(item.itemPlace)}</p>
                </a>
            `;
            target.appendChild(card);
        });
        if (!items.length) target.innerHTML = "<p>등록된 물건이 없습니다.</p>";
    }

    function renderTemporaryItems(items) {
        temporaryList.innerHTML = "";
        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "temporary-item-card";
            const status = item.isAccept === null ? "대기 중" : item.isAccept ? "수락" : "거절";
            card.innerHTML = `
                <a href="/admin/temporary-item-detail.html?id=${item.itemId}">
                    <div class="item-image">
                        ${item.itemImg ? `<img src="${escapeHtml(item.itemImg)}" alt="${escapeHtml(item.itemName)}">` : "이미지 없음"}
                    </div>
                    <h2>${escapeHtml(item.itemName)}</h2>
                    <p>${escapeHtml(item.itemPlace)}</p>
                    <p>상태: ${status}</p>
                </a>
            `;
            temporaryList.appendChild(card);
        });
        if (!items.length) temporaryList.innerHTML = "<p>임시 저장소가 비어 있습니다.</p>";
    }

    searchForm?.addEventListener("submit", event => {
        event.preventDefault();
        loadItems(searchInput?.value || "");
    });

    document.querySelector("#logout-button")?.addEventListener("click", logoutAdmin);

    await Promise.all([loadItems(), loadTemporaryItems()]);
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
