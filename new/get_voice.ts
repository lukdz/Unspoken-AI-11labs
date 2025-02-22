import { ElevenLabsClient } from "elevenlabs";
import * as fs from "fs";

async function addVoice(filePath: string, voiceName: string = "Alex"): Promise<string> {
    const client = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY });
    
    try {
        const response = await client.voices.add({
            files: [fs.createReadStream(filePath)],
            name: voiceName
        });
        return response.voice_id;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to add voice: ${errorMessage}`);
    }
}

// Example usage:
// const voiceId = await addVoice("/path/to/your/file", "Custom Voice Name");
// console.log(voiceId); // Will print the VOICE_ID