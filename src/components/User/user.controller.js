import UserService from './user.service';
class UserController {
  addUser(req, res) {
    console.log(req.body);
    const userObject = req.body;
    try {
      UserService.addUser(userObject);
      res.status(201);
      res.send('Created');
    } catch (error) {
      res.status(500);
      res.send('Unexpected Error');
    }
  }
  getUser(req, res) {
    const id = parseInt(req.params.id, 10);
    if (id > 0) {
      res.send(UserService.getUser(id));
    } else {
      res.status(422);
      res.send('wrong Id');
    }
  }
  getAllUsers(req, res) {
    res.send(UserService.getAllUsers());
  }
}

export default UserController;
