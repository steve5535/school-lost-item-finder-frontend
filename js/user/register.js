document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#temporary-item-register-form");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const body = {
            itemName: form.querySelector('[name="itemName"]')?.value.trim(),
            itemDetail: form.querySelector('[name="itemDetail"]')?.value.trim(),
            itemPlace: form.querySelector('[name="itemPlace"]')?.value.trim(),
            itemImg: form.querySelector('[name="itemImg"]')?.value.trim() || null,
            isAccept: null
        };

        if (!body.itemName || !body.itemDetail || !body.itemPlace) {
            alert("물건 이름, 상세 정보, 발견 장소를 입력하세요.");
            return;
        }

        try {
            await apiFetch("/temporary-item", {
                method: "POST",
                body: JSON.stringify(body)
            });
            alert("분실물이 등록되었습니다.");
            location.href = "/index.html";
        } catch (error) {
            showError(error);
        }
    });
});
