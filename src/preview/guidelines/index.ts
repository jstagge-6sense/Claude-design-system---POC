import type { Guidelines } from '../guidelines'
import { BATCH_1 } from './batch1'
import { BATCH_2 } from './batch2'
import { BATCH_3 } from './batch3'
import { BATCH_4 } from './batch4'
import { BATCH_5 } from './batch5'
import { BATCH_6 } from './batch6'
export const BATCH_GUIDELINES: Record<string, Guidelines> = { ...BATCH_1, ...BATCH_2, ...BATCH_3, ...BATCH_4, ...BATCH_5, ...BATCH_6 }
