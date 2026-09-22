(() => {
    const KRRS = window.KRRS ??= {};

    function toBoolean(value) {
        return (
            value === true ||
            value === 1 ||
            value === "1" ||
            value === "true" ||
            value === "yes" ||
            value === "on"
        );
    }

    function booleanText(value) {
        return toBoolean(value)
            ? "Да"
            : "Нет";
    }

    function getSelectedRouteRows() {
        const table =
            document.querySelector(
                "ndw-user-routes-table ndw-table"
            ) ??
            document.querySelector(
                "ndw-table"
            );

        if (!table) {
            throw new Error(
                "Таблица маршрутов не найдена"
            );
        }

        const rowGroups = Array.from(
            table.querySelectorAll(
                "tbody.ndw-table__row-group"
            )
        );

        if (!rowGroups.length) {
            throw new Error(
                "Строки маршрутов не найдены"
            );
        }

        const selected = [];

        for (
            let position = 0;
            position < rowGroups.length;
            position++
        ) {
            const rowGroup =
                rowGroups[position];

            const checked =
                rowGroup.querySelector(
                    ".ndw-checkbox__checkbox__checkmark--checked"
                );

            if (!checked) {
                continue;
            }

            const indexClass =
                Array.from(
                    rowGroup.classList
                ).find(
                    className =>
                        /^ndw-table__row-group-\d+$/
                            .test(className)
                );

            let rowIndex =
                position;

            if (indexClass) {
                const match =
                    indexClass.match(/\d+$/);

                if (match) {
                    rowIndex =
                        Number(match[0]);
                }
            }

            selected.push({
                index: rowIndex,
                position,
                element: rowGroup
            });
        }

        return {
            rows: rowGroups,
            selected
        };
    }

    function validateRouteMapping(
        rowGroup,
        route,
        interfaces
    ) {
        const firstRow =
            rowGroup.querySelector("tr");

        if (!firstRow) {
            throw new Error(
                "Не найдена строка таблицы"
            );
        }

        const cells =
            Array.from(
                firstRow.querySelectorAll(
                    ":scope > td.ndw-table__cell"
                )
            );

        /*
         * DNS table:
         * 0 checkbox
         * 1 enabled
         * 2 domain list
         * 3 gateway
         * 4 interface
         * 5 auto
         * 6 reject
         * 7 edit
         */
        if (cells.length < 7) {
            console.warn(
                "[KRRS] Unexpected route row structure:",
                cells
            );

            return;
        }

        const displayedGateway =
            cells[3]?.textContent?.trim() ?? "";

        const displayedInterface =
            cells[4]?.textContent?.trim() ?? "";

        const displayedAuto =
            cells[5]?.textContent?.trim() ?? "";

        const displayedReject =
            cells[6]?.textContent?.trim() ?? "";

        const interfaceInfo =
            interfaces.find(
                iface =>
                    iface.id === route.interface
            );

        const expectedInterface =
            interfaceInfo?.name ??
            route.interface ??
            "Любой";

        const expectedGateway =
            route.gateway ?? "";

        if (
            displayedGateway !==
            expectedGateway
        ) {
            throw new Error(
                `Не совпадает шлюз маршрута ${route.index}: ` +
                `"${displayedGateway}" != "${expectedGateway}"`
            );
        }

        if (
            displayedInterface !==
            expectedInterface
        ) {
            throw new Error(
                `Не совпадает интерфейс маршрута ${route.index}: ` +
                `"${displayedInterface}" != "${expectedInterface}"`
            );
        }

        if (
            displayedAuto &&
            displayedAuto !==
                booleanText(route.auto)
        ) {
            throw new Error(
                `Не совпадает auto маршрута ${route.index}`
            );
        }

        if (
            displayedReject &&
            displayedReject !==
                booleanText(route.reject)
        ) {
            throw new Error(
                `Не совпадает reject маршрута ${route.index}`
            );
        }
    }

    KRRS.routes = {
        getSelectedRouteRows,
        validateRouteMapping,
        toBoolean
    };
})();
