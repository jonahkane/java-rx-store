const db = require("./connection");
const { StoreUser, Product, Category } = require("../models");

db.once("open", async () => {
  await Category.deleteMany();

  const categories = await Category.insertMany([
    { name: "All" },
    { name: "Espresso Machine" },
    { name: "Puck Prep" },
    { name: "Electronics" },
    { name: "Storage" },
  ]);

  console.log("categories seeded");

  await Product.deleteMany();

  const products = await Product.insertMany([
    {
      name: "Lelit Bianca Espresso Machine",
      description:
        "This top of the line world class espresso machine is sure to make the best espresso you have ever had!",
      image: "machine.jpg",
      category: categories[0]._id,
      price: 3199.95,
      quantity: 5,
    },
    {
      name: "Normcore: The Barista Tool Essentials Kit",
      description:
        "Any self-respecting home barista has the essential tools kit from Normcore.",
      image: "accessories.jpg",
      category: categories[1]._id,
      price: 345.99,
      quantity: 5,
    },
    {
      name: "Eureka Oro Mignon XL Espresso Grinder",
      category: categories[2]._id,
      description:
        "This is the best grinder money can buy.  It will grind your coffee beans as course or as fine as you want and leave you with the perfect shot of espresso.",
      image: "grinder.jpg",
      price: 899.0,
      quantity: 2,
    },
    {
      name: "Acaia Luna 2021 Smart Digital Espresso Scale",
      category: categories[3]._id,
      description:
        "Want accuracy?  Get this digital espresso scale.  It will ensure you have a perfect shot every single time.",
      image: "scale.jpg",
      price: 250.0,
      quantity: 6,
    },
    {
      name: "Atmos Vacuum Seal Coffee Bean Storage Canister",
      category: categories[4]._id,
      description:
        "This vacuum seal canister will ensure that your coffee is as fresh on the last day as it was on the first day.",
      image: "canister.jpg",
      price: 40.0,
      quantity: 10,
    },
    {
      name: "BonJour Barista Milk Frother",
      category: categories[4]._id,
      description: "Want another fun toy?  Get yourself a milk frother!",
      image: "frother.jpg",
      price: 23.39,
      quantity: 30,
    },
    {
      name: "Torani Original Coffee Favorites Variety 6-Pack",
      category: categories[(0, 1, 2)]._id,
      description:
        "Add a splash of extra flavor to that already delicious coffee drink with our sampler pack!",
      image: "syrups.jpg",
      price: 63.19,
      quantity: 30,
    },
    {
      name: "PuqPress Q2 Automatic Tamp Station",
      category: categories[(1, 2, 3)]._id,
      description:
        "Want the perfect puck every single time?  Get this outrageously over priced automatic puck press machine for just $1,390!",
      image: "presser.jpg",
      price: 1390.0,
      quantity: 100,
    },
    {
      name: "Bodum Pavina Shot Glasses - Set of 2",
      category: categories[(2, 3, 4)]._id,
      description:
        "You need something to drink out of - why not drink out of these?",
      image: "glasses.jpg",
      price: 14.95,
      quantity: 1000,
    },
  ]);

  console.log("products seeded");

  await StoreUser.deleteMany();

  await StoreUser.create({
    firstName: "David",
    lastName: "Robbins",
    email: "DavidRobbins@BCSpot.com",
    password: "password12345",
    orders: [
      {
        products: [products[0]._id, products[0]._id, products[1]._id],
      },
    ],
  });

  await StoreUser.create({
    firstName: "Jack",
    lastName: "Linhart",
    email: "jack@linhart.com",
    password: "password12345",
  });

  console.log("storeusers seeded");

  process.exit();
});
