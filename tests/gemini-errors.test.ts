import test from 'node:test';
import assert from 'node:assert/strict';
import {generateJson} from '../lib/gemini';
test('provider daily quota error is actionable and never exposes raw provider details',async()=>{const before=globalThis.fetch,key=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='test-only';globalThis.fetch=async()=>Response.json({error:{message:'private upstream content',details:[{violations:[{quotaId:'GenerateRequestsPerDayPerProjectPerModel-FreeTier'}]},{retryDelay:'31000s'}]}},{status:429});try{await assert.rejects(()=>generateJson('synthetic',{}),/daily.*limit/i);}finally{globalThis.fetch=before;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;}});
