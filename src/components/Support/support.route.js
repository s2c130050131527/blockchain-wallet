import supportController from './support.controller';

class SupportRouter {
  constructor(router) {
    this.router = router;
    this.supportController = new supportController();
    this.register();
    console.log('routing of support done');
  }

  register() {
    this.router.post('/',this.supportUser.bind(this),this.supportController.getsupportUser);
    this.router.get('/languages',this.languageSupport.bind(this),this.supportController.getLanguageSupport);

  }
  languageSupport(req, res,next){
    next();
  }
  supportUser(req, res,next){
    next();
  }
}

export default SupportRouter;
