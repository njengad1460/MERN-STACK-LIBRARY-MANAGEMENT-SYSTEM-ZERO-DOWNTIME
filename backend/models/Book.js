const mongoose = require("mongoose")

const bookSchema = new mongoose.Schema ({
    title : {
        type: String,
        trim: true,
        required: true,
    },
    author : {
        type: String,
        trim: true,
        required : true
    },
    isbn : { // Unique identifier for books
        type : String,
        unique: true,
        sparse : true, // allows multiple documents without an ISBN (optional fields can have null values without violating uniqueness)
        trim : true
    },
    genre : {
        type: String,
        required: true,
        trim: true
    },
    description :{
        type: String,
        trim: true
    },
    publisher : {
        type: String,
        trim: true
    },
    publishedDate: {
        type:Date,
    },
    pages :{
        type: Number,
        min: 1
    },
    coverImage :{ // Stores a URL or file path to the book's cover
        type: String,
        trim: true
    },
    availability :{
        totalcopies: {
            type: Number,
            min: 1,
            default: 1,
            required: true
        },
        availableCopies : {
            type: Number,
            required: true,
            min: 0
        },
        issuedCopies: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    location:{
        section: String, // e.g., "Fiction", "Science"
        shelf: String,   // e.g., "A1", "B3"
        floor:String     // e.g., "Ground", "2nd"
    },
    tags: [String],
    rating :{
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        count: {
            type: Number,
            default:0
        }
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    isActive :{  // soft delete. Books can be marked inactive instead of permanently deleted
        type: Boolean,
        default: true
    },
    featured: { // marks books to display on the homepage/featured section
        type:Boolean,
        dafault: false
    },
}, {
    timestamps: true // Auto-adds createdAt and updatedAt
})

// Check if the book is available
//At least 1 copy is available on the shelf, AND
//The book is active 

bookSchema.methods.isAvailable = function(){
    return this.availability.availableCopies > 0 && this.isActive;
};

// Issue a book 
bookSchema.methods.issueBook = function (){
    if (this.availability.availableCopies > 0) {
        this.availability.availableCopies -= 1;
        this.availability.issuedCopies += 1;
        return this.save();
    }
    throw new Error ('Book not available');
};

//Return a Book

bookSchema.methods.returnBook = function (){
    if (this.availability.issuedCopies > 0){
        this.availability.availableCopies += 1;
        this.availability.issuedCopies -+1;
        return this.save();
    }
    throw new Error ('Book not eligible to be retuned');
}

module.exports = mongoose.model('Book', bookSchema);