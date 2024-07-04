import mongoose from 'mongoose';
import Codeblock from '../../models/codeblockModel.js';

export const getCodeblocks = async (req, res) => {
    try {
        const codeblocks = await Codeblock.find();
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Fetched codeblocks:', codeblocks);
        res.send(codeblocks);
    } catch (error) {
        console.error('Error fetching codeblocks:', error);
        res.status(500).send({ error: 'Failed to fetch codeblocks' });
    }
};

export const getCodeblock = async (req, res) => {
    try {
        const { codeblockId } = req.params;
        const codeblock = await Codeblock.findById(codeblockId);

        if (!codeblock) {
            return res.status(404).send({ error: 'Codeblock not found' });
        }

        res.send(codeblock);
    } catch (error) {
        console.error('Error fetching codeblock:', error);
        res.status(500).send({ error: 'Failed to fetch codeblock' });
    }
};
