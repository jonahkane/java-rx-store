const { AuthenticationError } = require("apollo-server-express");
const { StoreUser, Product, Category, Order } = require("../models");
const { signToken } = require("../utils/auth");
const stripe = require("stripe")("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

const resolvers = {
  Query: {
    categories: async () => {
      return await Category.find();
    },
    products: async (parent, { category, name }) => {
      const params = {};

      if (category) {
        params.category = category;
      }

      if (name) {
        params.name = {
          $regex: name,
        };
      }

      return await Product.find(params).populate("category");
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate("category");
    },
    storeuser: async (parent, args, context) => {
      if (context.storeuser) {
        const storeuser = await StoreUser.findById(
          context.storeuser._id
        ).populate({
          path: "orders.products",
          populate: "category",
        });

        storeuser.orders.sort((a, b) => b.purchaseDate - a.purchaseDate);

        return storeuser;
      }

      throw new AuthenticationError("Not logged in");
    },
    order: async (parent, { _id }, context) => {
      if (context.storeuser) {
        const storeuser = await StoreUser.findById(
          context.storeuser._id
        ).populate({
          path: "orders.products",
          populate: "category",
        });

        return storeuser.orders.id(_id);
      }

      throw new AuthenticationError("Not logged in");
    },
    checkout: async (parent, args, context) => {
      const url = new URL(context.headers.referer).origin;
      const order = new Order({ products: args.products });
      const line_items = [];

      const { products } = await order.populate("products");

      for (let i = 0; i < products.length; i++) {
        const product = await stripe.products.create({
          name: products[i].name,
          description: products[i].description,
          images: [`${url}/images/${products[i].image}`],
        });

        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: products[i].price * 100,
          currency: "usd",
        });

        line_items.push({
          price: price.id,
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/`,
      });

      return { session: session.id };
    },
  },
  Mutation: {
    addStoreUser: async (parent, args) => {
      const storeuser = await StoreUser.create(args);
      const token = signToken(storeuser);

      return { token, storeuser };
    },
    addOrder: async (parent, { products }, context) => {
      console.log(context);
      if (context.storeuser) {
        const order = new Order({ products });

        await StoreUser.findByIdAndUpdate(context.storeuser._id, {
          $push: { orders: order },
        });

        return order;
      }

      throw new AuthenticationError("Not logged in");
    },
    updateStoreUser: async (parent, args, context) => {
      if (context.storeuser) {
        return await StoreUser.findByIdAndUpdate(context.storeuser._id, args, {
          new: true,
        });
      }

      throw new AuthenticationError("Not logged in");
    },
    updateProduct: async (parent, { _id, quantity }) => {
      const decrement = Math.abs(quantity) * -1;

      return await Product.findByIdAndUpdate(
        _id,
        { $inc: { quantity: decrement } },
        { new: true }
      );
    },
    login: async (parent, { email, password }) => {
      const storeuser = await StoreUser.findOne({ email });

      if (!storeuser) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await storeuser.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(storeuser);

      return { token, storeuser };
    },
  },
};

module.exports = resolvers;
