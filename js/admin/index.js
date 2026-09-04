document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const itemList = document.querySelector("#admin-item-list");
    const temporaryList = document.querySelector("#temporary-item-list");
    const declinedList = document.querySelector("#declined-item-list");
    const takenList = document.querySelector("#taken-item-list");
    const searchForm = document.querySelector("#admin-search-form");
    const searchInput = searchForm?.querySelector("input");

    async function loadItems(keyword = "") {
        try {
            const items = await apiFetch("/items");
            const filtered = (Array.isArray(items) ? items : []).filter(item => {
                if (item.takeAt !== null && item.takeAt !== undefined) return false;
                if (!keyword.trim()) return true;
                const q = keyword.trim().toLowerCase();
                return [item.itemName, item.itemDetail, item.itemPlace]
                    .some(v => String(v ?? "").toLowerCase().includes(q));
            });

            const takenItems = (Array.isArray(items) ? items : []).filter(item => {
                if (item.takeAt === null || item.takeAt === undefined) return false;
                if (!keyword.trim()) return true;
                const q = keyword.trim().toLowerCase();
                return [item.itemName, item.itemDetail, item.itemPlace]
                    .some(v => String(v ?? "").toLowerCase().includes(q));
            });

            renderItems(itemList, filtered, "/admin/item-detail.html");

            renderItems(takenList, takenItems, "/admin/item-detail.html");
        } catch (error) {
            showError(error);
        }
    }

    async function loadTemporaryItems() {
        if (!temporaryList) return;

        try {
            const response = await apiFetch("/temporary-item");
            const items = Array.isArray(response) ? response : [];

            const temporaryItems = items.filter(item => item.isAccept === null);
            const declinedItems = items.filter(item => item.isAccept === false);

            renderTemporaryItems(temporaryItems);
            renderDeclinedItems(declinedItems);

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
                    <p>특징: ${escapeHtml(item.itemDetail)}</p>
                    <p>장소: ${escapeHtml(item.itemPlace)}</p>
                    <p>등록된 시간: ${formatDate(item.signUpAt)}</p>
                    ${item.takeAt ? `
                        <p>수령 시간: ${formatDate(item.takeAt)}</p>
                        <p>수령 학생: ${item.student
                        ? `${item.student.studentNumber} ${item.student.studentName}`
                        : "-"
                    }</p>
                    ` : ""}
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
                    <h3>${escapeHtml(item.itemName)}</h3>
                    <p>특징: ${escapeHtml(item.itemDetail)}</p>
                    <p>장소: ${escapeHtml(item.itemPlace)}</p>
                    <p>등록된 시간: ${formatDate(item.signUp)}</p>
                    <p>상태: ${status}</p>
                </a>
            `;
            temporaryList.appendChild(card);
        });
        if (!items.length) temporaryList.innerHTML = "<p>임시 저장소가 비어 있습니다.</p>";
    }

    function renderDeclinedItems(items) {
        if (!declinedList) return;

        declinedList.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "temporary-item-card";

            card.innerHTML = `
            <a href="/admin/temporary-item-detail.html?id=${item.itemId}">
                <div class="item-image">
                    ${item.itemImg
                    ? `<img src="${escapeHtml(item.itemImg)}" alt="${escapeHtml(item.itemName)}">`
                    : "이미지 없음"
                }
                </div>

                <h3>${escapeHtml(item.itemName)}</h3>
                <p>특징: ${escapeHtml(item.itemDetail)}</p>
                <p>장소: ${escapeHtml(item.itemPlace)}</p>
                <p>등록된 시간: ${formatDate(item.signUp)}</p>
                <p>상태: 거절</p>
            </a>
        `;
            declinedList.appendChild(card);
        });

        if (!items.length) {
            declinedList.innerHTML = "<p>거절된 분실물이 없습니다.</p>";
        }
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
