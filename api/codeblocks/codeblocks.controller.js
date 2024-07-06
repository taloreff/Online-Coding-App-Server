import { codeblocksService } from './codeblocks.service.js';

export const getCodeblocks = async (req, res) => {
    try {
        const filterBy = {
            title: req.query.title || ''
        }
        const codeblocks = await codeblocksService.query(filterBy);
        res.send(codeblocks);
    } catch (error) {
        console.error('Error fetching codeblocks:', error);
        res.status(500).send({ error: 'Failed to fetch codeblocks' });
    }
};

export const getCodeblock = async (req, res) => {
    try {
        const { codeblockId } = req.params;
        const codeblock = await codeblocksService.getById(codeblockId);
        if (!codeblock) {
            return res.status(404).send({ error: 'Codeblock not found' });
        }

        res.send(codeblock);
    } catch (error) {
        console.error('Error fetching codeblock:', error);
        res.status(500).send({ error: 'Failed to fetch codeblock' });
    }
};

// logger service
// filter