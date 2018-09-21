import UserController from './user.controller';

class UserRouter {
  constructor(router) {
    this.router = router;
    this.userController = new UserController();
    this.register();
    console.log('routing of user done');
  }

  register() {
    this.router.post('/add',this.addUser.bind(this));
    this.router.get('/getall', this.getAllUsers.bind(this));
    this.router.get('/get/:id', this.getUser.bind(this));
  }
  addUser(req, res) {
    this.userController.addUser(req, res);
  }
  getUser(req, res) {
    this.userController.getUser(req, res);
  }
  getAllUsers(req, res) {
    this.userController.getAllUsers(req, res);
  }
}

export default UserRouter;
