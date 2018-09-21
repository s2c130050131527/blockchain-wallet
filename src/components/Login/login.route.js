import LoginController from './login.controller';

class LoginRouter {
  constructor(router,passport) {
    this.passport = passport;
    this.router = router;
    this.loginController = new LoginController();
    this.register();
    console.log('routing of login done');
  }

  register() {
    this.router.post('/login',this.loginUser.bind(this), this.passport.authenticate('local-login', {
      session:false
      }),this.loginController.loginUser);
    this.router.post('/register', this.registerUser.bind(this), this.passport.authenticate('local-signup',{session:false}),this.loginController.registerUser);
    this.router.post('/setuptwofa', this.setuptwoFA.bind(this),this.passport.authenticate('two-fa',{session:false}),this.loginController.setuptwoFA);
    this.router.post('/getqr',this.getQR.bind(this));
  }
  loginUser(req, res,next){
    next();
  }
  registerUser(req, res, next){
    next();
  }
  setuptwoFA(req, res, next){
    next();
  }
  getQR(req, res, next){
    next();
  }
}

export default LoginRouter;
