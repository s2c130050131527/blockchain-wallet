import UserController from './user.controller';


class UserRouter {
  constructor(router) {
    this.router = router;
    this.userController = new UserController();
    this.register();
    console.log('routing of user done');
  }

  register() {
    this.router.post('/balance',this.getBalance.bind(this), this.userController.getBalance);
    this.router.get('/getall', this.getAllUsers.bind(this));
    this.router.get('/get/:id', this.getUser.bind(this));
  }
  getBalance(req, res,next) {
   next();
  }
  getUser(req, res) {
    this.userController.getUser(req, res);
  }
  getAllUsers(req, res) {
    this.userController.getAllUsers(req, res);
  }
}

export default UserRouter;
