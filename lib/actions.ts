'use server'

export async function createVirtualClone(formData: {
    title: string;
    description: string;
    file: File;
}) {
    console.log('Server action called with:', formData);
    return '12314532453425'; // Temporary ID, to be changed later
}
