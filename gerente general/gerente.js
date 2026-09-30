/* =====================================================
   CONFIGURACIÓN SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://yuivmqncvmsbtiigxsqt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_r1ZMaIIEVcAt26_P-FBu9Q_DUenqDH_";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   ABRIR TIENDA
===================================================== */

function abrirTienda(link) {

    if (!link) {
        alert("No se encontró el enlace de la tienda.");
        return;
    }

    const url =
        new URL(
            link,
            window.location.href
        ).href;

    console.log(
        "Abriendo tienda:",
        url
    );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   COPIAR LINK
===================================================== */

async function copiarLink(link) {

    if (!link) {
        alert("No se encontró el enlace de la tienda.");
        return;
    }

    const url =
        new URL(
            link,
            window.location.href
        ).href;

    try {

        await navigator.clipboard.writeText(url);

        alert(
            "Link copiado correctamente."
        );

    } catch (error) {

        console.error(
            "Error al copiar:",
            error
        );

        alert(
            "No se pudo copiar el link."
        );
    }
}


/* =====================================================
   ACTUALIZAR APARIENCIA DEL BOTÓN
===================================================== */

function actualizarBotonEstado(
    boton,
    activa
) {

    if (activa === true) {

        boton.textContent =
            "DESACTIVAR";

        boton.classList.remove(
            "activar"
        );

        boton.classList.add(
            "desactivar"
        );

    } else {

        boton.textContent =
            "ACTIVAR";

        boton.classList.remove(
            "desactivar"
        );

        boton.classList.add(
            "activar"
        );
    }
}


/* =====================================================
   CREAR FILA DE UNA TIENDA
===================================================== */

function crearTiendaHTML(tienda) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "tienda";


   const linkTienda =
    "https://shoptiendaonline47-ctrl.github.io/SHOPTIENDA/?tienda=" +
    encodeURIComponent(
        tienda.slug
    );

    div.innerHTML = `

        <div class="informacion-tienda">

            <span class="nombre-tienda">
                ${escapeHTML(tienda.nombre)}
            </span>

            <span class="link-tienda">
                ${escapeHTML(linkTienda)}
            </span>

        </div>


        <div class="acciones-tienda">

            <button
                class="btn-abrir"
                type="button"
                data-link="${escapeHTML(linkTienda)}"
            >
                ABRIR TIENDA
            </button>


            <button
                class="btn-copiar"
                type="button"
                data-link="${escapeHTML(linkTienda)}"
            >
                COPIAR LINK
            </button>


            <button
                class="btn-estado ${tienda.activa ? "desactivar" : "activar"}"
                type="button"
                data-tienda-id="${tienda.id}"
            >
                ${tienda.activa ? "DESACTIVAR" : "ACTIVAR"}
            </button>

        </div>

    `;


    return div;
}


/* =====================================================
   CONECTAR BOTONES DE LAS TIENDAS
===================================================== */

function conectarBotonesTiendas() {


    /* =============================================
       ACTIVAR / DESACTIVAR
    ============================================= */

    const botonesEstado =
        document.querySelectorAll(
            ".btn-estado"
        );


    botonesEstado.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    cambiarEstadoTienda(
                        boton
                    );

                }
            );

        }
    );


    /* =============================================
       ABRIR TIENDA
    ============================================= */

    const botonesAbrir =
        document.querySelectorAll(
            ".btn-abrir"
        );


    botonesAbrir.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    abrirTienda(
                        boton.dataset.link
                    );

                }
            );

        }
    );


    /* =============================================
       COPIAR LINK
    ============================================= */

    const botonesCopiar =
        document.querySelectorAll(
            ".btn-copiar"
        );


    botonesCopiar.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function () {

                    copiarLink(
                        boton.dataset.link
                    );

                }
            );

        }
    );
}


/* =====================================================
   CARGAR TIENDAS DESDE SUPABASE
===================================================== */

async function cargarTiendas() {

    console.log(
        "Cargando tiendas desde Supabase..."
    );


    const listaTiendas =
        document.getElementById(
            "listaTiendas"
        );


    if (!listaTiendas) {

        console.error(
            "No se encontró el elemento listaTiendas."
        );

        return;
    }


    listaTiendas.innerHTML = `

        <p id="cargandoTiendas">
            Cargando tiendas...
        </p>

    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("tiendas")
        .select(
            "id, nombre, slug, link, activa"
        )
        .order(
            "id",
            {
                ascending: true
            }
        );


    /* =============================================
       ERROR
    ============================================= */

    if (error) {

        console.error(
            "ERROR AL CARGAR TIENDAS:",
            error
        );


        listaTiendas.innerHTML = `

            <p>
                No se pudieron cargar las tiendas.
            </p>

        `;


        alert(
            "ERROR SUPABASE\n\n" +
            "Código: " +
            (error.code || "Sin código") +
            "\n\nMensaje:\n" +
            (error.message || "Sin mensaje") +
            "\n\nDetalle:\n" +
            (error.details || "Sin detalle") +
            "\n\nAyuda:\n" +
            (error.hint || "Sin ayuda")
        );


        return;
    }


    console.log(
        "Tiendas recibidas desde Supabase:",
        data
    );


    listaTiendas.innerHTML = "";


    /* =============================================
       SI NO HAY TIENDAS
    ============================================= */

    if (!data || data.length === 0) {

        listaTiendas.innerHTML = `

            <p>
                No hay tiendas registradas.
            </p>

        `;

        return;
    }


    /* =============================================
       CREAR TIENDAS
    ============================================= */

    data.forEach(
        function (tienda) {

            const fila =
                crearTiendaHTML(
                    tienda
                );


            listaTiendas.appendChild(
                fila
            );

        }
    );


    conectarBotonesTiendas();


    console.log(
        "Total de tiendas cargadas:",
        data.length
    );
}


/* =====================================================
   CAMBIAR ESTADO DE TIENDA
===================================================== */

async function cambiarEstadoTienda(
    boton
) {

    const tiendaId =
        boton.dataset.tiendaId;


    if (!tiendaId) {

        alert(
            "No se encontró el ID de la tienda."
        );

        return;
    }


    const estaActiva =
        boton.textContent
            .trim()
            .toUpperCase() ===
        "DESACTIVAR";


    const nuevoEstado =
        !estaActiva;


    console.log(
        "================================="
    );

    console.log(
        "ID DE TIENDA:",
        tiendaId
    );

    console.log(
        "ESTADO ACTUAL:",
        estaActiva
    );

    console.log(
        "NUEVO ESTADO:",
        nuevoEstado
    );

    console.log(
        "================================="
    );


    boton.disabled = true;


    /* =============================================
       GUARDAR EN SUPABASE
    ============================================= */

    const {
        error
    } = await supabaseClient
        .from("tiendas")
        .update({
            activa: nuevoEstado
        })
        .eq(
            "id",
            Number(tiendaId)
        );


    /* =============================================
       ERROR
    ============================================= */

    if (error) {

        console.error(
            "ERROR SUPABASE:",
            error
        );


        alert(
            "ERROR SUPABASE\n\n" +
            "Código: " +
            (error.code || "Sin código") +
            "\n\nMensaje:\n" +
            (error.message || "Sin mensaje") +
            "\n\nDetalle:\n" +
            (error.details || "Sin detalle") +
            "\n\nAyuda:\n" +
            (error.hint || "Sin ayuda")
        );


        boton.disabled = false;

        return;
    }


    /* =============================================
       ACTUALIZAR BOTÓN
    ============================================= */

    actualizarBotonEstado(
        boton,
        nuevoEstado
    );


    boton.disabled = false;


    console.log(
        "Tienda actualizada correctamente."
    );
}


/* =====================================================
   CARGAR CLAVES
===================================================== */

async function cargarClaves() {

    console.log(
        "Cargando usuarios y contraseñas..."
    );


    const claves =
        document.getElementById(
            "claves"
        );


    if (!claves) {

        console.error(
            "No se encontró el elemento #claves."
        );

        return;
    }


    /* =============================================
       MENSAJE DE CARGA
    ============================================= */

    claves.innerHTML = `

        <h2>
            CLAVES
        </h2>

        <p>
            Cargando usuarios y contraseñas...
        </p>

    `;


    /* =============================================
       CONSULTAR TIENDAS + CREDENCIALES
    ============================================= */

    const {
        data,
        error
    } = await supabaseClient
        .from("tiendas")
        .select(`
            id,
            nombre,
            credenciales_admin (
                usuario,
                contrasena
            )
        `)
        .order(
            "id",
            {
                ascending: true
            }
        );


    /* =============================================
       ERROR
    ============================================= */

    if (error) {

        console.error(
            "ERROR AL CARGAR CLAVES:",
            error
        );


        claves.innerHTML = `

            <h2>
                CLAVES
            </h2>

            <p>
                No se pudieron cargar los usuarios y contraseñas.
            </p>

        `;


        alert(
            "ERROR AL CARGAR CLAVES\n\n" +
            "Código: " +
            (error.code || "Sin código") +
            "\n\nMensaje:\n" +
            (error.message || "Sin mensaje") +
            "\n\nDetalle:\n" +
            (error.details || "Sin detalle") +
            "\n\nAyuda:\n" +
            (error.hint || "Sin ayuda")
        );


        return;
    }


    console.log(
        "Credenciales recibidas:",
        data
    );


    /* =============================================
       CREAR TABLA
    ============================================= */

    let html = `

        <h2>
            CLAVES
        </h2>

        <div class="tabla-claves-contenedor">

            <table class="tabla-claves">

                <thead>

                    <tr>

                        <th>
                            TIENDA
                        </th>

                        <th>
                            USUARIO
                        </th>

                        <th>
                            CONTRASEÑA
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    /* =============================================
       RECORRER TIENDAS
    ============================================= */

    if (!data || data.length === 0) {

        html += `

            <tr>

                <td colspan="3">
                    No hay tiendas registradas.
                </td>

            </tr>

        `;

    } else {

        data.forEach(
            function (tienda) {

                let credencial = null;


                /*
                   Supabase puede devolver la relación
                   como objeto o como arreglo.
                */

                if (
                    Array.isArray(
                        tienda.credenciales_admin
                    )
                ) {

                    credencial =
                        tienda.credenciales_admin[0];

                } else {

                    credencial =
                        tienda.credenciales_admin;
                }


                const usuario =
                    credencial &&
                    credencial.usuario
                        ? credencial.usuario
                        : "Sin usuario";


                const contrasena =
                    credencial &&
                    credencial.contrasena
                        ? credencial.contrasena
                        : "Sin contraseña";


                html += `

                    <tr>

                        <td>
                            ${escapeHTML(
                                tienda.nombre
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                usuario
                            )}
                        </td>

                        <td class="contrasena-visible">
                            ${escapeHTML(
                                contrasena
                            )}
                        </td>

                    </tr>

                `;

            }
        );

    }


    html += `

                </tbody>

            </table>

        </div>

    `;


    claves.innerHTML = html;


    console.log(
        "CLAVES cargadas correctamente."
    );
}


/* =====================================================
   PROTEGER TEXTO HTML
===================================================== */

function escapeHTML(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";
    }


    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   MENÚ PRINCIPAL
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "================================="
        );

        console.log(
            "GERENTE.JS CARGADO CORRECTAMENTE"
        );

        console.log(
            "================================="
        );


        /* =============================================
           ELEMENTOS DEL MENÚ
        ============================================= */

        const btnTiendas =
            document.getElementById(
                "btnTiendas"
            );

        const btnClaves =
            document.getElementById(
                "btnClaves"
            );

        const btnInauguracion =
            document.getElementById(
                "btnInauguracion"
            );


        const tiendas =
            document.getElementById(
                "tiendas"
            );

        const claves =
            document.getElementById(
                "claves"
            );

        const inauguracion =
            document.getElementById(
                "inauguracion"
            );


        /* =============================================
           BOTÓN TIENDAS
        ============================================= */

        if (btnTiendas) {

            btnTiendas.addEventListener(
                "click",
                function () {

                    if (tiendas) {

                        tiendas.style.display =
                            "block";
                    }

                    if (claves) {

                        claves.style.display =
                            "none";
                    }

                    if (inauguracion) {

                        inauguracion.style.display =
                            "none";
                    }

                }
            );
        }


        /* =============================================
           BOTÓN CLAVES
        ============================================= */

        if (btnClaves) {

            btnClaves.addEventListener(
                "click",
                async function () {

                    if (tiendas) {

                        tiendas.style.display =
                            "none";
                    }

                    if (claves) {

                        claves.style.display =
                            "block";
                    }

                    if (inauguracion) {

                        inauguracion.style.display =
                            "none";
                    }


                    /*
                       Cada vez que se entra a CLAVES,
                       se consulta nuevamente Supabase.

                       Por eso siempre mostrará
                       las credenciales almacenadas
                       actualmente en credenciales_admin.
                    */

                    await cargarClaves();

                }
            );
        }


        /* =============================================
           BOTÓN INAUGURACIÓN
        ============================================= */

        if (btnInauguracion) {

            btnInauguracion.addEventListener(
                "click",
                function () {

                    if (tiendas) {

                        tiendas.style.display =
                            "none";
                    }

                    if (claves) {

                        claves.style.display =
                            "none";
                    }

                    if (inauguracion) {

                        inauguracion.style.display =
                            "block";
                    }

                }
            );
        }


        /* =============================================
           CARGAR TIENDAS
        ============================================= */

        cargarTiendas();

    }
);
