import UserController from './user.controller';


class UserRouter {
  constructor(router) {
    this.router = router;
    this.userController = new UserController();
    this.register();
    console.log('routing of user done');
  }

  register() {
    this.router.get('/wallets',this.getWallets.bind(this),this.userController.getWallets)
    this.router.get('/wallets/:coin',this.getBalance.bind(this), this.userController.getBalance);
    this.router.post('/verify_transfer', this.getTransfer.bind(this),this.userController.transfer);
    this.router.post('/authorize_transfer', this.getAuthorizeTransfer.bind(this),
    this.userController.authorizeTransfer);
    this.router.get('/transaction',this.getTransaction.bind(this),this.userController.getTransaction)
    this.router.get('/transaction/filters',this.getTransactionFilters.bind(this),this.userController.getTransactionFilters);
    this.router.post('/language',this.getWallets.bind(this),this.userController.setLanguage);

  }
  getWallets(req,res,next){
    next();
  }
  getBalance(req, res,next) {
   next();
  }
  getTransfer(req, res, next) {
    next();
  }
  getAuthorizeTransfer(req, res,next) {
    next();
  }
  getTransaction(req,res,next){
    next();
  }
  getTransactionFilters(req,res,next){
    next();
  }
}

export default UserRouter;
