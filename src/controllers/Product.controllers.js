import ProductModel from "../models/Product";
import mongoose from "mongoose";

import path from 'path'
import { writeFile, unlink } from "fs/promises";

import multer from "multer";
import cloudinary from 'cloudinary';

const storage = multer.memoryStorage(); // Utiliza memoria para almacenar archivos
const upload = multer({ storage: storage }).array('images', 5); // 'images' es el nombre del campo y 5 es el número máximo de archivos


// Configuración de Cloudinary (necesitarás tu propia configuración)
cloudinary.config({
  cloud_name: 'damcd1aew',
  api_key: '488626873193819',
  api_secret: 'A8ujGx_CDviDoEQwUodV0R7b88U'
});

// Get all existing products
export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await ProductModel.find();
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor: " + error });
  }
};

// Endpoint to have all diferent values from a specific field
export const getUniqueFields = async (req, res) => {
  const {fieldName} = req.body;

  try {
    const uniqueValues = await ProductModel.aggregate([
      { $group: { _id: `$${fieldName.toLowerCase()}`, count: { $sum: 1 } } },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]);

    res.status(200).json(uniqueValues);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor: " + error });
  }
}

export const createProduct = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ error: "Error uploading file: " + err });
      }

      // Data coming in req.body
      let { category, name, price, description, tags, sizes } = req.body;
      const images = await req.files; // 'file' es el nombre del campo de archivos

      const buffers = images.map(image => image.buffer);
      const filePaths = images.map(image=> path.join(process.cwd(),"media", image.originalname))
      
      //File localcreation
      await filePaths.map((path, index)=>{
        writeFile(path ,buffers[index])
      })

      const uploadingPromises = filePaths.map(path =>
        cloudinary.v2.uploader.upload(path, {
          transformation: {
            quality: 70,
          },
        })
      );
      
      const results = await Promise.all(uploadingPromises);
      
      const imagesUrl = results.map(image => image.url)

      //File local erasing
      const deletingPromises = filePaths.map(async (path) => {
        await unlink(path);
      });

      await Promise.all(deletingPromises);

      // lowercase transformation
      category = category ? category.toLowerCase() : null;
      name = name ? name.toLowerCase() : null;
      description = description ? description.toLowerCase() : null;
      tags = tags?.map(field => field.toLowerCase());

      // Not null or undefined verification for required fields
      if (category === null || name === null || price === null) {
        return res.status(400).json({
          error: "Required fields can't be null. Please check 'receivedFields' to figure out how your data arrived at our server",
          receivedFields: { category, name, price },
        });
      }

      // Product instance creation
      const newProduct = new ProductModel({
        category,
        name,
        price,
        description,
        images:imagesUrl,
        tags,
        sizes
      });

      //Product collection save execution
      const savedProduct = await newProduct.save();

      //Send new Product created
      res.status(201).json({ message: "Product successfully created!", savedProduct });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error: " + error });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

     // Verificar si el ID es un ObjectId válido
     if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `ID provided to delete is not a valid ID: ${id}` });
    }

    const imagesToDeleteFromCloudinary = await ProductModel.findById(id);

    const resourcesToDelete = imagesToDeleteFromCloudinary.images.map(imageURL=>{
      let imageURLWithoutSlash = imageURL.split('/')[imageURL.split('/').length - 1]
      let cleanResourceName = imageURLWithoutSlash.split('.')[0]
      return cleanResourceName
    })

    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      // Si no se encuentra el producto, puedes responder con un código 404 (Not Found)
      return res
        .status(404)
        .json({ message: "Product not found, nothing was deleted!" });
    }

    //Image deletion from Cloudinary
    cloudinary.v2.api
    .delete_resources(resourcesToDelete, 
      { type: 'upload', resource_type: 'image' })

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
    const { id, category, name, price, description, images, tags, sizes } = req.body;


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
      sizes
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

