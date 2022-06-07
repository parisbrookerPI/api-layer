module.exports = class User {
  constructor(
    userId,
    userName,
    firstName,
    lastName,
    email,
    licenceId,
    bundle,
    allocationDate
  ) {
    this.userId = userId;
    this.userName = userName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.licenceId = licenceId;
    this.bundle = bundle;
    this.allocationDate = allocationDate;
  }

  greet() {
    return `Hi my name is ${this.firstName} ${this.lastName}`;
  }
};
