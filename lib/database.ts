'use server'

import { createClient } from '@supabase/supabase-js'
import { Persona } from './types'

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
)

export async function addPersona(persona: Omit<Persona, 'created_at'>): Promise<Persona | null> {
    const { data, error } = await supabase
        .from('Personas')
        .insert([persona])
        .select()
        .single()

    if (error) {
        console.error('Error inserting persona:', error)
        return null
    }

    return data
}

export async function getPersona(id: string): Promise<Persona | null> {
    const { data, error } = await supabase
        .from('Personas')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching persona:', error)
        return null
    }

    return data
}

