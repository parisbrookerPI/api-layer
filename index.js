var express = require("express");
var path = require("path");
var logger = require("morgan");
const bodyParser = require("body-parser");
const sql = require("mssql");
const {
  getAllUsers,
  insertUser,
  getLicenceAssignments,
} = require("./tools/sql");
const app = express();
const port = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const db = async () => {
  await connectSQL();
};

db;

app.get("/getallusers", async function (req, res) {
  console.log("here");
  let { recordsets } = await getAllUsers();
  userRecords = recordsets[0];

  let licenceRecords = await getLicenceAssignments();
  licenceRecords = licenceRecords.recordsets[0];

  let users = userRecordsProcessor(userRecords);
  let licences = licenceRecordsProcessor(licenceRecords);

  let userLicenceArray = mergeByProperty(users, licences, "UserID");

  console.log(userLicenceArray);
});

app.get("/adduser", async function (req, res) {
  let results = await insertUser("Peter", "Lees");
  console.log(results);
});

console.log(`Listening on ${port}`);
app.listen(port);

function userRecordsProcessor(records) {
  let users = [];
  let unum = 0;
  for (rec of records) {
    let user = {};
    user.UserId = rec.UserID;
    user.FirstName = rec.FirstName;
    user.LastName = rec.LastName;
    user.email = rec.EmailName;
    users.push(user);
  }
  return users;
}

function licenceRecordsProcessor(licenceRecords) {
  let licences = [];
  for (lic of licenceRecords) {
    let licence = {};
    licence.Id = lic.Id;
    licence.UserId = lic.LicensedUserId;
    licence.BundleName = lic.BundleName;
    licence.DateAllocated = lic.DateAllocated;
    licences.push(licence);
  }
  return licences;
}

function mergeByProperty(target, source, prop) {
  source.forEach((sourceElement) => {
    let targetElement = target.find((targetElement) => {
      return sourceElement[prop] === targetElement[prop];
    });
    targetElement
      ? Object.assign(targetElement, sourceElement)
      : target.push(sourceElement);
  });
  return target;
}
