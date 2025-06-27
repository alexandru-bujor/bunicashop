import mysql from 'mysql2/promise';

const testConnection = async () => {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'bunicashop',
        port: 3306,
        waitForConnections: true,
        connectionLimit: 1
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to the database!');
        connection.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Make sure XAMPP MySQL service is running on port 3306');
        }
        return false;
    } finally {
        await pool.end();
    }
};

// Run the test
testConnection()
    .then(result => {
        console.log('Connection test completed. Success:', result);
        process.exit(result ? 0 : 1);
    })
    .catch(err => {
        console.error('Test failed with error:', err);
        process.exit(1);
    }); 