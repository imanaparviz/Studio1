
import { NextResponse, type NextRequest } from 'next/server';
import sharp from 'sharp';
import { optimize } from 'svgo'; // Added SVGO import

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { svg_content, format, filename = 'diagram' } = body;

    if (!svg_content) {
      return NextResponse.json({ error: 'No SVG content received' }, { status: 400 });
    }
    
    // Optimize SVG content using SVGO on the server
    const optimizedSvgResult = optimize(svg_content, {
        multipass: true,
        plugins: [
            { name: 'preset-default' },
            { name: 'removeXMLProcInst' },
            { name: 'removeDoctype' },
        ]
    });
    const optimizedSvg = optimizedSvgResult.data;

    const svgBuffer = Buffer.from(optimizedSvg); // Use optimized SVG for buffer

    let outputBuffer: Buffer;
    let mimetype: string;
    let downloadFilename: string;

    if (format === 'png') {
      outputBuffer = await sharp(svgBuffer, { density: 150 }).png().toBuffer();
      mimetype = 'image/png';
      downloadFilename = `${filename}.png`;
    } else if (format === 'pdf') {
      // Placeholder for PDF, actual implementation would be complex
      return NextResponse.json(
        { error: 'Server-side PDF export from SVG is not implemented in this basic example. Consider Puppeteer or jsPDF on client.' },
        { status: 501 } // Not Implemented
      );
    } else {
      return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Content-Type', mimetype);
    headers.set('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');


    return new NextResponse(outputBuffer, {
      status: 200,
      headers: headers,
    });

  } catch (error: any) {
    console.error('Export API Error:', error);
    return NextResponse.json(
        { error: error.message || 'Server error during export' },
        { status: 500 }
    );
  }
}
