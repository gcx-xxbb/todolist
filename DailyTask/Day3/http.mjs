import http from 'http';

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Node.js学习Day3');
});

server.listen(8080,()=>{
	console.log('8080 listening');
})
