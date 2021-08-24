exports.authenticate = (username, password) => {
    return Promise.resolve({ uid: 1, name: 'Sean', admin: false });
};
