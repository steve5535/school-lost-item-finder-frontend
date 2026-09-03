document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const id = new URLSearchParams(location.search).get("id");
    if (!id) return showError(new Error("분실물 번호가 없습니다."));

    try {
        const item = await apiFetch(`/items/${id}`);

        setText("#item-name", item.itemName);
        setText("#item-detail-text", item.itemDetail);
        setText("#item-place", item.itemPlace);
        setText("#item-sign-up-at", formatDate(item.signUpAt));
        setText("#item-take-at", formatDate(item.takeAt));
        setImage("#item-image", item.itemImg, item.itemName);

        document.querySelector("#delete-item-button")?.addEventListener("click", async () => {
            if (!confirm("이 분실물을 삭제하시겠습니까?")) return;
            try {
                await apiFetch(`/items/${id}`, { method: "DELETE" });
                location.href = "/admin/index.html";
            } catch (error) { showError(error); }
        });

        const editButton = document.querySelector("#edit-item-button");
        const editSection = document.querySelector("#edit-item-section");

        editButton?.addEventListener("click", () => {
            editSection.hidden = false;

            document.querySelector("#edit-item-name").value = item.itemName ?? "";
            document.querySelector("#edit-item-detail").value = item.itemDetail ?? "";
            document.querySelector("#edit-item-place").value = item.itemPlace ?? "";
            document.querySelector("#edit-item-img").value = item.itemImg ?? "";
        });

        document.querySelector("#edit-item-form")?.addEventListener("submit", async event => {
            event.preventDefault();
            const form = event.currentTarget;
            const body = {
                itemName: form.querySelector('[name="itemName"]')?.value.trim(),
                itemDetail: form.querySelector('[name="itemDetail"]')?.value.trim(),
                itemPlace: form.querySelector('[name="itemPlace"]')?.value.trim(),
                itemImg: form.querySelector('[name="itemImg"]')?.value.trim() || null
            };

            try {
                await apiFetch(`/items/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body)
                });
                alert("수정되었습니다.");
                location.reload();
            } catch (error) { showError(error); }
        });
    } catch (error) {
        showError(error);
    }
});
