const db = require('../config/firebase');

const collectionRef = db.collection('users');

const getUserById = async (id) => {
    const doc = await collectionRef.doc(id).get();
    if (!doc.exists) {
        throw new Error('User not found');
    }
    return doc.data();
};

const createUser = async (userData) => {
    const newUserRef = collectionRef.doc();
    await newUserRef.set(userData);
    return { id: newUserRef.id, ...userData };
};

module.exports = {
    getUserById,
    createUser,
};
