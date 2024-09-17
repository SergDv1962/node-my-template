const express = require("express");
const ejs = require("ejs");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({}));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// ======== users
app.get("/users/:username/:id", (req, res) => {
  let data = {
    username: req.params.username.toLowerCase(),
    id: req.params.id,
    hobbies: ["football", "tenis", "basketball"],
  };
  res.render("users", data);
});

app.post("/check-user", (req, res) => {
  let user = req.body;
  if (!user) return res.redirect("/");
  res.redirect(`/users/${user.username}/${user.email}`);
});
// =======

// ======= images
/// === read file
app.get("/files/:filename", (req, res) => {
  let data = {
    filename: req.params.filename,
    size: fs.statSync(`./public/uploads/${req.params.filename}`).size,
  };
  res.render("sampleImage", data);
});

/// === add files
app.post("/uploading", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const infoFile = req.files.sampleFile;
  const uploadPath = __dirname + "/public/uploads/" + infoFile.name;
  infoFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
    console.log(req.files.sampleFile.name);
    res.render("home");
  });
});
// === read list files
app.get("/images", (req, res) => {
  let infoFiles = fs.readdirSync(__dirname + "/public/uploads").map((item) => ({
    name: item,
    size: Math.round(fs.statSync(__dirname + "/public/uploads/" + item).size/1000),
  }));
  // -- file size sum
  let sizeFiles = fs.readdirSync(__dirname + "/public/uploads").map((item) =>
    fs.statSync(__dirname + "/public/uploads/" + item).size)
  let sumSizeFiles = 0;
  for(let i=0; i<sizeFiles.length; i++) {
    sumSizeFiles += sizeFiles[i];
  }
  let data = { files: infoFiles, sum: Math.round(sumSizeFiles/1000) };
  res.render("images", data);
});

/// === delete files
app.get("/:file", (req, res) => {
  let file = req.params.file;
  console.log(req.params.file);
  fs.unlink(__dirname + "/public/uploads/" + file, (err) => {
    if (err) return res.status(500).send(err);
    res.redirect("images");
  });
});

app.listen(3000, () => {
  console.log("Server started at port 3000");
});
