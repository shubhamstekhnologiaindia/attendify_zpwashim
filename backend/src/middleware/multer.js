// import multer from "multer";
// import path from "path";
// import fs from "fs";



// // Ensure upload directory exists
// const uploadDir = "uploads/upload_gr";
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_"));
//     }
// });

// // File filter (allow only images and PDFs)
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."), false);
//     }
// };

// // Multer middleware
// const upload = multer({ storage, fileFilter });

// export default upload;




import multer from "multer";
import path from "path";
import fs from "fs";
 
// Dynamic destination based on field name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
 
    if (file.fieldname === "user_profile") {
      uploadDir = "uploads/user_profiles";
    } else {
      uploadDir = "uploads/upload_gr"; // default for other cases
    }
 
    // Ensure directory exists
    fs.mkdirSync(uploadDir, { recursive: true });
 
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname.replace(/\s+/g, "_"));
  }
});
 
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }
};
 
const upload = multer({ storage, fileFilter });
 
export default upload;