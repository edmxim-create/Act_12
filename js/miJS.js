
class Anuncio {
    constructor(id, tipo, titulo, cantidad, fabrica, estado = "pendiente") {
        this.id = id;
        this.tipo = tipo;             
        this.titulo = titulo;        
        this.cantidad = cantidad;     
        this.fabrica = fabrica;       
        this.estado = estado;         
    }

    aprobar() {
        this.estado = "aprobado";
    }

    rechazar() {
        this.estado = "rechazado";
    }
}


const datosIniciales = [
    new Anuncio(1, "Oferta", "50kg de algodón sobrante", "50 kg", "Textiles del Bajío S.A.", "aprobado"),
    new Anuncio(2, "Solicitud", "Necesito hilos de poliéster", "100 conos", "Calzado y Confección León", "aprobado"),
    new Anuncio(3, "Oferta", "800 kg de lámina de acero calibre 18", "800 kg", "Metalmecánica del Bajío S.A.", "pendiente")
];

// Selectores del dom

const formLogin = document.getElementById("formLogin");
const loginRol = document.getElementById("loginRol");
const loginFabrica = document.getElementById("loginFabrica");
const campoFabrica = document.getElementById("campoFabrica");

const seccionLogin = document.getElementById("seccionLogin");
const seccionFabrica = document.getElementById("seccionFabrica");
const seccionAdmin = document.getElementById("seccionAdmin");

const barraUsuario = document.getElementById("barraUsuario");
const txtUsuario = document.getElementById("txtUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const formAnuncio = document.getElementById("formAnuncio");
const listaOtrasFabricas = document.getElementById("listaOtrasFabricas");
const listaMisAnuncios = document.getElementById("listaMisAnuncios");
const listaAdmin = document.getElementById("listaAdmin");
const totalAnunciosAdmin = document.getElementById("totalAnunciosAdmin");


function obtenerAnuncios() {
    const datos = localStorage.getItem("anunciosMercado");
    if (!datos) {
        localStorage.setItem("anunciosMercado", JSON.stringify(datosIniciales));
        return datosIniciales;
    }
    return JSON.parse(datos);
}

function guardarAnuncios(lista) {
    localStorage.setItem("anunciosMercado", JSON.stringify(lista));
}

loginRol.addEventListener("change", () => {
    if (loginRol.value === "admin") {
        campoFabrica.classList.add("d-none");
    } else {
        campoFabrica.classList.remove("d-none");
    }
});


formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const rol = loginRol.value;
    const nombreFabrica = rol === "admin" ? "Administrador de Red" : (loginFabrica.value.trim() || "Fábrica Miembro");

    // Guardar sesión en sessionStorage
    const sesion = { rol, fabrica: nombreFabrica };
    sessionStorage.setItem("sesionMercado", JSON.stringify(sesion));

    formLogin.reset();
    validarAcceso();
});

// Botones de acceso rápido
function accesoRapido(rol, nombreFabrica) {
    const sesion = { rol, fabrica: nombreFabrica };
    sessionStorage.setItem("sesionMercado", JSON.stringify(sesion));
    validarAcceso();
}

// Cerrar sesión
btnCerrarSesion.addEventListener("click", () => {
    sessionStorage.removeItem("sesionMercado");
    validarAcceso();
});

// Validación de acceso 
function validarAcceso() {
    const sesion = JSON.parse(sessionStorage.getItem("sesionMercado"));

    if (!sesion) {
        // No hay sesión activa
        seccionLogin.classList.remove("d-none");
        seccionFabrica.classList.add("d-none");
        seccionAdmin.classList.add("d-none");
        barraUsuario.classList.add("d-none");
        return;
    }

    // Hay sesión activa: mostrar barra superior con info del usuario
    seccionLogin.classList.add("d-none");
    barraUsuario.classList.remove("d-none");
    txtUsuario.textContent = `👤 ${sesion.fabrica} (${sesion.rol === "admin" ? "Administrador" : "Fábrica"})`;

    if (sesion.rol === "admin") {
        seccionFabrica.classList.add("d-none");
        seccionAdmin.classList.remove("d-none");
        mostrarAdmin();
    } else {
        seccionAdmin.classList.add("d-none");
        seccionFabrica.classList.remove("d-none");
        mostrarPanelFabrica();
    }
}

formAnuncio.addEventListener("submit", (e) => {
    e.preventDefault();
    const sesion = JSON.parse(sessionStorage.getItem("sesionMercado"));
    if (!sesion) return alert("No hay sesión activa.");

    const tipo = document.getElementById("tipoAnuncio").value;
    const titulo = document.getElementById("tituloAnuncio").value.trim();
    const cantidad = document.getElementById("cantidadAnuncio").value.trim();

   
    const nuevo = new Anuncio(Date.now(), tipo, titulo, cantidad, sesion.fabrica, "pendiente");

    const anuncios = obtenerAnuncios();
    anuncios.unshift(nuevo);
    guardarAnuncios(anuncios);

    formAnuncio.reset();
    alert("¡Anuncio publicado con éxito! Queda con estado 'pendiente' hasta que el Administrador lo apruebe.");
    mostrarPanelFabrica();
});

function mostrarPanelFabrica() {
    const sesion = JSON.parse(sessionStorage.getItem("sesionMercado"));
    if (!sesion) return;

    const anuncios = obtenerAnuncios();

    const deOtras = anuncios.filter(a => a.estado === "aprobado" && a.fabrica !== sesion.fabrica);
    listaOtrasFabricas.innerHTML = "";

    if (deOtras.length === 0) {
        listaOtrasFabricas.innerHTML = "<div class='alert alert-secondary'>No hay anuncios aprobados de otras fábricas por el momento.</div>";
    } else {
        deOtras.forEach(a => {
            const badgeColor = a.tipo === "Oferta" ? "bg-success" : "bg-primary";
            listaOtrasFabricas.innerHTML += `
              <div class="card mb-2 shadow-sm border-0">
                <div class="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge ${badgeColor} me-1">${a.tipo}</span>
                    <h5 class="d-inline fw-bold">${a.titulo}</h5>
                    <p class="mb-0 text-muted small">
                      <strong>Fábrica:</strong> ${a.fabrica} | 
                      <strong>Cantidad:</strong> ${a.cantidad}
                    </p>
                  </div>
                  <button class="btn btn-sm btn-outline-success" onclick="alert('Interés registrado para contactar a ${a.fabrica}')">Intercambiar 🔄</button>
                </div>
              </div>
            `;
        });
    }

    const misAnuncios = anuncios.filter(a => a.fabrica === sesion.fabrica);
    listaMisAnuncios.innerHTML = "";

    if (misAnuncios.length === 0) {
        listaMisAnuncios.innerHTML = "<p class='text-muted mb-0'>Aún no has publicado ningún anuncio.</p>";
    } else {
        misAnuncios.forEach(a => {
            let badgeEstado = "bg-warning text-dark";
            if (a.estado === "aprobado") badgeEstado = "bg-success";
            if (a.estado === "rechazado") badgeEstado = "bg-danger";

            listaMisAnuncios.innerHTML += `
              <div class="d-flex justify-content-between border-bottom py-2">
                <span><strong>${a.tipo}:</strong> ${a.titulo} (${a.cantidad})</span>
                <span class="badge ${badgeEstado}">${a.estado}</span>
              </div>
            `;
        });
    }
}


function mostrarAdmin() {
    const anuncios = obtenerAnuncios();
    totalAnunciosAdmin.textContent = `${anuncios.length} anuncios`;
    listaAdmin.innerHTML = "";

    if (anuncios.length === 0) {
        listaAdmin.innerHTML = "<p class='text-muted'>No hay anuncios en la red.</p>";
        return;
    }

    anuncios.forEach(a => {
        const badgeColor = a.tipo === "Oferta" ? "bg-success" : "bg-primary";
        let badgeEstado = "bg-warning text-dark";
        if (a.estado === "aprobado") badgeEstado = "bg-success";
        if (a.estado === "rechazado") badgeEstado = "bg-danger";

        listaAdmin.innerHTML += `
          <div class="card mb-2 shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span class="badge ${badgeColor}">${a.tipo}</span>
                <h5 class="d-inline fw-bold ms-1">${a.titulo}</h5>
                <p class="mb-0 text-muted small">
                  <strong>Fábrica:</strong> ${a.fabrica} | 
                  <strong>Cantidad:</strong> ${a.cantidad} | 
                  <strong>Estado:</strong> <span class="badge ${badgeEstado}">${a.estado}</span>
                </p>
              </div>
              <div>
                <button class="btn btn-sm btn-success me-1" onclick="cambiarEstado(${a.id}, 'aprobado')">Aprobar ✅</button>
                <button class="btn btn-sm btn-danger" onclick="cambiarEstado(${a.id}, 'rechazado')">Rechazar ❌</button>
              </div>
            </div>
          </div>
        `;
    });
}


function cambiarEstado(id, nuevoEstado) {
    const anuncios = obtenerAnuncios();

   
    const actualizados = anuncios.map(item => {
        if (item.id === id) {
            const obj = new Anuncio(item.id, item.tipo, item.titulo, item.cantidad, item.fabrica, item.estado);
            if (nuevoEstado === "aprobado") {
                obj.aprobar();
            } else if (nuevoEstado === "rechazado") {
                obj.rechazar();
            }
            return obj;
        }
        return item;
    });

    guardarAnuncios(actualizados);
    mostrarAdmin();
}


document.addEventListener("DOMContentLoaded", () => {
    validarAcceso();
});
