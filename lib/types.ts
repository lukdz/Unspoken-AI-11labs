
'use server'

export interface Persona {
    id: string;  // uuid
    created_at: Date;  // timestamp with time zone
    voice_id: string;  // text
    person_name: string;  // text
    source_text: string;  // text
    system_prompt: string;  // text
    agent_id: string;  // text
}