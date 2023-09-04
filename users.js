const {trimStr} = require('./utils');

let users = [];

const findUser = (user) => {
    const userName = trimStr(user.name)
    const userRoom = trimStr(user.room)

    return users.find(user => trimStr(user.name) === userName && trimStr(user.room) === userRoom)
}

const addUser = (user) => {
    const isExsist = findUser(user)
    !isExsist && users.push(user)

    const currentUser = isExsist || user;

    return { isExsist: !!isExsist, user: currentUser }
}

const getRoomUsers = (room) => users.filter((u) => u.room === room);

const removeUser = (user) => {
    const found = findUser(user);

    if (found) {
        users = users.filter(
            ({ room, name }) => room === found.room && name !== found.name
        );
    }

    return found;
};

module.exports = { addUser, findUser, removeUser, getRoomUsers }