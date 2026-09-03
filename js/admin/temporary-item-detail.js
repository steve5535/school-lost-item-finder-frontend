document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return showError(new Error("임시 물건 번호가 없습니다."));

    try {
        const item = await apiFetch(`/temporary-item/${id}`);

        setText("#item-name", item.itemName);
        setText("#item-detail-text", item.itemDetail);
        setText("#item-place", item.itemPlace);
        setText("#item-sign-up-at", formatDate(item.signUp));
        setImage("#item-image", item.itemImg, item.itemName);

        const status = item.isAccept === null ? "대기 중" : item.isAccept ? "수락" : "거절";
        setText("#item-status", status);

        if (item.isAccept === false) {
            document.querySelector("#accept-button")?.remove();
            document.querySelector("#decline-button")?.remove();
        }

        document.querySelector("#accept-button")?.addEventListener("click", () => changeStatus(id, "accept"));
        document.querySelector("#decline-button")?.addEventListener("click", () => changeStatus(id, "decline"));

        document.querySelector("#delete-button")?.addEventListener("click", async () => {
            if (!confirm("임시 저장소에서 삭제하시겠습니까?")) return;

            try {
                await apiFetch(`/temporary-item/${id}`, { method: "DELETE" });
                location.href = "/admin/index.html";
            } catch (error) { showError(error); }
        });
    } catch (error) {
        showError(error);
    }
});

async function changeStatus(id, action) {
    try {
        await apiFetch(`/temporary-item/${action}/${id}`, { method: "PATCH" });
        alert(action === "accept" ? "수락되었습니다." : "거절되었습니다.");

        location.href = "/admin/index.html";

    } catch (error) {
        showError(error);
    }
}
