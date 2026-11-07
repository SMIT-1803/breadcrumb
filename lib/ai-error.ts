export class AiServiceError extends Error{constructor(message:string,public code:string){super(message);}}
export function aiFailureMessage(error:unknown){return error instanceof AiServiceError?error.message:'Gemini could not finish this reminder. Your saved originals are available below.';}
