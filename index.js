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
const User = require("./userModel");
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
  async function userProcessing() {
    let { recordsets } = await getAllUsers();
    userRecords = recordsets[0];

    let licenceRecords = await getLicenceAssignments();
    licenceRecords = licenceRecords.recordsets[0];

    const users = userRecordsProcessor(userRecords);
    const licences = licenceRecordsProcessor(licenceRecords);

    let licencedUserClassArray = [];
    let unlicencedUserClassArray = [];

    //map function converts merged licence/user objects into User class instances and adds them to the above arrays
    users.map((u) => {
      let licence = licences.find((obj) => {
        return obj.UserId == u.UserId;
      });
      let merged = Object.assign({}, u, licence);
      if (merged.LicenceId) {
        merged = new User(
          merged.UserId,
          merged.FirstName,
          merged.LastName,
          merged.email,
          merged.LicenceId,
          merged.BundleName,
          merged.DateAllocated
        );
        licencedUserClassArray.push(merged);
      } else {
        merged = new User(
          merged.UserId,
          merged.FirstName,
          merged.LastName,
          merged.email,
          merged.LicenceId,
          merged.BundleName,
          merged.DateAllocated
        );
        unlicencedUserClassArray.push(merged);
      }
    });

    const licenceCounter = {
      totalLicences: licences.length,
      assignedLicences: licencedUserClassArray.length,
      get remainingLicences() {
        return this.totalLicences - this.assignedLicences;
      },
    };

    console.log(
      licencedUserClassArray.filter(
        (e) => e.bundle == "SupportSlot" && e.email.includes("planning")
      )
    );
  }
  await userProcessing();
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
    user.UserName = rec.UserName;
    user.email = rec.EmailName.toLowerCase();
    users.push(user);
  }
  return users;
}

function licenceRecordsProcessor(licenceRecords) {
  let licences = [];
  for (lic of licenceRecords) {
    let licence = {};
    licence.LicenceId = lic.Id;
    licence.UserId = lic.LicensedUserId;
    licence.BundleName = lic.BundleName;
    licence.DateAllocated = lic.DateAllocated;
    licences.push(licence);
  }
  return licences;
}
