document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#temporary-item-register-form");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const file = form.querySelector('[name="itemImg"]')?.files[0];

        const request = {
            itemName: form.querySelector('[name="itemName"]')?.value.trim(),
            itemDetail: form.querySelector('[name="itemDetail"]')?.value.trim(),
            itemPlace: form.querySelector('[name="itemPlace"]')?.value.trim(),
            isAccept: null
        };

        if (!request.itemName || !request.itemDetail || !request.itemPlace) {
            alert("물건 이름, 상세 정보, 발견 장소를 입력하세요.");
            return;
        }

        const formData = new FormData();

        formData.append(
            "request",
            new Blob(
                [JSON.stringify(request)],
                {
                    type: "application/json"
                }
            )
        );

        if (file) {
            formData.append("file", file);
        }

        try {
            await apiFetch("/temporary-item", {
                method: "POST",
                body: formData
            });

            alert("분실물이 등록되었습니다.");
            location.href = "/index.html";
        } catch (error) {
            showError(error);
        }
    });
});