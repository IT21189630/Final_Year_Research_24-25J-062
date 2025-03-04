const mongoose = require("mongoose");

const SnippetSchema = mongoose.Schema(
{
    user_id: {
        type: String,
        required: true
    },
    htmlCode: {
        type: String,
        required: true
    },

    cssCode: {
        type: String
    },

    jsCode: {
        type: String,
    },
    codeName: {
        type: String,
        required: true
    }
    
});

module.exports = mongoose.model("Code", SnippetSchema);