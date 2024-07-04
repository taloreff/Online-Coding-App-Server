import express from 'express'
import { getCodeblock, getCodeblocks } from './codeblocks.controller.js'

const router = express.Router()

router.get('/', getCodeblocks)
router.get('/:codeblockId', getCodeblock)

export const codeblocksRoutes = router