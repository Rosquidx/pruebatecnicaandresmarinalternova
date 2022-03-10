const producto_stock = document.getElementById("products");
const carritoCompras = document.getElementById("carritoCompras");
const comprar = document.getElementById("comprar");
const precio_total = document.getElementById("precio_total");
const factura = document.getElementById("carritoCompras3");
const total_pagar_factura = document.getElementById("total_pagar_factura");
const jsonHTML = document.getElementById("jsonHTML");

let carrito = {};

window.addEventListener("DOMContentLoaded", () => {
    consultaFetch();
    consultaStock();
});

const consultaFetch = async() => {
    try {
        const respuesta = await fetch("../db/db.json");
        const datos = await respuesta.json();
        listarProductos(datos);
    } catch (error) {
        console.log(error);
    }
};

const consultaStock = async(number) => {
    try {
        const respuesta = await fetch("../db/db.json");
        const datos = await respuesta.json();
        return datos.products[number];
    } catch (error) {
        console.log(error);
    }
};

const listarProductos = ({ products }) => {
        let contador = 0;
        products.forEach((producto) => {
                    let validacionBtn = producto.stock != 0;

                    producto_stock.innerHTML += `
  <div class="card mx-3 mt-3" style="width: 15rem" data-number=${(contador += 1)}>
              <img
                class="card-img-top"
                src="img/papitas.jfif"
                alt="Card image cap"
                class="img-card-producto"
              />
              <div class="card-body">
                <h5 id="name"class="text-center font-weight-bold text-uppercase">
                  ${producto.name}
                </h5>
                <p class="text-center text-danger">
                  <span id="unit_price" class="font-weight-bold">${
                    producto.unit_price
                  }</span>
                </p>
                <input type="number" name="cantidad" id="cantidad" class="w-100 text-center" placeholder="Ingrese la cantidad"/>
                <hr/>
                <p>Deliciosa y rica <span class="font-weigth-bold text-danger">${
                  producto.name
                }</span> para que disfrutes con las personas que te rodean, a un precio muy economico.</p>
                <p>Disponibles: <span class="text-danger">${
                  producto.stock
                }</span></p>
                ${
                  validacionBtn
                    ? `<button id="btn-add" class="btn btn-agregar btn-dark ml-auto">
                Añadir al carrito
              </button>`
                    : `<p class="text-danger">No hay productos en el momento, revisa más tarde, por favor.</p>`
                }
              </div>
            </div>`;
  });
};

producto_stock.addEventListener("click", (e) => {
  añadirCarrito(e);
});

const añadirCarrito = (e) => {
  const { target } = e;
  console.log(target);
  if (target.classList.contains("btn-agregar")) {
    actuCarrito(target.parentElement);
  }
  e.stopPropagation();
};

const actuCarrito = async (produc) => {
  const stock = produc.parentElement.dataset.number;
  let stockk = await consultaStock(stock - 1);

  if (
    produc.querySelector("#cantidad").value.trim() === "" ||
    produc.querySelector("#cantidad").value <= 0
  ) {
    swal(
      "Error",
      `Recuerda llenar el campo cantidad, por favor y/o recuerda solo valores positivos y diferentes de cero.`,
      "warning"
    );
    return;
  }

  if (produc.querySelector("#cantidad").value > stockk.stock) {
    swal(
      "Lo siento",
      `El producto ${produc.querySelector("#name").textContent} solo tiene ${
        stockk.stock
      } en stock, debes de retirar menos!`,
      "warning"
    );
    return;
  }

  const cantidadActualizada = produc.querySelector("#cantidad").value;
  const productoaEnviar = {
    name: produc.querySelector("#name").textContent,
    unit_price: produc.querySelector("#unit_price").textContent,
    cantidad: cantidadActualizada,
  };
  if (carrito.hasOwnProperty(productoaEnviar.name)) {
    productoaEnviar.cantidad = cantidadActualizada;
  }
  carrito[productoaEnviar.name] = { ...productoaEnviar };
  listarCarrito(productoaEnviar.unit_price);
  swal(
    "Buen trabajo!",
    `Se ha agregado el producto ${productoaEnviar.name}!`,
    "success"
  );
};

const listarCarrito = async (unit_price) => {
  carritoCompras.innerHTML = "";
  Object.values(carrito).forEach((product) => {
    carritoCompras.innerHTML += `
      <tr>
        <td>${product.name}</td>
        <td>${product.cantidad}</td>
        <td>${product.unit_price}</td>
        <td>${product.unit_price * product.cantidad}</td>
      </tr>
        `;
  });
  precioTotal(unit_price);
};

const precioTotal = (precioo) => {
  const cantidad = Object.values(carrito).reduce(
    (acc, { cantidad, unit_price }) => acc + cantidad * unit_price,
    0
  );
  console.log(precioo);
  console.log(cantidad);
  precio_total.innerHTML = `
  <h5 class="text-danger" id="precio_total"><span class="font-weigth-bold">Total </span>$${cantidad}</h5>
`;
};

comprar.addEventListener("click", (e) => {
  e.preventDefault();
  if (Object.keys(carrito).length === 0) {
    swal(
      "No tienes productos agregados",
      `Agregar nuevos productos para poder comprar!`,
      "warning"
    );
  } else {
    const json = {
      products: [],
    };

    Object.values(carrito).forEach((product) => {
      json.products = [...json.products, product.name];
      json.preciototal = precio_total.textContent;
      json.cantidadproductos = product.cantidad;
      factura.innerHTML += `
        <tr>
          <td>${product.name}</td>
          <td>${product.cantidad}</td>
          <td>${product.unit_price}</td>
          <td>${product.unit_price * product.cantidad}</td>
        </tr>
          `;
    });
    precio_total.innerHTML = "";
    carrito = {};
    carritoCompras.innerHTML = "";
    console.log(json);
    jsonHTML.innerHTML = `<pre><code>${JSON.stringify(json)}</code></pre>`;

    swal("Buen trabajo!", `Tu pedido está en proceso...!`, "success");
  }
});