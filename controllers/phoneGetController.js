const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

exports.createPhone = async (req, res) => {
    try {
        const { phone, status } = req.body;
        if (!phone) {
            console.log('Phone is required');
            return res.status(400).send('Phone is required');
        }

        // Kiểm tra nếu số điện thoại đã tồn tại
        const checkQuery = 'SELECT COUNT(*) AS count FROM phones WHERE phone = ?';
        pool.query(checkQuery, [phone], (err, results) => {
            if (err) {
                console.log(`Error checking phone: ${err.message}`);
                return res.status(500).send(`Error checking phone: ${err.message}`);
            }

            if (results[0].count > 0) {
                console.log('Phone already exists');
                return res.status(400).send('Phone already exists');
            }

            // Nếu số điện thoại chưa tồn tại, thêm mới vào cơ sở dữ liệu
            const query = 'INSERT INTO phones (phone, status) VALUES (?, ?)';
            pool.query(query, [phone, status || null], (err, results) => {
                if (err) {
                    console.log(`Error creating phone: ${err.message}`);
                    return res.status(500).send(`Error creating phone: ${err.message}`);
                }
                console.log(`Phone added with ID: ${results.insertId}`);
                res.status(201).send(`Phone added with ID: ${results.insertId}`);
            });
        });
    } catch (err) {
        console.log(`Error creating phone: ${err.message}`);
        res.status(500).send(`Error creating phone: ${err.message}`);
    }
};

exports.uploadPhones = async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).send('No file uploaded');
        }

        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        const data = await fs.readFile(filePath, 'utf8');
        const phones = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const validPhones = phones.filter(phone => phone.startsWith('8459'));
        const query = 'INSERT INTO phones (phone, status) VALUES (?, ?)';

        let addedPhonesCount = 0;

        for (const phone of validPhones) {
            try {
                // Kiểm tra nếu số điện thoại đã tồn tại
                const checkQuery = 'SELECT COUNT(*) AS count FROM phones WHERE phone = ?';
                const phoneExists = await new Promise((resolve, reject) => {
                    pool.query(checkQuery, [phone], (err, results) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(results[0].count > 0);
                    });
                });

                if (!phoneExists) {
                    await new Promise((resolve, reject) => {
                        pool.query(query, [phone, null], (err) => {
                            if (err) {
                                return reject(err);
                            }
                            addedPhonesCount++;
                            resolve();
                        });
                    });
                } else {
                    console.log(`Phone ${phone} already exists, skipping.`);
                }
            } catch (err) {
                console.error(`Error inserting phone ${phone}: ${err.message}`);
            }
        }

        console.log(`${addedPhonesCount} phone numbers added successfully`);
        res.status(200).send(`${addedPhonesCount} phone numbers added successfully`);
    } catch (err) {
        console.log(`Error processing file: ${err.message}`);
        res.status(500).send(`Error processing file: ${err.message}`);
    }
};

exports.getPhones = async (req, res) => {
    try {
        const query = 'SELECT * FROM phones';
        pool.query(query, (err, results) => {
            if (err) {
                console.log(`Error retrieving phones: ${err.message}`);
                return res.status(500).send(`Error retrieving phones: ${err.message}`);
            }
            console.log('Phones retrieved successfully');
            res.status(200).json(results);
        });
    } catch (err) {
        console.log(`Error retrieving phones: ${err.message}`);
        res.status(500).send(`Error retrieving phones: ${err.message}`);
    }
};

exports.getPhoneById = async (req, res) => {
    try {
        const query = 'SELECT * FROM phones WHERE id = ?';
        pool.query(query, [req.params.id], (err, results) => {
            if (err) {
                console.log(`Error retrieving phone: ${err.message}`);
                return res.status(500).send(`Error retrieving phone: ${err.message}`);
            }
            if (results.length === 0) {
                console.log('Phone not found');
                return res.status(404).send('Phone not found');
            }
            console.log(`Phone retrieved successfully with ID: ${req.params.id}`);
            res.status(200).json(results[0]);
        });
    } catch (err) {
        console.log(`Error retrieving phone: ${err.message}`);
        res.status(500).send(`Error retrieving phone: ${err.message}`);
    }
};

exports.deletePhone = async (req, res) => {
    try {
        const query = 'DELETE FROM phones WHERE id = ?';
        pool.query(query, [req.params.id], (err, results) => {
            if (err) {
                console.log(`Error deleting phone: ${err.message}`);
                return res.status(500).send(`Error deleting phone: ${err.message}`);
            }
            if (results.affectedRows === 0) {
                console.log('Phone not found');
                return res.status(404).send('Phone not found');
            }
            console.log(`Phone deleted successfully with ID: ${req.params.id}`);
            res.status(200).send('Phone deleted successfully');
        });
    } catch (err) {
        console.log(`Error deleting phone: ${err.message}`);
        res.status(500).send(`Error deleting phone: ${err.message}`);
    }
};

exports.getRandomPhone = async (req, res) => {
    try {
        const connection = await pool.getConnection((err, connection) => {
            if (err) {
                console.log(`Error getting connection: ${err.message}`);
                return res.status(500).send(`Error getting connection: ${err.message}`);
            }
            return connection;
        });

        await connection.beginTransaction();

        const queryCount = 'SELECT COUNT(*) AS count FROM phones WHERE is_taken = FALSE';
        const resultsCount = await new Promise((resolve, reject) => {
            connection.query(queryCount, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });

        const count = resultsCount[0].count;
        if (count === 0) {
            await connection.rollback();
            connection.release();
            console.log('No available phones found');
            return res.status(404).send('No available phones found');
        }

        const randomIndex = Math.floor(Math.random() * count);
        const queryRandom = 'SELECT * FROM phones WHERE is_taken = FALSE LIMIT 1 OFFSET ?';
        const resultsRandom = await new Promise((resolve, reject) => {
            connection.query(queryRandom, [randomIndex], (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });

        const phone = resultsRandom[0];
        const queryUpdate = 'UPDATE phones SET is_taken = TRUE WHERE id = ?';
        await new Promise((resolve, reject) => {
            connection.query(queryUpdate, [phone.id], (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        await connection.commit();
        connection.release();
        console.log(`Random phone retrieved successfully with ID: ${phone.id}`);
        res.status(200).json(phone);
    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.log(`Error retrieving random phone: ${err.message}`);
        res.status(500).send(`Error retrieving random phone: ${err.message}`);
    }
};


exports.updatePhone = async (req, res) => {
    try {
        const { phone, status } = req.body;
        const { id } = req.params;

        if (!phone && !status) {
            console.log('At least one field (phone or status) is required');
            return res.status(400).send('At least one field (phone or status) is required');
        }

        const fields = [];
        const values = [];

        if (phone) {
            fields.push('phone = ?');
            values.push(phone);
        }

        if (status) {
            fields.push('status = ?');
            values.push(status);
        }

        values.push(id);

        const query = `UPDATE phones SET ${fields.join(', ')} WHERE id = ?`;
        pool.query(query, values, (err, results) => {
            if (err) {
                console.log(`Error updating phone: ${err.message}`);
                return res.status(500).send(`Error updating phone: ${err.message}`);
            }
            if (results.affectedRows === 0) {
                console.log('Phone not found');
                return res.status(404).send('Phone not found');
            }
            console.log(`Phone updated successfully with ID: ${id}`);
            res.status(200).send('Phone updated successfully');
        });
    } catch (err) {
        console.log(`Error updating phone: ${err.message}`);
        res.status(500).send(`Error updating phone: ${err.message}`);
    }
};

exports.updateIsTakenById = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_taken } = req.body;

        if (typeof is_taken !== 'boolean') {
            console.log('is_taken must be a boolean');
            return res.status(400).send('is_taken must be a boolean');
        }

        const query = 'UPDATE phones SET is_taken = ? WHERE id = ?';
        pool.query(query, [is_taken, id], (err, results) => {
            if (err) {
                console.log(`Error updating phone: ${err.message}`);
                return res.status(500).send(`Error updating phone: ${err.message}`);
            }
            if (results.affectedRows === 0) {
                console.log('Phone not found');
                return res.status(404).send('Phone not found');
            }
            console.log(`Phone updated successfully with ID: ${id}`);
            res.status(200).send('Phone updated successfully');
        });
    } catch (err) {
        console.log(`Error updating phone: ${err.message}`);
        res.status(500).send(`Error updating phone: ${err.message}`);
    }
};

exports.updateIsTakenForAll = async (req, res) => {
    try {
        const { is_taken } = req.body;

        if (typeof is_taken !== 'boolean') {
            console.log('is_taken must be a boolean');
            return res.status(400).send('is_taken must be a boolean');
        }

        const query = 'UPDATE phones SET is_taken = ?';
        pool.query(query, [is_taken], (err, results) => {
            if (err) {
                console.log(`Error updating phones: ${err.message}`);
                return res.status(500).send(`Error updating phones: ${err.message}`);
            }
            console.log(`Updated is_taken for ${results.affectedRows} phones successfully`);
            res.status(200).send(`Updated is_taken for ${results.affectedRows} phones successfully`);
        });
    } catch (err) {
        console.log(`Error updating phones: ${err.message}`);
        res.status(500).send(`Error updating phones: ${err.message}`);
    }
};
