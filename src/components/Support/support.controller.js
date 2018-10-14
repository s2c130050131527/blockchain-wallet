import supportService from './support.service';

class UserController {
  
    async getsupportUser(req, res){
        console.log(req.body)
        const user = await supportService.findUser(req.user.id);
        res.status(200).send('Issue Registered Successfully');
    }
}

export default UserController;
