const express = require("express");
const multer = require("multer");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const FormData = require("form-data");
const Album = require("../models/gallerySectionSchema"); 
require("dotenv").config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);
    formData.append("upload_preset", "EventManager");

    const response = await fetch("https://api.cloudinary.com/v1_1/shubh1234/image/upload", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    return data.secure_url; 
};

router.post("/create-album", upload.single("coverpic"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded!" });

        const coverPicUrl = await uploadToCloudinary(req.file);

        const newAlbum = new Album({
            AlbumName: req.body.albumName,
            Coverpic: coverPicUrl,
            gallerySection: [],
        });

        await newAlbum.save();
        res.status(201).json({ message: "Album created!", album: newAlbum });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/upload-gallery/:albumId", upload.array("images", 10), async (req, res) => {
    try {
        const { albumId } = req.params;
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No images uploaded!" });

        const uploadedImages = await Promise.all(req.files.map(async (file) => {
            const imageUrl = await uploadToCloudinary(file);
            return { imageUrl, description: req.body.description || "" };
        }));

        const album = await Album.findByIdAndUpdate(
            albumId,
            { $push: { gallerySection: { $each: uploadedImages } } },
            { new: true }
        );

        if (!album) return res.status(404).json({ error: "Album not found!" });

        res.json({ message: "Images uploaded!", album });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.delete("/deleteAlbum/:albumid", async (req, res) => {
    try {
      const itemId = req.params.albumid; // Use the correct parameter name
  
      const item = await Album.findById(itemId); // Use findById for cleaner code
      if (!item) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      await item.deleteOne(); // Delete the found document
      return res.json({ message: "Event deleted successfully" });
    } catch (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  });


  router.delete("/removeImage/:albumId/:imageId", async (req, res) => {
    try {
        const { albumId, imageId } = req.params;

        const updatedAlbum = await Album.findByIdAndUpdate(
            albumId,
            { $pull: { gallerySection: { _id: imageId } } },
            { new: true }
        );

        if (!updatedAlbum) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.json({ message: "Image removed successfully", updatedAlbum });
    } catch (error) {
        console.error("Error removing image:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
  



router.get("/allalbums", (req, res) => {
    Album.find().then((events) => {
      res.json(events);
    });
  });


  router.get("/getalbum/:albumid" , (req,res) => {
    Album.findOne({_id : req.params.albumid})
    .then(list => {
        // console.log(product)
        return res.json(list)
    })
  })
  


module.exports = router;
