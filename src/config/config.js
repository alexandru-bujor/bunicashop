const config = {
    // Admin settings
    adminPassword: 'admin',
    
    // API settings
    apiUrl: 'https://bunicashop.md/api',
    developmentApiUrl: 'http://localhost:3001/api',
    
    // App settings
    siteName: 'BunicaShop',
    currency: 'MDL',
    defaultLanguage: 'ro',
    
    // Environment
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname !== 'localhost',

    // Get the appropriate API URL based on environment
    getApiUrl: function() {
        return this.isDevelopment ? this.developmentApiUrl : this.apiUrl;
    }
};

export default config; 