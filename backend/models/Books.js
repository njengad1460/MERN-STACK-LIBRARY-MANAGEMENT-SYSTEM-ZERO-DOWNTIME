const mongoose = require("mongoose")

const bookSchema = new mongoose.bookSchema ({
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
    isbn : {
        type : String,
        unique: true,
        sparse : true,
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
    coverImage :{
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
        section: String,
        shelf: String,
        floor:String
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
    isActive :{
        type: Boolean,
        default: true
    },
    featured: {
        type:Boolean,
        dafault: false
    },
}, {
    timestamps: true
})

// Check if the book is available

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