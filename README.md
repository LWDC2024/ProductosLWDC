# Sistema de Gestión de Inventario

Este es un sistema de gestión de inventario interactivo con una base de datos integrada.

## Requisitos

- Node.js
- npm

## Instalación

1. Clona este repositorio:


1. Verificación de la estructura del proyecto:
Asegúrate de que tu estructura de proyecto sea exactamente así:

```plaintext
inventory-management/
├── views/
│   └── index.ejs
├── public/
│   └── styles.css
├── database.js
├── server.js
└── package.json
```


2. Contenido del archivo server.js:
Asegúrate de que tu archivo `server.js` tenga el siguiente contenido:


```javascript
const express = require("express");
const path = require("path");
const db = require("./database.js");

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// GET /
app.get("/", (req, res) => {
    const sql = "SELECT * FROM product";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.render('index', { products: rows });
    });
});

// POST /product
app.post("/product", (req, res) => {
    const { name, price, image } = req.body;
    const sql = 'INSERT INTO product (name, price, image) VALUES (?,?,?)';
    db.run(sql, [name, price, image], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID },
            "id" : this.lastID
        });
    });
});

// PUT /product/:id
app.put("/product/:id", (req, res) => {
    const { name, price, image } = req.body;
    const sql = 'UPDATE product SET name = ?, price = ?, image = ? WHERE id = ?';
    db.run(sql, [name, price, image, req.params.id], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            message: "success",
            data: { id: req.params.id, name, price, image },
            changes: this.changes
        });
    });
});

// DELETE /product/:id
app.delete("/product/:id", (req, res) => {
    const sql = 'DELETE FROM product WHERE id = ?';
    db.run(sql, req.params.id, function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"deleted", changes: this.changes});
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
```

3. Contenido del archivo index.ejs:
Asegúrate de que tu archivo `views/index.ejs` tenga el siguiente contenido:


```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Inventario</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="card">
        <h1>Gestión de Inventario</h1>
        <div class="controls">
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" id="search" placeholder="Buscar por nombre o ID">
            </div>
            <button id="addProductBtn">Agregar Producto</button>
        </div>
        <div style="overflow-x: auto;">
            <table id="productTable">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <% products.forEach(function(product) { %>
                        <tr>
                            <td><img src="<%= product.image %>" alt="<%= product.name %>" class="product-image"></td>
                            <td><%= product.id %></td>
                            <td><%= product.name %></td>
                            <td><%= product.price %></td>
                            <td>
                                <button class="edit-btn" data-id="<%= product.id %>">Editar</button>
                                <button class="delete-btn" data-id="<%= product.id %>">Eliminar</button>
                            </td>
                        </tr>
                    <% }); %>
                </tbody>
            </table>
        </div>
        <div class="pagination">
            <span id="pageInfo">Mostrando 0 - 0 de 0</span>
            <div>
                <button id="prevPage">Anterior</button>
                <button id="nextPage">Siguiente</button>
            </div>
        </div>
    </div>

    <div id="productModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2 id="modalTitle">Agregar Producto</h2>
            <form id="productForm">
                <input type="hidden" id="productId">
                <label for="productName">Nombre:</label>
                <input type="text" id="productName" required>
                <label for="productPrice">Precio:</label>
                <input type="text" id="productPrice" required>
                <label for="productImage">URL de la imagen:</label>
                <input type="text" id="productImage" required>
                <button type="submit">Guardar</button>
            </form>
        </div>
    </div>

    <script>
        let currentPage = 1;
        const itemsPerPage = 10;
        let allProducts = <%- JSON.stringify(products) %>;
        let filteredProducts = [...allProducts];

        function renderTable() {
            const tableBody = document.querySelector('#productTable tbody');
            tableBody.innerHTML = '';
            
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedProducts = filteredProducts.slice(start, end);

            paginatedProducts.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${product.image}" alt="${product.name}" class="product-image"></td>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.price}</td>
                    <td>
                        <button class="edit-btn" data-id="${product.id}">Editar</button>
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            updatePagination();
        }

        function updatePagination() {
            const pageInfo = document.getElementById('pageInfo');
            const start = (currentPage - 1) * itemsPerPage + 1;
            const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
            pageInfo.textContent = `Mostrando ${start} - ${end} de ${filteredProducts.length}`;

            document.getElementById('prevPage').disabled = currentPage === 1;
            document.getElementById('nextPage').disabled = end >= filteredProducts.length;
        }

        document.getElementById('search').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.id.toString().includes(searchTerm)
            );
            currentPage = 1;
            renderTable();
        });

        document.getElementById('prevPage').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });

        document.getElementById('nextPage').addEventListener('click', function() {
            if (currentPage * itemsPerPage < filteredProducts.length) {
                currentPage++;
                renderTable();
            }
        });

        // Modal functionality
        const modal = document.getElementById('productModal');
        const addProductBtn = document.getElementById('addProductBtn');
        const closeBtn = document.getElementsByClassName('close')[0];
        const productForm = document.getElementById('productForm');

        addProductBtn.onclick = function() {
            document.getElementById('modalTitle').textContent = 'Agregar Producto';
            document.getElementById('productId').value = '';
            document.getElementById('productName').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productImage').value = '';
            modal.style.display = 'block';
        }

        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }

        productForm.onsubmit = function(e) {
            e.preventDefault();
            const id = document.getElementById('productId').value;
            const name = document.getElementById('productName').value;
            const price = document.getElementById('productPrice').value;
            const image = document.getElementById('productImage').value;

            if (id) {
                // Update existing product
                fetch(`/product/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, price, image }),
                })
                .then(response => response.json())
                .then(data => {
                    const index = allProducts.findIndex(p => p.id == id);
                    allProducts[index] = { id, name, price, image };
                    filteredProducts = [...allProducts];
                    renderTable();
                    modal.style.display = 'none';
                });
            } else {
                // Add new product
                fetch('/product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, price, image }),
                })
                .then(response => response.json())
                .then(data => {
                    allProducts.push({ id: data.id, name, price, image });
                    filteredProducts = [...allProducts];
                    renderTable();
                    modal.style.display = 'none';
                });
            }
        }

        // Edit and Delete functionality
        document.getElementById('productTable').addEventListener('click', function(e) {
            if (e.target.classList.contains('edit-btn')) {
                const id = e.target.getAttribute('data-id');
                const product = allProducts.find(p => p.id == id);
                document.getElementById('modalTitle').textContent = 'Editar Producto';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productImage').value = product.image;
                modal.style.display = 'block';
            } else if (e.target.classList.contains('delete-btn')) {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    fetch(`/product/${id}`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        allProducts = allProducts.filter(p => p.id != id);
                        filteredProducts = [...allProducts];
                        renderTable();
                    });
                }
            }
        });

        // Initialize the table
        renderTable();
    </script>
</body>
</html>
```

4. Instalación de dependencias:
Asegúrate de haber instalado todas las dependencias necesarias. Ejecuta el siguiente comando en la terminal, en el directorio de tu proyecto:

```plaintext
npm install express ejs sqlite3
```


5. Permisos de carpeta:
Asegúrate de que tienes permisos de lectura y escritura en la carpeta del proyecto y sus subcarpetas.
6. Reinicio del servidor:
Después de hacer estos cambios, detén tu servidor (si está en ejecución) presionando Ctrl+C en la terminal, y luego vuelve a iniciarlo con:

```plaintext
node server.js
```


7. Verificación de la ruta:
Asegúrate de que estás accediendo a la aplicación a través de `http://localhost:3000` en tu navegador.


Si después de seguir todos estos pasos aún tienes problemas, es posible que haya un problema con la instalación de Node.js o con la configuración de tu sistema. En ese caso, podrías intentar lo siguiente:

1. Desinstala Node.js completamente de tu sistema.
2. Descarga e instala la última versión LTS de Node.js desde el sitio oficial.
3. Borra la carpeta `node_modules` de tu proyecto.
4. Ejecuta `npm install` nuevamente en la carpeta de tu proyecto.


Si el problema persiste después de intentar todo esto, por favor, proporciona más detalles sobre tu entorno de desarrollo (versión de Node.js, sistema operativo, etc.) y cualquier mensaje de error adicional que puedas ver en la consola.