// Function to read JSON file
export const readJsonFile = async (filename) => {
    try {
        const response = await fetch(`/data/${filename}`);
        if (!response.ok) {
            throw new Error(`Error reading ${filename}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
};

// Function to write JSON file
export const writeJsonFile = async (filename, data) => {
    try {
        const response = await fetch(`/api/data/${filename}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error(`Error writing ${filename}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return null;
    }
}; 