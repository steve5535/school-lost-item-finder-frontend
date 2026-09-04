document.addEventListener("DOMContentLoaded", async () => {
    const list = document.querySelector("#item-list");
    const searchForm = document.querySelector("#search-form");
    const searchInput = searchForm?.querySelector("input");

    async function loadItems(keyword = "") {
        try {
            const items = await apiFetch("/items");
            const filtered = Array.isArray(items)
                ? items.filter(item => {
                    if (item.takeAt !== null) return false;
                    if (!keyword.trim()) return true;
                    const q = keyword.trim().toLowerCase();
                    return [item.itemName, item.itemDetail, item.itemPlace]
                        .some(v => String(v ?? "").toLowerCase().includes(q));
                })
                : [];
            renderItems(filtered);
        } catch (error) {
            showError(error);
        }
    }

    function renderItems(items) {
        if (!list) return;
        list.innerHTML = "";

        if (!items.length) {
            list.innerHTML = "<p>등록된 분실물이 없습니다.</p>";
            return;
        }

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "item-card";
            card.innerHTML = `
                <a href="/items/item-detail.html?id=${item.itemId}">
                    <div class="item-image">
                        ${item.itemImg ? `<img src="${escapeHtml(item.itemImg)}" alt="${escapeHtml(item.itemName)}">` : "이미지 없음"}
                    </div>
                    <h3>${escapeHtml(item.itemName)}</h3>
                    <p>특징: ${escapeHtml(item.itemDetail)}</p>
                    <p>장소: ${escapeHtml(item.itemPlace)}</p>
                    <p>등록된 시간: ${formatDate(item.signUpAt)}</p>
                </a>
            `;
            list.appendChild(card);
        });
    }

    searchForm?.addEventListener("submit", event => {
        event.preventDefault();
        loadItems(searchInput?.value || "");
    });

    await loadItems();
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
