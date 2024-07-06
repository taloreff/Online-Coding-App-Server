import mongoose from 'mongoose';
import Codeblock from '../../models/codeblockModel.js';

export const codeblocksService = {
    query,
    getById,
}

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const codeblocks = await Codeblock.find(criteria);
        console.log("codeblocks", codeblocks);
        return codeblocks;
    } catch (error) {
        console.error('Error fetching codeblocks:', error);
        throw error;
    }
}


async function getById(codeblockId) {
    try {
        const codeblock = await Codeblock.findById(codeblockId);
        return codeblock;
    } catch (error) {
        console.error('Error fetching codeblock:', error);
        throw error;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title, $options: 'i' };
    }
    return criteria;
}