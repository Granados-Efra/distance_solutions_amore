import { Schema, model } from "mongoose";


const pizzasDescription = new Schema({
  size: String,
  pieces:Number,
  price: Number
})

const ProductSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    images: {
      type: [String], // String array with product images
    },
    tags: {
      type: [String], // String array with tags
    },
    sizes:{
      type:[pizzasDescription],
    }
  },
  {
    timestamps: true,
  }
);

const ProductModel = model("Product", ProductSchema);

export default ProductModel;
