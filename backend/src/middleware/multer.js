import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads directory exists
// const uploadDir = path.join("src", "gr_uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure Multer Storage
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir); // Files will be saved inside "uploads" folder
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`); // Unique file names
//     }
// });

// // Multer Upload Middleware
// const upload = multer({ storage });

// export default upload;


// Ensure upload directory exists
const uploadDir = "uploads/upload_gr";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_"));
    }
});

// File filter (allow only images and PDFs)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."), false);
    }
};

// Multer middleware
const upload = multer({ storage, fileFilter });

export default upload;