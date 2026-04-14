import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

mongoose.connect('mongodb://localhost:27017/userStore').then(() => {
  console.log('数据库连接成功');
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  age: Number,
  email: String,
  isActive: Boolean,
  hobbies: [String],
});

userSchema.pre('save', async function () {
  console.log('pre save hook 执行, isNew:', this.isNew, 'isModified:', this.isModified('password'));
  if (this.isNew || this.isModified('password')) {
    const hashed = await bcrypt.hash(this.password, 10);
    console.log('加密后的密码:', hashed);
    this.password = 'encrypted_' + hashed;
  }
});

userSchema.post('find', function (docs) {
  docs.forEach(doc => {
    doc.password = '********';
  });
});

const User = mongoose.model('User', userSchema);

const newUser = User({
  username: 'admin',
  password: 'password',
  age: 18,
  email: 'admin@163.com',
  isActive: true,
  hobbies: ['reading', 'swimming'],
});

newUser.save().then(user => {
  console.log(user);
});

User.find().then(users => {
  console.log(users);
});
