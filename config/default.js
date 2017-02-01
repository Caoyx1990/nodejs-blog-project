module.exports = {
  port: 3000,//系统监听的端口号
  session: {
    secret: 'myblog',
    key: 'myblog',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/myblog' //mongodb地址，myblog是数据库名称
};