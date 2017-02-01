var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

//GET /signup 注册页面
router.get('/', checkNotLogin, function (req, res, next) {
  res.render('signup');
});

//POST /signup 用户注册
router.post('/', checkNotLogin, function (req, res, next) {
  var name = req.fields.name;
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  //校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名称在10~20字符之间');
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能为m、f、x');
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('个人简介在1~30字符之间');
    }
    if (!req.files.avatar.name) {
      throw new Error('缺少头像');
    }
    if (password.length < 6 || password.length > 18) {
      throw new Error('密码在6~18位之间');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
  } catch (e) {
    //注册失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/signup');
  }
  password = sha1(password);

  //带写入数据库的用户信息
  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };
  //用户信息写入数据库
  UserModel.create(user).then(function (result) {
    user = result.ops[0];
    //将用户信息存入session
    delete user.password;
    req.session.user = user;
    // 写入flash
    req.flash('success', '注册成功');
    res.redirect('/');
  }).catch(function (e) {
    //注册失败，删除上传的头像
    fs.unlink(req.files.avatar.path);
    //用户名被占用则跳回到注册页
    if (e.message.match('E11000 duplicate key')) {
      req.flash('error', '用户名称已被占用');
      return res.redirect('/signup');
    }
    next(e);
  });
});

module.exports = router;
