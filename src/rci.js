(() => {
    const KRRS = window.KRRS ??= {};

    async function rci(commands) {
        const response =
            await fetch("/rci/", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body:
                    JSON.stringify(commands)
            });

        if (!response.ok) {
            throw new Error(
                `RCI request failed: ${response.status}`
            );
        }

        return response.json();
    }


    /* =====================================================
     * Interfaces
     * ===================================================== */

    async function loadInterfaces() {
        const data =
            await rci([
                {
                    show: {
                        sc: {
                            interface: {
                                trait: "Ip"
                            }
                        }
                    }
                },
                {
                    show: {
                        interface: {
                            details: "yes",
                            trait: "Ip"
                        }
                    }
                },
                {
                    show: {
                        sc: {
                            interface: {
                                ipoe: {
                                    parent: ""
                                }
                            }
                        }
                    }
                },
                {
                    show: {
                        sc: {
                            interface: {
                                trait: "Ip6"
                            }
                        }
                    }
                },
                {
                    show: {
                        interface: {
                            details: "yes",
                            trait: "Ip6"
                        }
                    }
                }
            ]);

        console.log(
            "[KRRS] Interface response:",
            data
        );

        const interfaces =
            extractInterfaces(data);

        if (!interfaces.length) {
            throw new Error(
                "Интерфейсы не найдены"
            );
        }

        return interfaces;
    }

    function extractInterfaces(data) {
        const interfaces =
            new Map();

        function visit(value) {
            if (!value) {
                return;
            }

            if (Array.isArray(value)) {
                value.forEach(visit);
                return;
            }

            if (
                typeof value !== "object"
            ) {
                return;
            }

            const id =
                value.id ??
                value["interface-name"];

            if (
                typeof id === "string"
            ) {
                const name =
                    value.description ||
                    value.label ||
                    id;

                interfaces.set(
                    id,
                    {
                        id,
                        name
                    }
                );
            }

            Object
                .values(value)
                .forEach(visit);
        }

        visit(data);

        return [
            {
                id: "__ANY_INTERFACE__",
                name: "Любой"
            },
            ...interfaces.values()
        ];
    }


    /* =====================================================
     * DNS routes
     * ===================================================== */

    async function loadDnsRoutes() {
        const data =
            await rci([
                {
                    show: {
                        sc: {
                            "dns-proxy": {
                                route: {}
                            }
                        }
                    }
                }
            ]);

        console.log(
            "[KRRS] DNS routes response:",
            data
        );

        const routes =
            extractDnsRoutes(data);

        if (!routes.length) {
            throw new Error(
                "DNS-маршруты не найдены"
            );
        }

        return routes;
    }

    function extractDnsRoutes(data) {
        const routeArrays = [];
        const standaloneRoutes = [];

        function isRoute(value) {
            return (
                value &&
                typeof value === "object" &&
                typeof value.index === "string" &&
                (
                    "group" in value ||
                    "interface" in value ||
                    "gateway" in value
                )
            );
        }

        function visit(value) {
            if (!value) {
                return;
            }

            if (Array.isArray(value)) {
                const routes =
                    value.filter(isRoute);

                if (routes.length) {
                    routeArrays.push(
                        routes
                    );
                }

                value.forEach(visit);
                return;
            }

            if (
                typeof value !== "object"
            ) {
                return;
            }

            if (isRoute(value)) {
                standaloneRoutes.push(
                    value
                );
            }

            Object
                .values(value)
                .forEach(visit);
        }

        visit(data);

        if (routeArrays.length) {
            routeArrays.sort(
                (a, b) =>
                    b.length - a.length
            );

            return routeArrays[0];
        }

        return standaloneRoutes;
    }


    /* =====================================================
     * Save
     * ===================================================== */

    async function saveSelectedRouteChanges(
        changes,
        interfaces
    ) {
        const hasChanges =
            changes.interface !== null ||
            changes.auto !== null ||
            changes.reject !== null;

        if (!hasChanges) {
            throw new Error(
                "Не выбраны изменения"
            );
        }

        if (
            changes.interface?.id ===
            "__ANY_INTERFACE__"
        ) {
            throw new Error(
                'Сохранение значения "Любой" пока не поддерживается'
            );
        }

        const {
            rows,
            selected
        } =
            KRRS.routes
                .getSelectedRouteRows();

        if (!selected.length) {
            throw new Error(
                "Не выбраны маршруты"
            );
        }

        const routes =
            await loadDnsRoutes();

        if (
            routes.length !==
            rows.length
        ) {
            throw new Error(
                "Количество маршрутов в UI и RCI не совпадает: " +
                `UI=${rows.length}, RCI=${routes.length}`
            );
        }

        const commands = [];

        for (
            const selectedRow
            of selected
        ) {
            const route =
                routes[
                    selectedRow.index
                ];

            if (!route) {
                throw new Error(
                    "Маршрут не найден для строки " +
                    selectedRow.index
                );
            }

            KRRS.routes
                .validateRouteMapping(
                    selectedRow.element,
                    route,
                    interfaces
                );

            if (
                typeof route.index !==
                "string"
            ) {
                throw new Error(
                    "У маршрута отсутствует index"
                );
            }

            if (
                typeof route.group !==
                "string"
            ) {
                throw new Error(
                    `У маршрута ${route.index} отсутствует group`
                );
            }

            const updatedRoute = {
                group:
                    route.group,

                gateway:
                    route.gateway ?? "",

                auto:
                    KRRS.routes
                        .toBoolean(
                            route.auto
                        ),

                reject:
                    KRRS.routes
                        .toBoolean(
                            route.reject
                        ),

                index:
                    route.index
            };

            if (
                typeof route.interface ===
                "string"
            ) {
                updatedRoute.interface =
                    route.interface;
            }

            if (
                changes.interface !== null
            ) {
                updatedRoute.interface =
                    changes.interface.id;

                updatedRoute.gateway =
                    "";
            }

            if (
                changes.auto !== null
            ) {
                updatedRoute.auto =
                    changes.auto;
            }

            if (
                changes.reject !== null
            ) {
                updatedRoute.reject =
                    changes.reject;
            }

            commands.push({
                "dns-proxy": {
                    route:
                        updatedRoute
                }
            });
        }

        commands.push({
            system: {
                configuration: {
                    save: {}
                }
            }
        });

        console.log(
            "[KRRS] Saving:",
            commands
        );

        const result =
            await rci(commands);

        console.log(
            "[KRRS] Save response:",
            result
        );

        return result;
    }


    KRRS.rci = {
        loadInterfaces,
        loadDnsRoutes,
        saveSelectedRouteChanges
    };
})();
