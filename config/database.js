import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP password is empty
    database: 'bunicashop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool; 