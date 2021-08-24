module.exports = {
    name: 'API',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    base_url: process.env.BASE_URL || 'http://localhost:3000',
    db: {
        host: 'SG-justo-4820-mysql-master.servers.mongodirector.com',
        user: 'hector',
        password: 'NoSupeQuePoner11*',
        database: 'justo'
    },
    jwt: {
        secret: '&@$!changeme!$@&'
    }
};
