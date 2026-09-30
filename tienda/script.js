// =====================================================
// CONEXIÓN CON SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://yuivmqncvmsbtiigxsqt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_r1ZMaIIEVcAt26_P-FBu9Q_DUenqDH_";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// DATOS DE LA TIENDA DEL ADMIN
// =====================================================

let tiendaIdAdminActual = null;

let tiendaSlugAdminActual = "";

let tiendaNombreAdminActual = "";


// =====================================================
// OBTENER TIENDA DESDE LA URL
// =====================================================

function obtenerSlugTiendaAdmin() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    return (
        parametros.get("tienda") ||
        ""
    );
}


// =====================================================
// CARGAR TIENDA DEL ADMIN
// =====================================================

async function cargarTiendaAdmin() {

    const slug =
        obtenerSlugTiendaAdmin();


    if (!slug) {

        console.error(
            "No se recibió la tienda en la URL."
        );

        return false;
    }


    try {

        const {
            data,
            error
        } =
        await supabaseClient
            .from("tiendas")
            .select(
                "id, nombre, slug, link, activa"
            )
            .eq(
                "slug",
                slug
            )
            .maybeSingle();


        if (error) {

            console.error(
                "Error buscando tienda:",
                error
            );

            return false;
        }


        if (!data) {

            console.error(
                "No existe la tienda:",
                slug
            );

            return false;
        }


        tiendaIdAdminActual =
            Number(data.id);

        tiendaSlugAdminActual =
            data.slug;

        tiendaNombreAdminActual =
            data.nombre;


        console.log(
            "🏪 Tienda administrador:",
            tiendaNombreAdminActual
        );

        console.log(
            "🆔 ID tienda:",
            tiendaIdAdminActual
        );

        console.log(
            "🔗 Slug:",
            tiendaSlugAdminActual
        );


        return true;

    }

    catch(error) {

        console.error(
            "Error cargando tienda:",
            error
        );

        return false;
    }
}


// =====================================================
// INICIAR SESIÓN
// =====================================================

async function iniciarSesion() {

    const inputUsuario =
        document.getElementById(
            "usuario"
        );

    const inputPassword =
        document.getElementById(
            "password"
        );

    const mensaje =
        document.getElementById(
            "mensaje"
        );


    if (
        !inputUsuario ||
        !inputPassword ||
        !mensaje
    ) {

        console.error(
            "No se encontraron los campos de inicio de sesión."
        );

        return;
    }


    const usuario =
        inputUsuario.value.trim();

    const password =
        inputPassword.value;


    // =================================================
    // VALIDAR USUARIO
    // =================================================

    if (!/^\d{4,}$/.test(usuario)) {

        mensaje.textContent =
            "El usuario debe tener mínimo 4 dígitos.";

        mensaje.style.color =
            "red";

        return;
    }


    // =================================================
    // VALIDAR CONTRASEÑA
    // =================================================

    if (!password) {

        mensaje.textContent =
            "Ingresa tu contraseña.";

        mensaje.style.color =
            "red";

        return;
    }


    // =================================================
    // CARGAR TIENDA
    // =================================================

    const tiendaCorrecta =
        await cargarTiendaAdmin();


    if (!tiendaCorrecta) {

        mensaje.textContent =
            "No se pudo identificar la tienda.";

        mensaje.style.color =
            "red";

        return;
    }


    // =================================================
    // COMPROBAR SI ESTÁ ACTIVA
    // =================================================

    const {
        data: tiendaData,
        error: tiendaError
    } =
    await supabaseClient
        .from("tiendas")
        .select(
            "id, nombre, slug, activa"
        )
        .eq(
            "id",
            tiendaIdAdminActual
        )
        .maybeSingle();


    if (tiendaError) {

        console.error(
            "Error comprobando tienda:",
            tiendaError
        );

        mensaje.textContent =
            "No se pudo comprobar la tienda.";

        mensaje.style.color =
            "red";

        return;
    }


    if (
        !tiendaData ||
        tiendaData.activa !== true
    ) {

        mensaje.textContent =
            "Esta tienda está desactivada.";

        mensaje.style.color =
            "red";

        return;
    }


    mensaje.textContent =
        "Ingresando...";

    mensaje.style.color =
        "#333";


    try {

        // =================================================
        // BUSCAR USUARIO DE ESA TIENDA
        // =================================================

        const {
            data: usuarioData,
            error: usuarioError
        } =
        await supabaseClient
            .from("usuarios_admin")
            .select(
                "id, usuario, email, tienda_id"
            )
            .eq(
                "usuario",
                usuario
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (usuarioError) {

            console.error(
                "Error buscando usuario:",
                usuarioError
            );

            mensaje.textContent =
                "Error buscando el usuario.";

            mensaje.style.color =
                "red";

            return;
        }


        if (!usuarioData) {

            mensaje.textContent =
                "Usuario o contraseña incorrectos.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // INICIAR SESIÓN EN SUPABASE AUTH
        // =================================================

        const {
            data,
            error
        } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email:
                    usuarioData.email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Error de autenticación:",
                error
            );

            mensaje.textContent =
                "Usuario o contraseña incorrectos.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // VERIFICAR USUARIO AUTENTICADO
        // =================================================

        const {
            data: perfilAuth,
            error: perfilAuthError
        } =
        await supabaseClient
            .from("usuarios_admin")
            .select(
                "id, usuario, email, tienda_id"
            )
            .eq(
                "email",
                data.user.email
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (
            perfilAuthError ||
            !perfilAuth
        ) {

            console.error(
                "El usuario autenticado no pertenece a esta tienda."
            );


            await supabaseClient
                .auth
                .signOut();


            mensaje.textContent =
                "El administrador no pertenece a esta tienda.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // ACCESO CORRECTO
        // =================================================

        console.log(
            "Sesión iniciada:",
            data
        );

        console.log(
            "Administrador:",
            perfilAuth
        );


        mensaje.textContent =
            "Inicio de sesión correcto.";

        mensaje.style.color =
            "green";


        setTimeout(() => {

            window.location.href =
                "admin.html?tienda=" +
                encodeURIComponent(
                    tiendaSlugAdminActual
                );

        }, 500);

    }

    catch(error) {

        console.error(
            "Error iniciando sesión:",
            error
        );

        mensaje.textContent =
            "No se pudo conectar con Supabase.";

        mensaje.style.color =
            "red";
    }
}


// =====================================================
// COMPROBAR SESIÓN
// =====================================================

async function comprobarSesion() {

    const {
        data,
        error
    } =
    await supabaseClient
        .auth
        .getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

        return null;
    }


    return data.session;
}


// =====================================================
// PROTEGER ADMIN
// =====================================================

async function protegerAdmin() {

    const session =
        await comprobarSesion();


    if (!session) {

        window.location.href =
            "admin-login.html?tienda=" +
            encodeURIComponent(
                obtenerSlugTiendaAdmin()
            );

        return false;
    }


    const tiendaCorrecta =
        await cargarTiendaAdmin();


    if (!tiendaCorrecta) {

        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "admin-login.html";

        return false;
    }


    // =================================================
    // COMPROBAR ADMINISTRADOR DE LA TIENDA
    // =================================================

    const {
        data: usuarioActual,
        error: usuarioError
    } =
    await supabaseClient
        .from("usuarios_admin")
        .select(
            "id, usuario, email, tienda_id"
        )
        .eq(
            "email",
            session.user.email
        )
        .eq(
            "tienda_id",
            tiendaIdAdminActual
        )
        .maybeSingle();


    if (
        usuarioError ||
        !usuarioActual
    ) {

        console.error(
            "El administrador no pertenece a esta tienda."
        );


        await supabaseClient
            .auth
            .signOut();


        window.location.href =
            "admin-login.html?tienda=" +
            encodeURIComponent(
                tiendaSlugAdminActual
            );

        return false;
    }


    // =================================================
    // COMPROBAR QUE LA TIENDA SIGUE ACTIVA
    // =================================================

    const {
        data: tiendaData,
        error: tiendaError
    } =
    await supabaseClient
        .from("tiendas")
        .select(
            "id, activa"
        )
        .eq(
            "id",
            tiendaIdAdminActual
        )
        .maybeSingle();


    if (
        tiendaError ||
        !tiendaData ||
        tiendaData.activa !== true
    ) {

        await supabaseClient
            .auth
            .signOut();


        alert(
            "Esta tienda está desactivada."
        );


        window.location.href =
            "admin-login.html?tienda=" +
            encodeURIComponent(
                tiendaSlugAdminActual
            );

        return false;
    }


    return true;
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {

    const {
        error
    } =
    await supabaseClient
        .auth
        .signOut();


    if (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

        return;
    }


    window.location.href =
        "admin-login.html?tienda=" +
        encodeURIComponent(
            tiendaSlugAdminActual
        );
}


// =====================================================
// GUARDAR USUARIO Y CONTRASEÑA
// =====================================================

async function guardarUsuarioAdmin() {

    console.log(
        "GUARDAR USUARIO ADMIN EJECUTADO"
    );


    const inputUsuario =
        document.getElementById(
            "usuarioAdmin"
        );

    const inputPassword =
        document.getElementById(
            "passwordAdmin"
        );

    const mensaje =
        document.getElementById(
            "mensajeUsuarioAdmin"
        );


    if (
        !inputUsuario ||
        !inputPassword ||
        !mensaje
    ) {

        console.error(
            "No se encontraron los campos de usuario administrador."
        );

        return;
    }


    const nuevoUsuario =
        inputUsuario.value.trim();

    const nuevaPassword =
        inputPassword.value.trim();


    // =================================================
    // VALIDAR USUARIO
    // =================================================

    if (!/^\d{4,}$/.test(nuevoUsuario)) {

        mensaje.textContent =
            "El usuario debe tener mínimo 4 dígitos.";

        mensaje.style.color =
            "red";

        return;
    }


    // =================================================
    // LA CONTRASEÑA PUEDE QUEDAR VACÍA
    // SI QUEDA VACÍA SE CONSERVA LA ACTUAL
    // =================================================


    if (
        nuevaPassword &&
        (
            !/[A-Za-z]/.test(nuevaPassword) ||
            !/\d/.test(nuevaPassword)
        )
    ) {

        mensaje.textContent =
            "La contraseña debe contener letras y números.";

        mensaje.style.color =
            "red";

        return;
    }


    if (
        nuevaPassword &&
        nuevaPassword.length < 6
    ) {

        mensaje.textContent =
            "La contraseña debe tener mínimo 6 caracteres.";

        mensaje.style.color =
            "red";

        return;
    }


    mensaje.textContent =
        "Guardando cambios...";

    mensaje.style.color =
        "#333";


    try {

        // =================================================
        // 1. COMPROBAR SESIÓN
        // =================================================

        const session =
            await comprobarSesion();


        if (!session) {

            mensaje.textContent =
                "La sesión del administrador ha expirado.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 2. CARGAR TIENDA ACTUAL
        // =================================================

        const tiendaCorrecta =
            await cargarTiendaAdmin();


        if (!tiendaCorrecta) {

            mensaje.textContent =
                "No se pudo identificar la tienda.";

            mensaje.style.color =
                "red";

            return;
        }


        const emailActual =
            session.user.email;


        // =================================================
        // 3. BUSCAR ADMINISTRADOR ACTUAL
        // =================================================

        const {
            data: usuarioActual,
            error: usuarioActualError
        } =
        await supabaseClient
            .from("usuarios_admin")
            .select(
                "id, usuario, email, tienda_id"
            )
            .eq(
                "email",
                emailActual
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (usuarioActualError) {

            console.error(
                "Error buscando administrador:",
                usuarioActualError
            );

            mensaje.textContent =
                "Error buscando el administrador.";

            mensaje.style.color =
                "red";

            return;
        }


        if (!usuarioActual) {

            mensaje.textContent =
                "No se encontró el administrador.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 4. COMPROBAR USUARIO REPETIDO
        // SOLO EN LA TIENDA ACTUAL
        // =================================================

        const {
            data: usuarioRepetido,
            error: usuarioRepetidoError
        } =
        await supabaseClient
            .from("usuarios_admin")
            .select(
                "id, usuario, tienda_id"
            )
            .eq(
                "usuario",
                nuevoUsuario
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (usuarioRepetidoError) {

            console.error(
                "Error comprobando usuario:",
                usuarioRepetidoError
            );

            mensaje.textContent =
                "No se pudo comprobar el usuario.";

            mensaje.style.color =
                "red";

            return;
        }


        if (
            usuarioRepetido &&
            usuarioRepetido.id !== usuarioActual.id
        ) {

            mensaje.textContent =
                "Ese usuario ya está registrado en esta tienda.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 5. OBTENER CREDENCIALES ACTUALES
        // =================================================

        const {
            data: credencialesActuales,
            error: credencialesError
        } =
        await supabaseClient
            .from("credenciales_admin")
            .select(
                "id, tienda_id, usuario, contrasena"
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (credencialesError) {

            console.error(
                "Error obteniendo credenciales actuales:",
                credencialesError
            );

            mensaje.textContent =
                "No se pudieron obtener las credenciales actuales.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 6. DETERMINAR CONTRASEÑA FINAL
        // =================================================

        let passwordFinal =
            nuevaPassword;


        if (!passwordFinal) {

            if (
                credencialesActuales &&
                credencialesActuales.contrasena
            ) {

                passwordFinal =
                    credencialesActuales.contrasena;

            } else {

                mensaje.textContent =
                    "Ingresa una contraseña.";

                mensaje.style.color =
                    "red";

                return;
            }
        }


        // =================================================
        // GUARDAR VALORES ANTERIORES
        // PARA PODER REVERTIR SI FALLA AUTH
        // =================================================

        const usuarioAnterior =
            usuarioActual.usuario;

        const passwordAnterior =
            credencialesActuales
                ? credencialesActuales.contrasena
                : null;


        // =================================================
        // 7. ACTUALIZAR USUARIO EN usuarios_admin
        // =================================================

        const {
            error: usuarioUpdateError
        } =
        await supabaseClient
            .from("usuarios_admin")
            .update({

                usuario:
                    nuevoUsuario

            })
            .eq(
                "id",
                usuarioActual.id
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            );


        if (usuarioUpdateError) {

            console.error(
                "Error cambiando usuario:",
                usuarioUpdateError
            );

            mensaje.textContent =
                "No se pudo cambiar el usuario.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 8. ACTUALIZAR credenciales_admin
        // =================================================

        const {
            error: credencialesUpdateError
        } =
        await supabaseClient
            .from("credenciales_admin")
            .upsert(
                {

                    tienda_id:
                        tiendaIdAdminActual,

                    usuario:
                        nuevoUsuario,

                    contrasena:
                        passwordFinal,

                    updated_at:
                        new Date().toISOString()

                },
                {
                    onConflict:
                        "tienda_id"
                }
            );


        if (credencialesUpdateError) {

            console.error(
                "Error actualizando credenciales_admin:",
                credencialesUpdateError
            );


            // ---------------------------------------------
            // REVERTIR usuario
            // ---------------------------------------------

            await supabaseClient
                .from("usuarios_admin")
                .update({

                    usuario:
                        usuarioAnterior

                })
                .eq(
                    "id",
                    usuarioActual.id
                )
                .eq(
                    "tienda_id",
                    tiendaIdAdminActual
                );


            mensaje.textContent =
                "No se pudieron actualizar las claves del Gerente General.";

            mensaje.style.color =
                "red";

            return;
        }


        // =================================================
        // 9. CAMBIAR CONTRASEÑA EN SUPABASE AUTH
        // SOLO SI SE ESCRIBIÓ UNA NUEVA
        // =================================================

        if (nuevaPassword) {

            const {
                error: passwordError
            } =
            await supabaseClient
                .auth
                .updateUser({

                    password:
                        nuevaPassword

                });


            if (passwordError) {

                console.error(
                    "Error cambiando contraseña:",
                    passwordError
                );


                // -----------------------------------------
                // REVERTIR usuarios_admin
                // -----------------------------------------

                await supabaseClient
                    .from("usuarios_admin")
                    .update({

                        usuario:
                            usuarioAnterior

                    })
                    .eq(
                        "id",
                        usuarioActual.id
                    )
                    .eq(
                        "tienda_id",
                        tiendaIdAdminActual
                    );


                // -----------------------------------------
                // REVERTIR credenciales_admin
                // -----------------------------------------

                if (credencialesActuales) {

                    await supabaseClient
                        .from("credenciales_admin")
                        .update({

                            usuario:
                                usuarioAnterior,

                            contrasena:
                                passwordAnterior,

                            updated_at:
                                new Date().toISOString()

                        })
                        .eq(
                            "tienda_id",
                            tiendaIdAdminActual
                        );

                } else {

                    await supabaseClient
                        .from("credenciales_admin")
                        .delete()
                        .eq(
                            "tienda_id",
                            tiendaIdAdminActual
                        );
                }


                mensaje.textContent =
                    "No se pudo cambiar la contraseña. Los cambios fueron revertidos.";

                mensaje.style.color =
                    "red";

                return;
            }
        }


        // =================================================
        // 10. TODO CORRECTO
        // =================================================

        console.log(
            "✅ Credenciales actualizadas correctamente."
        );

        console.log(
            "🏪 Tienda:",
            tiendaNombreAdminActual
        );

        console.log(
            "👤 Usuario:",
            nuevoUsuario
        );


        mensaje.textContent =
            "✅ Usuario y contraseña guardados correctamente.";

        mensaje.style.color =
            "green";


        inputUsuario.value =
            nuevoUsuario;

        inputPassword.value =
            "";


        // =================================================
        // 11. MOSTRAR CONFIRMACIÓN EN CONSOLA
        // =================================================

        console.log(
            "CLAVES GERENTE GENERAL ACTUALIZADAS:",
            {
                tienda_id:
                    tiendaIdAdminActual,

                usuario:
                    nuevoUsuario,

                contrasena:
                    passwordFinal
            }
        );

    }

    catch(error) {

        console.error(
            "ERROR GENERAL GUARDANDO USUARIO:",
            error
        );

        mensaje.textContent =
            "Ocurrió un error: " +
            (
                error.message ||
                "Error desconocido"
            );

        mensaje.style.color =
            "red";
    }
}


// =====================================================
// PUBLICAR PRODUCTO EN SUPABASE
// =====================================================

async function publicarProducto() {

    const nombre =
        document
            .getElementById(
                "nombreProducto"
            )
            .value
            .trim();


    const archivo =
        document
            .getElementById(
                "imagenProducto"
            )
            .files[0];


    const color =
        document
            .getElementById(
                "colorProducto"
            )
            .value
            .trim();


    const talla =
        document
            .getElementById(
                "tallaProducto"
            )
            .value
            .trim();


    const precio =
        document
            .getElementById(
                "precioProducto"
            )
            .value;


    const mensaje =
        document
            .getElementById(
                "mensaje"
            );


    if (
        !nombre ||
        !archivo ||
        !color ||
        !talla ||
        !precio
    ) {

        if (mensaje) {

            mensaje.textContent =
                "Completa todos los campos.";

            mensaje.style.color =
                "red";
        }

        return;
    }


    if (!tiendaIdAdminActual) {

        if (mensaje) {

            mensaje.textContent =
                "No se identificó la tienda.";

            mensaje.style.color =
                "red";
        }

        return;
    }


    if (mensaje) {

        mensaje.textContent =
            "Publicando producto...";

        mensaje.style.color =
            "#333";
    }


    try {

        const imagen =
            await convertirImagenBase64(
                archivo
            );


        const {
            data,
            error
        } =
        await supabaseClient
            .from("productos")
            .insert({

                nombre:
                    nombre,

                imagen:
                    imagen,

                color:
                    color,

                talla:
                    talla,

                precio:
                    Number(precio),

                activo:
                    true,

                tienda_id:
                    tiendaIdAdminActual

            })
            .select();


        if (error) {

            console.error(
                "Error Supabase:",
                error
            );

            if (mensaje) {

                mensaje.textContent =
                    "Error al publicar: " +
                    error.message;

                mensaje.style.color =
                    "red";
            }

            return;
        }


        console.log(
            "Producto guardado:",
            data
        );


        if (mensaje) {

            mensaje.textContent =
                "Producto publicado correctamente.";

            mensaje.style.color =
                "green";
        }


        limpiarFormulario();

        cargarProductos();

    }

    catch(error) {

        console.error(
            "Error publicando producto:",
            error
        );

        if (mensaje) {

            mensaje.textContent =
                "Ocurrió un error al publicar.";

            mensaje.style.color =
                "red";
        }
    }
}


// =====================================================
// CONVERTIR IMAGEN A BASE64
// =====================================================

function convertirImagenBase64(archivo) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const lector =
                new FileReader();


            lector.onload =
                () => {

                    resolve(
                        lector.result
                    );

                };


            lector.onerror =
                reject;


            lector.readAsDataURL(
                archivo
            );

        }
    );
}


// =====================================================
// CARGAR PRODUCTOS DESDE SUPABASE
// =====================================================

async function cargarProductos() {

    const contenedor =
        document.getElementById(
            "listaProductos"
        );


    if (!contenedor) {

        return;
    }


    contenedor.innerHTML =
        "<p>Cargando productos...</p>";


    if (!tiendaIdAdminActual) {

        const tiendaCorrecta =
            await cargarTiendaAdmin();


        if (!tiendaCorrecta) {

            contenedor.innerHTML =
                "<p>No se pudo identificar la tienda.</p>";

            return;
        }
    }


    try {

        const {
            data,
            error
        } =
        await supabaseClient
            .from("productos")
            .select("*")
            .eq(
                "activo",
                true
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .order(
                "creado_en",
                {
                    ascending:
                        false
                }
            );


        if (error) {

            console.error(
                "Error cargando productos:",
                error
            );

            contenedor.innerHTML =
                "<p>Error al cargar productos.</p>";

            return;
        }


        contenedor.innerHTML =
            "";


        if (
            !data ||
            data.length === 0
        ) {

            contenedor.innerHTML =
                "<p>Todavía no hay productos publicados.</p>";

            return;
        }


        data.forEach(
            producto => {

                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.className =
                    "producto";


                tarjeta.innerHTML = `

                    <img
                        src="${producto.imagen || ""}"
                        alt="${escapeHTML(
                            producto.nombre || ""
                        )}"
                    >

                    <div class="producto-info">

                        <h3>
                            ${escapeHTML(
                                producto.nombre || ""
                            )}
                        </h3>

                        <p>
                            Precio: S/ ${
                                producto.precio || "0.00"
                            }
                        </p>

                        <p>
                            Color:
                            ${
                                escapeHTML(
                                    producto.color || ""
                                )
                            }
                        </p>

                        <p>
                            Talla:
                            ${
                                escapeHTML(
                                    producto.talla || ""
                                )
                            }
                        </p>

                        <div class="acciones">

                            <button
                                class="editar"
                                onclick="editarProducto(
                                    '${producto.id}'
                                )"
                            >
                                EDITAR
                            </button>

                            <button
                                class="eliminar"
                                onclick="eliminarProducto(
                                    '${producto.id}'
                                )"
                            >
                                ELIMINAR
                            </button>

                        </div>

                    </div>
                `;


                contenedor.appendChild(
                    tarjeta
                );

            }
        );

    }

    catch(error) {

        console.error(
            "Error inesperado cargando productos:",
            error
        );

        contenedor.innerHTML =
            "<p>Error inesperado.</p>";
    }
}


// =====================================================
// EDITAR PRODUCTO
// =====================================================

async function editarProducto(id) {

    if (!tiendaIdAdminActual) {

        alert(
            "No se identificó la tienda."
        );

        return;
    }


    try {

        const {
            data: producto,
            error
        } =
        await supabaseClient
            .from("productos")
            .select("*")
            .eq(
                "id",
                id
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            )
            .maybeSingle();


        if (
            error ||
            !producto
        ) {

            alert(
                "No se encontró el producto."
            );

            return;
        }


        document
            .getElementById(
                "nombreProducto"
            )
            .value =
                producto.nombre || "";


        document
            .getElementById(
                "colorProducto"
            )
            .value =
                producto.color || "";


        document
            .getElementById(
                "tallaProducto"
            )
            .value =
                producto.talla || "";


        document
            .getElementById(
                "precioProducto"
            )
            .value =
                producto.precio || "";


        document
            .getElementById(
                "nombreProducto"
            )
            .dataset.editando =
                id;


        abrirVentana(
            "ventanaSubir"
        );

    }

    catch(error) {

        console.error(
            "Error editando producto:",
            error
        );
    }
}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

async function eliminarProducto(id) {

    const confirmar =
        confirm(
            "¿Quieres eliminar este producto?"
        );


    if (!confirmar) {

        return;
    }


    if (!tiendaIdAdminActual) {

        alert(
            "No se identificó la tienda."
        );

        return;
    }


    try {

        const {
            error
        } =
        await supabaseClient
            .from("productos")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "tienda_id",
                tiendaIdAdminActual
            );


        if (error) {

            console.error(
                "Error eliminando producto:",
                error
            );

            alert(
                "No se pudo eliminar el producto."
            );

            return;
        }


        alert(
            "Producto eliminado correctamente."
        );


        cargarProductos();

    }

    catch(error) {

        console.error(
            "Error eliminando producto:",
            error
        );
    }
}


// =====================================================
// LIMPIAR FORMULARIO
// =====================================================

function limpiarFormulario() {

    const nombre =
        document.getElementById(
            "nombreProducto"
        );

    const imagen =
        document.getElementById(
            "imagenProducto"
        );

    const color =
        document.getElementById(
            "colorProducto"
        );

    const talla =
        document.getElementById(
            "tallaProducto"
        );

    const precio =
        document.getElementById(
            "precioProducto"
        );


    if (nombre) {

        nombre.value =
            "";

        nombre.dataset.editando =
            "";
    }


    if (imagen) {

        imagen.value =
            "";
    }


    if (color) {

        color.value =
            "";
    }


    if (talla) {

        talla.value =
            "";
    }


    if (precio) {

        precio.value =
            "";
    }
}


// =====================================================
// SEGURIDAD HTML
// =====================================================

function escapeHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;
}


// =====================================================
// INICIAR ADMIN
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        const esAdmin =
            document.getElementById(
                "listaProductos"
            );


        if (esAdmin) {

            const protegido =
                await protegerAdmin();


            if (!protegido) {

                return;
            }


            cargarProductos();
        }

    }
);