import db from '../../database';
class UserService {
    'use strict'

    constructor() {
      this.users = [];
    }
    async findUser(userId){
      let user = null;
      console.log(userId);
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }
    getUser(id) {
      return this.users.filter(u => u.id === id)[0] || null;
    }
    getAllUsers() {
      return this.users;
    }
}

export default new UserService();
