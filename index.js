const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL)

let userSchema = new Schema({
  username: String,
});
let fser = mongoose.model("User", userSchema);

let exSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
let ex = mongoose.model("Exercise", exSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.get("/api/users", async (req, res) => {
  let users = await fser.find({}).select("_id username");
  if (!users) {
    res.send("No users found");
   } else {
    res.json(users)
  }
});


app.post("/api/users", async (req, res) => {
  console.log(req.body)
  let userObj = new fser({
    username: req.body.username
  })

  try{
    let user = await userObj.save()
    console.log(user);
    res.json(user)
  }catch(err){
    console.log(err)
  }

})


app.post("/api/users/:_id/exercises", async (req, res) => {
  let id = req.params._id;
  let { description, duration, date } = req.body
    try{
      let user = await fser.findById(id)
      if (!user) {
        res.send("Unknown userId")
      
      } else { 
        let execObj = new ex({
          user_id: user._id,
          description,
          duration,
          date: date ? new Date(date) : new Date()
        })
        let exer = await execObj.save()
        res.json({
          _id: user._id,
          username: user.username,
          description: exer.description,
          duration: exer.duration,
          date: new Date(exer.date).toDateString()
        })
      }
    }catch(err){
      console.log(err)
      res.send("there was an error saving exercise")
    }
      
  })

app.get(
  "/api/users/:_id/logs",
  async (req, res) => {
    let id = req.params._id;
    let { from, to, limit } = req.query;
    let user = await fser.findById(id);
    if (!user) {
      res.send("Unknown userId");
    return;
    }
    let dateObj = {};
    if (from) {
      dateObj["$gte"] = new Date(from);
      console.log(dateObj)
    }
    if (to) {
      dateObj["$lte"] = new Date(to);
      console.log(dateObj)
    }
    let filter = {
      user_id: id
    };
    if (from || to) {
      filter.date = dateObj;
    }
    let exercises = await ex.find(filter).limit(+limit);
    let log = exercises.map(m => ({
      description: m.description,
      duration: m.duration,
      date: m.date.toDateString()
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log
    });
    console.log(log)
    console.log(exercises)
    console.log(user)
    console.log(id)
    console.log(from)
    console.log(to)
    console.log(limit)
    console.log(dateObj)
    console.log(filter)

  })



  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
  })