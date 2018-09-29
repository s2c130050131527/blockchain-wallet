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
    this.router.post('/transfer', this.getUser.bind(this),this.userController.transfer);
    this.router.get('/get/:id', this.getUser.bind(this));
  }
  getBalance(req, res,next) {
   next();
  }
  getUser(req, res, next) {
    next();
  }
  getAllUsers(req, res) {
    this.userController.getAllUsers(req, res);
  }
}

export default UserRouter;
