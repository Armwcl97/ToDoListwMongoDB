//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://XXXXX:XXXXX@cluster0.xkalq4v.mongodb.net/ToDoListDB");

const itemsSchema = {
  name: {
    type: String,
    required: [true, "se necesita poner un item para poder guardar"]
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Bienvenido a tu lista de quehaceres!"
});

const item2 = new Item({
  name: "puedes agregar tu lista aqui de lo que tienes pendiente por hacer"
});

const item3 = new Item({
  name: "<------- puedes borrar de la lista presionando aqui"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(error, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(error) {
        if (error) {
          console.log(error);
        } else {
          console.log("Successfully saved default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: day,newListItems: foundItems});
    }
  });

  const day = date.getDate();
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(error,foundList){
    if(!error){
      if(!foundList){
        //Create a New list
        const list = new List({
          name:customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/"+customListName)
      } else {
        //Show an existing
        res.render("list",{listTitle: foundList.name ,newListItems: foundList.items} )
      }
  };


});
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName==="today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName},function(error,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }





  //DEPRECATE FUNCTION
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "today") {
    Item.findByIdAndRemove(checkedItemID, function(error){
      if (!error) {
        console.log("se ha borrado con exito de la lista");
      }
    });
  } else {
     List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemID}}}, function(error,foundList){
       if(!error){
        res.redirect("/"+listName);
       }
     });
  }



});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
