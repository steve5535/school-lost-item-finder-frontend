document.addEventListener("DOMContentLoaded", async () => {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
        showError(new Error("분실물 번호가 없습니다."));
        return;
    }

    try {
        const item = await apiFetch(`/items/${id}`);

        setText("#item-name", item.itemName);
        setText("#item-detail-text", item.itemDetail);
        setText("#item-place", item.itemPlace);
        setText("#item-sign-up-at", formatDate(item.signUpAt));
        setText("#item-take-at", formatDate(item.takeAt));
        setImage("#item-image", item.itemImg, item.itemName);

        const button = document.querySelector("#take-item-button");
        button?.addEventListener("click", () => openTakeModal(id));
    } catch (error) {
        showError(error);
    }
});

function openTakeModal(itemId) {
    const form = document.querySelector("#take-item-form");
    if (!form) {
        const studentNumber = prompt("학번을 입력하세요.");
        const studentName = prompt("이름을 입력하세요.");
        if (studentNumber && studentName) takeItem(itemId, studentNumber, studentName);
        return;
    }

    const modal = form.closest("dialog");
    modal?.showModal();

    const cancelButton = form.querySelector('button[value="cancel"]');

    cancelButton?.addEventListener("click", () => {
        modal?.close();
    });

    form.onsubmit = async event => {
        event.preventDefault();
        const studentNumber = Number(form.querySelector('[name="studentNumber"]')?.value);
        const studentName = form.querySelector('[name="studentName"]')?.value.trim();

        if (!studentNumber || !studentName) {
            alert("학번과 이름을 입력하세요.");
            return;
        }

        await takeItem(itemId, studentNumber, studentName);
        modal?.close();
    };
}

async function takeItem(itemId, studentNumber, studentName) {
    try {
        await apiFetch(`/items/take/${itemId}`, {
            method: "PATCH",
            body: JSON.stringify({ studentNumber, studentName })
        });
        alert("가져가기가 완료되었습니다.");
        location.reload();
    } catch (error) {
        showError(error);
    }
}
