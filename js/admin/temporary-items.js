document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const list = document.querySelector("#temporary-item-list");

    try {
        const items = await apiFetch("/temporary-item");

        if (!list) return;
        list.innerHTML = "";

        items.forEach(item => {
            const status = item.isAccept === null ? "대기 중" : item.isAccept ? "수락" : "거절";
            const card = document.createElement("article");
            card.className = "temporary-item-card";
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
            list.appendChild(card);
        });

        if (!items.length) list.innerHTML = "<p>임시 저장소가 비어 있습니다.</p>";
    } catch (error) {
        showError(error);
    }
});

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
