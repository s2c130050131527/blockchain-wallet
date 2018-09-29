import UserService from './user.service';
import wallet from '../../utils/createWallet'
class UserController {
  async getBalance(req, res) {
    const userObject = req.body;
    const user = await UserService.findUser(parseInt(userObject.userId));
    const address = user.wallet.address;
    const balance = wallet.getBalance(address,(err,balance) => {
      if(err){
        res.status(500).send("Internal Error");
      }
      res.status(200).send({address:user.wallet.address,balance:(balance/(100000000)).toString()});
    });
   
  }
  getUser(req, res) {
    const id = parseInt(req.params.id, 10);
   
  }
  getAllUsers(req, res) {
    res.send(UserService.getAllUsers());
  }
}

export default UserController;
