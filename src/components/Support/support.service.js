import db from '../../database';
class SupportService {
    'use strict'
    constructor(){
      this.db = db;
    }
    async findUser(userId){
      let user = null;
      user = await db.db.collection('users').findOne({id:userId});
      return user;
    }
  }

export default new SupportService();
