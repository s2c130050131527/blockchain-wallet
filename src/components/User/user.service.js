
class UserService {
    'use strict'

    constructor() {
      this.users = [];
    }
    addUser(userObj) {
      this.users.push(userObj);
    }
    getUser(id) {
      return this.users.filter(u => u.id === id)[0] || null;
    }
    getAllUsers() {
      return this.users;
    }
}

export default new UserService();
