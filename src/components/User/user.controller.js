import UserService from './user.service';
import wallet from '../../utils/createWallet'
import userService from './user.service';
class UserController {
  async getBalance(req, res) {
    const user = await UserService.findUser(parseInt(req.user.id));
    const address = user.wallet.address;
    const balance = wallet.getBalance(address,(err,balance) => {
      if(err){
        res.status(500).send("Internal Error");
      }
      res.status(200).send({address:user.wallet.address,balance:(balance/(100000000)).toString()});
    });
   
  }
  async transfer(req, res) {
    const user = await UserService.findUser(parseInt(req.user.id));
    const address = user.wallet.address;
    wallet.getBalance(address,(err,balance) => {
      console.log(err,balance)
      if(err){
        res.status(500).send("Internal Error");
        return
      }
      if(balance < (req.body.amount*100000000)){
        res.status(400).send('Wallet Balance Low')
        return
      }
      wallet.createTransaction(req.body.toAddr,user.wallet.address,user.wallet.WIF,req.body.amount*100000000,(err,transaction) => {
        if(err){
          console.log(err);
          res.status(400).send(err);
          return
        }
        userService.addTransaction(user.id,transaction,(transactionId)=>{
          res.status(200).send({msg:'Transaction Added Successfully',transactionId:transactionId,transaction})
        });
      })

    });
  }
  getAllUsers(req, res) {
    res.send(UserService.getAllUsers());
  }
}

export default UserController;
