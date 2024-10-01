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
    const { id, name, price, image, category, sub_category, pagination } = req.body;
    const sql = 'INSERT INTO product (id, name, price, image, category, sub_category, pagination) VALUES (?,?,?,?,?,?,?)';
    db.run(sql, [id, name, price, image, category, sub_category, pagination], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": { id: id },
            "id" : id
        });
    });
});

// PUT /product/:id
app.put("/product/:id", (req, res) => {
    const { name, price, image, category, sub_category, pagination } = req.body;
    const sql = 'UPDATE product SET name = ?, price = ?, image = ?, category = ?, sub_category = ?, pagination = ? WHERE id = ?';
    db.run(sql, [name, price, image, category, sub_category, pagination, req.params.id], function (err) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            message: "success",
            data: { id: req.params.id, name, price, image, category, sub_category, pagination },
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