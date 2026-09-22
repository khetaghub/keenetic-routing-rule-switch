(() => {
    const KRRS = window.KRRS ??= {};

    const DIALOG_ID =
        "keenetic-routing-rule-switch-dialog";


    function openBulkEditDialog(
        interfaces
    ) {
        document
            .getElementById(
                DIALOG_ID
            )
            ?.remove();

        const changes = {
            interface: null,
            auto: null,
            reject: null
        };


        const overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            DIALOG_ID;

        overlay.className =
            "krrs-overlay";


        const dialog =
            document.createElement(
                "div"
            );

        dialog.className =
            "krrs-dialog";


        const content =
            document.createElement(
                "div"
            );

        content.className =
            "krrs-dialog__content";


        /* =================================================
         * Header
         * ================================================= */

        const top =
            document.createElement(
                "div"
            );

        top.className =
            "krrs-dialog__top";


        const title =
            document.createElement(
                "h1"
            );

        title.className =
            "krrs-dialog__title";

        title.textContent =
            "Параметры DNS-маршрутов";


        const close =
            document.createElement(
                "div"
            );

        close.className =
            "krrs-dialog__close";

        close.tabIndex = 0;

        close.innerHTML = `
            <svg class="krrs-dialog__close-icon">
                <use href="./assets/sprite/sprite.svg#close-tab"></use>
            </svg>
        `;


        top.append(
            title,
            close
        );


        /* =================================================
         * Body
         * ================================================= */

        const body =
            document.createElement(
                "div"
            );

        body.className =
            "krrs-dialog__body";


        const interfaceOptions = [
            {
                id: null,
                name: "Не изменять"
            },

            ...interfaces.filter(
                iface =>
                    iface.id !==
                    "__ANY_INTERFACE__"
            )
        ];


        const select =
            createInterfaceSelect(
                interfaceOptions,
                interfaceOptions[0],
                value => {
                    changes.interface =
                        value.id === null
                            ? null
                            : value;
                }
            );


        const chips =
            createInterfaceFilterChips(
                filter => {
                    select.setFilter(
                        filter
                    );
                }
            );


        const options =
            document.createElement(
                "div"
            );

        options.className =
            "krrs-bulk-options";


        const auto =
            createKeeneticTriStateCheckbox(
                "Добавлять автоматически",
                value => {
                    changes.auto =
                        value;
                }
            );


        const reject =
            createKeeneticTriStateCheckbox(
                "Эксклюзивный маршрут",
                value => {
                    changes.reject =
                        value;
                }
            );


        options.append(
            auto,
            reject
        );


        body.append(
            select.element,
            chips,
            options
        );


        /* =================================================
         * Footer
         * ================================================= */

        const footer =
            document.createElement(
                "div"
            );

        footer.className =
            "krrs-dialog__footer";


        const apply =
            document.createElement(
                "button"
            );

        apply.className =
            "krrs-button krrs-button--primary";

        apply.textContent =
            "Применить";


        const cancel =
            document.createElement(
                "button"
            );

        cancel.className =
            "krrs-button krrs-button--outline";

        cancel.textContent =
            "Отменить";


        footer.append(
            apply,
            cancel
        );


        content.append(
            top,
            body,
            footer
        );

        dialog.appendChild(
            content
        );

        overlay.appendChild(
            dialog
        );

        document.body.appendChild(
            overlay
        );


        /* =================================================
         * Close
         * ================================================= */

        const onKeyDown =
            event => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    destroy();
                }
            };


        const onDocumentClick =
            event => {
                if (
                    !select.element.contains(
                        event.target
                    )
                ) {
                    select.close();
                }
            };


        const destroy = () => {
            document.removeEventListener(
                "keydown",
                onKeyDown
            );

            document.removeEventListener(
                "click",
                onDocumentClick
            );

            overlay.remove();
        };


        close.addEventListener(
            "click",
            destroy
        );


        close.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                        "Enter" ||
                    event.key ===
                        " "
                ) {
                    event.preventDefault();
                    destroy();
                }
            }
        );


        cancel.addEventListener(
            "click",
            destroy
        );


        overlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    overlay
                ) {
                    destroy();
                }
            }
        );


        document.addEventListener(
            "keydown",
            onKeyDown
        );


        document.addEventListener(
            "click",
            onDocumentClick
        );


        /* =================================================
         * Save
         * ================================================= */

        apply.addEventListener(
            "click",
            async () => {
                const oldText =
                    apply.textContent;

                try {
                    apply.disabled =
                        true;

                    cancel.disabled =
                        true;

                    apply.textContent =
                        "Сохранение...";


                    await KRRS.rci
                        .saveSelectedRouteChanges(
                            changes,
                            interfaces
                        );


                    destroy();

                    window.location.reload();

                } catch (error) {
                    console.error(
                        "[KRRS] Failed to edit routes:",
                        error
                    );

                    alert(
                        "Не удалось изменить параметры.\n\n" +
                        error.message
                    );

                    apply.disabled =
                        false;

                    cancel.disabled =
                        false;

                    apply.textContent =
                        oldText;
                }
            }
        );
    }


    /* =====================================================
     * Keenetic-like select
     * ===================================================== */

    function createInterfaceSelect(
        interfaces,
        initialValue,
        onChange
    ) {
        const root =
            document.createElement(
                "div"
            );

        root.className =
            "krrs-select";


        const input =
            document.createElement(
                "div"
            );

        input.className =
            "krrs-select__input";

        input.tabIndex = 0;


        const label =
            document.createElement(
                "span"
            );

        label.className =
            "krrs-select__label";

        label.textContent =
            "Интерфейс";


        const value =
            document.createElement(
                "span"
            );

        value.className =
            "krrs-select__value";

        value.textContent =
            initialValue?.name ?? "";


        const arrow =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

        arrow.classList.add(
            "krrs-select__icon"
        );


        const use =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "use"
            );

        use.setAttribute(
            "href",
            "./assets/sprite/sprite.svg#select-arrow"
        );

        arrow.appendChild(
            use
        );


        const list =
            document.createElement(
                "div"
            );

        list.className =
            "krrs-select__list";


        let selected =
            initialValue;

        let filter =
            "all";


        function matchesFilter(
            iface
        ) {
            if (iface.id === null) {
                return true;
            }

            switch (filter) {
                case "wireguard":
                    return iface.id
                        .startsWith(
                            "Wireguard"
                        );

                case "wifi":
                    return iface.id
                        .startsWith(
                            "WifiMaster"
                        );

                case "networks":
                    return (
                        iface.id
                            .startsWith(
                                "Bridge"
                            ) ||
                        iface.id
                            .startsWith(
                                "GigabitEthernet"
                            )
                    );

                default:
                    return true;
            }
        }


        function renderItems() {
            list.replaceChildren();

            const visibleInterfaces =
                interfaces.filter(
                    matchesFilter
                );

            for (
                const iface
                of visibleInterfaces
            ) {
                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "krrs-select__item";


                if (
                    iface.id ===
                    selected?.id
                ) {
                    item.classList.add(
                        "krrs-select__item--selected"
                    );
                }


                item.textContent =
                    iface.name;


                item.addEventListener(
                    "click",
                    event => {
                        event.stopPropagation();

                        selected =
                            iface;

                        value.textContent =
                            iface.name;

                        renderItems();

                        root.classList.remove(
                            "krrs-select--opened"
                        );

                        onChange(
                            iface
                        );
                    }
                );


                list.appendChild(
                    item
                );
            }
        }


        function setFilter(
            nextFilter
        ) {
            filter =
                nextFilter;

            renderItems();
        }


        renderItems();


        input.append(
            label,
            value,
            arrow
        );


        root.append(
            input,
            list
        );


        input.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                root.classList.toggle(
                    "krrs-select--opened"
                );
            }
        );


        input.addEventListener(
            "keydown",
            event => {
                if (
                    event.key ===
                        "Enter" ||
                    event.key ===
                        " "
                ) {
                    event.preventDefault();

                    root.classList.toggle(
                        "krrs-select--opened"
                    );
                }
            }
        );


        function close() {
            root.classList.remove(
                "krrs-select--opened"
            );
        }


        return {
            element: root,
            setFilter,
            close
        };
    }


    function createInterfaceFilterChips(
        onFilterChange
    ) {
        const root =
            document.createElement(
                "div"
            );

        root.className =
            "krrs-interface-filters";


        const filters = [
            {
                id: "all",
                label: "Все"
            },
            {
                id: "wireguard",
                label: "WireGuard"
            },
            {
                id: "wifi",
                label: "Wi-Fi"
            },
            {
                id: "networks",
                label: "Сети"
            }
        ];


        let activeFilter =
            "all";


        function render() {
            root.replaceChildren();

            for (
                const filter
                of filters
            ) {
                const chip =
                    document.createElement(
                        "button"
                    );

                chip.type =
                    "button";

                chip.className =
                    "krrs-chip";

                chip.textContent =
                    filter.label;


                if (
                    filter.id ===
                    activeFilter
                ) {
                    chip.classList.add(
                        "krrs-chip--active"
                    );
                }


                chip.addEventListener(
                    "click",
                    () => {
                        if (
                            activeFilter ===
                            filter.id
                        ) {
                            return;
                        }

                        activeFilter =
                            filter.id;

                        render();

                        onFilterChange(
                            activeFilter
                        );
                    }
                );


                root.appendChild(
                    chip
                );
            }
        }


        render();

        return root;
    }


    /* =====================================================
     * Native Keenetic tri-state checkbox
     *
     * We clone a real ndw-checkbox that is already rendered
     * on the current Keenetic page. This preserves the
     * Angular _ngcontent-* attributes and therefore uses
     * exactly the checkbox styles of the running Web UI.
     *
     * null  = do not change (blue box with "−")
     * true  = enable for all (native Keenetic check mark)
     * false = disable for all (native unchecked state)
     * ===================================================== */

    function createKeeneticTriStateCheckbox(
        labelText,
        onChange
    ) {
        const root =
            document.createElement(
                "div"
            );

        root.className =
            "krrs-native-checkbox-row";


        const nativeCheckbox =
            cloneNativeKeeneticCheckbox(
                labelText
            );


        const status =
            document.createElement(
                "div"
            );

        status.className =
            "krrs-native-checkbox__state";


        root.append(
            nativeCheckbox.host,
            status
        );


        let state =
            null;


        function render() {
            const {
                checkbox,
                input,
                checkmark,
                iconContainer,
                nativeIcon
            } =
                nativeCheckbox;


            checkbox.setAttribute(
                "aria-checked",
                state === null
                    ? "mixed"
                    : String(state)
            );


            input.checked =
                state === true;

            input.indeterminate =
                state === null;


            checkmark.classList.remove(
                "krrs-native-checkbox__checkmark--mixed"
            );


            if (state === null) {
                checkmark.classList.add(
                    "ndw-checkbox__checkbox__checkmark--checked",
                    "krrs-native-checkbox__checkmark--mixed"
                );

                iconContainer.style.opacity =
                    "1";

                if (nativeIcon) {
                    nativeIcon.style.visibility =
                        "hidden";
                }

                status.textContent =
                    "Не изменять";

            } else if (state === true) {
                checkmark.classList.add(
                    "ndw-checkbox__checkbox__checkmark--checked"
                );

                iconContainer.style.opacity =
                    "1";

                if (nativeIcon) {
                    nativeIcon.style.visibility =
                        "";
                }

                status.textContent =
                    "Включить для всех";

            } else {
                checkmark.classList.remove(
                    "ndw-checkbox__checkbox__checkmark--checked"
                );

                iconContainer.style.opacity =
                    "0";

                if (nativeIcon) {
                    nativeIcon.style.visibility =
                        "";
                }

                status.textContent =
                    "Выключить для всех";
            }
        }


        function nextState() {
            if (state === null) {
                state = true;
            } else if (state === true) {
                state = false;
            } else {
                state = null;
            }

            render();
            onChange(state);
        }


        nativeCheckbox.checkbox
            .addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    nextState();
                }
            );


        nativeCheckbox.checkbox
            .addEventListener(
                "keydown",
                event => {
                    if (
                        event.key ===
                            "Enter" ||
                        event.key ===
                            " "
                    ) {
                        event.preventDefault();
                        event.stopPropagation();

                        nextState();
                    }
                }
            );


        render();

        return root;
    }


    function cloneNativeKeeneticCheckbox(
        labelText
    ) {
        /*
         * The bulk button exists only while at least one row
         * is selected, so normally a checked native checkbox
         * is guaranteed to exist. Prefer it because it already
         * contains Keenetic's check-mark SVG.
         */
        const checkedMark =
            document.querySelector(
                ".ndw-checkbox__checkbox__checkmark--checked"
            );

        const sourceHost =
            checkedMark
                ?.closest("ndw-checkbox") ??
            document.querySelector(
                "ndw-checkbox"
            );


        if (!sourceHost) {
            throw new Error(
                "Не найден нативный checkbox Keenetic"
            );
        }


        const host =
            sourceHost.cloneNode(true);


        host.removeAttribute(
            "label"
        );

        host.removeAttribute(
            "description"
        );

        host.className =
            "krrs-native-checkbox-host";


        const root =
            host.querySelector(
                ".ndw-checkbox"
            );

        const checkbox =
            host.querySelector(
                ".ndw-checkbox__checkbox"
            );

        const input =
            host.querySelector(
                ".ndw-checkbox__checkbox__input"
            );

        const wrapper =
            host.querySelector(
                ".ndw-checkbox__wrapper"
            );

        const checkmark =
            host.querySelector(
                ".ndw-checkbox__checkbox__checkmark"
            );


        if (
            !root ||
            !checkbox ||
            !input ||
            !wrapper ||
            !checkmark
        ) {
            throw new Error(
                "Не удалось клонировать структуру checkbox Keenetic"
            );
        }


        /*
         * A table checkbox often has no text label.
         * Add the same .ndw-checkbox__label node and copy
         * Angular's generated scope attribute from a sibling.
         */
        let label =
            host.querySelector(
                ".ndw-checkbox__label"
            );


        if (!label) {
            label =
                document.createElement(
                    "div"
                );

            label.className =
                "ndw-checkbox__label";

            copyAngularScopeAttribute(
                checkbox,
                label
            );

            checkbox.appendChild(
                label
            );
        }


        label.textContent =
            labelText;


        input.setAttribute(
            "aria-label",
            labelText
        );


        let iconContainer =
            host.querySelector(
                ".ndw-checkbox__checkbox__checkmark__icon"
            );


        if (!iconContainer) {
            iconContainer =
                document.createElement(
                    "div"
                );

            iconContainer.className =
                "ndw-checkbox__checkbox__checkmark__icon";

            copyAngularScopeAttribute(
                checkmark,
                iconContainer
            );

            checkmark.appendChild(
                iconContainer
            );
        }


        const nativeIcon =
            iconContainer.querySelector(
                "ndw-svg-icon, svg"
            );


        /*
         * cloneNode does not clone JS event listeners, so the
         * copy is purely visual and controlled only by KRRS.
         */
        return {
            host,
            checkbox,
            input,
            checkmark,
            iconContainer,
            nativeIcon
        };
    }


    function copyAngularScopeAttribute(
        source,
        target
    ) {
        for (
            const attribute
            of source.attributes
        ) {
            if (
                attribute.name.startsWith(
                    "_ngcontent-"
                )
            ) {
                target.setAttribute(
                    attribute.name,
                    ""
                );

                return;
            }
        }
    }


    KRRS.dialog = {
        openBulkEditDialog
    };
})();
