import mongoose from 'mongoose';

const codeblockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    solution: {
        type: String,
        required: true,
    },
}, { collection: 'Codeblocks' });

const Codeblock = mongoose.model('Codeblock', codeblockSchema);

export default Codeblock;
