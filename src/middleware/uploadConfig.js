const multer = require('multer');

// Customize the storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this directory exists
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Create a unique suffix using the current timestamp and a random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + getExtension(file.originalname))
    }
});

// Helper function to extract file extension from original file name
const getExtension = (filename) => {
    const ext = path.extname(filename);
    return ext.length > 1 ? ext : '.pdf'; // Default to '.pdf' if no extension is found
}

// File filter to check if the uploaded file is of allowed type
const fileFilter = (req, file, cb) => {
    // Define allowable file types
    if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file format'), false);
    }
};

// Configure multer with storage, file filter, and size limits
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Example: limit file size to 10MB
});

module.exports = upload;
