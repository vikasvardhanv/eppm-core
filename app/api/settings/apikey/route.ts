import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const { apiKey } = await request.json();
    const envPath = path.join(process.cwd(), '.env');
    
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8');
    }
    
    if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY="${apiKey}"`);
    } else {
        content += `\nGEMINI_API_KEY="${apiKey}"\n`;
    }
    
    fs.writeFileSync(envPath, content);
    return NextResponse.json({ success: true });
}
