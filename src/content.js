(() => {
    const KRRS = window.KRRS ??= {};

    const BUTTON_ID =
        "keenetic-routing-rule-switch-button";


    function syncButton() {
        const deleteSelectedButton =
            document.querySelector(
                'ndw-button[label="staticRoutes.buttons.delete-selected"]'
            );

        const existingButton =
            document.getElementById(
                BUTTON_ID
            );


        if (!deleteSelectedButton) {
            existingButton?.remove();
            return;
        }


        if (existingButton) {
            return;
        }


        const editButton =
            deleteSelectedButton
                .cloneNode(true);


        editButton.id =
            BUTTON_ID;


        editButton.removeAttribute(
            "label"
        );


        /*
         * Меняем иконку delete
         * на нативную Keenetic pencil.
         */
        editButton.setAttribute(
            "icon",
            "pencil"
        );


        const oldIcon =
            editButton.querySelector(
                "ndw-svg-icon"
            );

        oldIcon?.remove();


        const pencilIcon =
            document
                .querySelector(
                    'ndw-button[icon="pencil"] ndw-svg-icon'
                )
                ?.cloneNode(true);


        const button =
            editButton.querySelector(
                "button"
            );


        if (
            pencilIcon &&
            button
        ) {
            button.prepend(
                pencilIcon
            );
        }


        const label =
            editButton.querySelector(
                ".ndw-button__label"
            );


        if (label) {
            label.textContent =
                "Изменить выделенные";
        }


        button?.addEventListener(
            "click",
            onClick
        );


        deleteSelectedButton.after(
            editButton
        );
    }


    async function onClick() {
        try {
            const interfaces =
                await KRRS.rci
                    .loadInterfaces();


            KRRS.dialog
                .openBulkEditDialog(
                    interfaces
                );

        } catch (error) {
            console.error(
                "[KRRS] Failed to open dialog:",
                error
            );


            alert(
                "Не удалось получить список интерфейсов.\n\n" +
                error.message
            );
        }
    }


    const observer =
        new MutationObserver(
            syncButton
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    syncButton();
})();
