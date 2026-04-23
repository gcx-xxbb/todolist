const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, login, getMe, updateMe, changePassword, getUserById, getAllUsers, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.post('/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }).withMessage('用户名需3-20个字符'),
    body('email').isEmail().withMessage('请输入有效邮箱'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6个字符')
  ],
  validate,
  register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('请输入有效邮箱'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  validate,
  login
);

router.get('/me', authenticate, getMe);

router.post('/me/update',
  authenticate,
  [
    body('username').optional().trim().isLength({ min: 3, max: 20 }),
    body('email').optional().isEmail(),
    body('avatar').optional().isURL(),
    body('bio').optional().trim().isLength({ max: 200 })
  ],
  validate,
  updateMe
);

router.post('/change-password', authenticate,
  [
    body('currentPassword').notEmpty().withMessage('当前密码不能为空'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
  ],
  validate,
  changePassword
);

router.get('/:id', getUserById);

router.get('/', getAllUsers);

router.post('/:id/delete', authenticate, authorize('admin'), deleteUser);

module.exports = router;