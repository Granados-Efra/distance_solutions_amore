import ProductModel from "../models/Product";
import mongoose from "mongoose";

// Get all existing products
export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await ProductModel.find();
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor: " + error });
  }
};

// Product creation controller
export const createProduct = async (req, res) => {
  try {
    // Data coming at the body in JSON format
    let { category, name, price, description, images, tags } = req.body;

    // lowercase transformation
    category = category ? category.toLowerCase() : null;
    name = name ? name.toLowerCase() : null;
    description = description ? description.toLowerCase() : null;
    tags = tags.map(field=> field.toLowerCase());

    // Not null or undefined verification for required fields
    if (category === null || name === null || price === null) {
      return res.status(400).json({
        error:
          "Required fields can't be null please check 'reveivedFeilds' to figure out how your data arrived to our server",
        reveivedFeilds: { category, name, price },
      });
    }

    // Product instance creation
    const newProduct = new ProductModel({
      category,
      name,
      price,
      description,
      images,
      tags,
    });

    // Product collection save execution
    const savedProduct = await newProduct.save();

    // Send new Product created
    res
      .status(201)
      .json({ message: "Product succesfully created!", savedProduct });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      // Si no se encuentra el producto, puedes responder con un código 404 (Not Found)
      return res
        .status(404)
        .json({ message: "Product not found, nothing was deleted!" });
    }

    // Utiliza el código de estado 204 para una eliminación exitosa
    res
      .status(200)
      .json({ message: "Product successfully deleted!", deletedProduct });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};

export const modifyProduct = async (req, res) => {
  try {
    const { id, category, name, price, description, images, tags } = req.body;


    // Verificar si el ID es un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `ID provided is not a valid ID: ${id}` });
    }
    // Obtener el producto a modificar
    const productToModify = await ProductModel.findById(id);

    // Verificar si el producto existe
    if (!productToModify) {
      return res.status(404).json({ error: `No product found to update with ID: ${id}` });
    }

    // Verificar si hay al menos un campo para modificar
    if (!category && !name && !price && !description && !images && !tags) {
      return res.status(400).json({ error: "You need at least one field to modify" });
    }

    // LowerCase casting
    const updatedFields = {
      category: category ? category.toLowerCase() : undefined,
      name: name ? name.toLowerCase() : undefined,
      price,
      description:  description ? description.toLowerCase() : undefined,
      images,
      tags: tags.map((field)=>field.toLowerCase()),
    };

    // Filter undefined fields in order to keep originals in case there's some falsy values
    const filteredUpdatedFields = Object.fromEntries(
      Object.entries(updatedFields).filter(([key, value]) => value !== undefined)
    );

 
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      filteredUpdatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product succesfully modified!", updatedProduct });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};

