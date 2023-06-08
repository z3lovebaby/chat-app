const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const { faker } = require("@faker-js/faker");

const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/username.html");
});
let username;
const users = {};
app.post("/submitForm", (req, res) => {
  username = req.body.username;
  // Handle the submitted username here
  //console.log("Submitted username:", username);
  // You can perform any desired operations with the username

  // Redirect to index.html
  res.redirect("/index.html");
});

app.get("/index.html", (_req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  // generate a fake name
  const usernamee = username;
  users[socket.id] = username;
  //console.log(users[socket.id]);
  // server emit event to only one client to set name
  io.emit("users", users);
  socket.emit("welcome", users[socket.id]);

  // server notifies all clients that there is a new user
  io.emit("join", usernamee);

  // each client send a message
  socket.on("chat", (msg) => {
    // server broadcasts message to all other clients
    io.emit("sendMsg", users[socket.id], msg);
  });

  // socket.on("directMsg", (to, msg) => {
  //   const receiver = users.find((user) => users[socket.id] === to);

  //   if (receiver) {
  //     io.to(receiver.socketId).emit("receiveMsg", users[socket.id], msg);
  //   }
  // });
  socket.on("directMsg", (to, msg) => {
    const receiver = Object.keys(users).find((key) => users[key] === to);

    if (receiver) {
      io.to(receiver).emit("receiveMsg", users[socket.id], msg);
    }
  });

  socket.on("disconnect", (reason) => {
    const u = users[socket.id];
    delete users[socket.id];
    //console.log(users);
    //users.delete(usernamee);
    io.emit("leave", users[socket.id],u, reason);
    io.emit("users", users);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
