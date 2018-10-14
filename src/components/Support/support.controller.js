import supportService from './support.service';
import FlatList from '../../utils/FlatList';
class UserController {
  
    async getsupportUser(req, res){
        console.log(req.body)
        const user = await supportService.findUser(req.user.id);
        res.status(200).send('Issue Registered Successfully');
    }
    getLanguageSupport(req,res){
        const languageList = FlatList;
        res.status(200).send({languageList});
    }
}

export default UserController;
