const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = 'https://api-eu.syrve.live';

app.post('/products', async (req, res) => {
    const apiKey = req.body.apiKey;

    try {
        // Step 1: Get session token
        const authRes = await fetch(`${API_URL}/v2/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey })
        });

        const { sessionToken } = await authRes.json();
        if (!sessionToken) throw new Error('Token not received');

        // Step 2: Fetch products
        const productRes = await fetch(`${API_URL}/v2/nomenclature`, {
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            }
        });

        const products = await productRes.json();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('✅ Proxy server running at http://localhost:3000');
});
