import express from 'express';
import LoginRoutes from './Login/login.route';
import UserRouter from './User/user.route';
import supportRoute from './Support/support.route';
const serverSecret = 'simpleServerSecret'
const expressJwt = require('express-jwt');
const router = express.Router();

const authenticate = expressJwt({secret : serverSecret});

const initRoute = (app,passport) => {
  app.use(router);

  router.get('/', (req, res) => {
    const user = {
      name:'shrey',
      id: 1
    };
    res.send(user);
  });
  const apiRoute = express.Router();
  router.use('/api', apiRoute);
  apiRoute.post('/authenticate',authenticate,(req, res) => {
    res.status(200).send('Logged In');
  });

  const loginRoute = express.Router();
  apiRoute.use(loginRoute);
  const u = new LoginRoutes(loginRoute,passport);

  const userRoute = express.Router();
  apiRoute.use('/user',authenticate,userRoute);
  new UserRouter(userRoute);
  
  const supportRouter = express.Router();
  apiRoute.use('/support',authenticate,supportRouter);
  new supportRoute(supportRouter)


};
export default initRoute;
