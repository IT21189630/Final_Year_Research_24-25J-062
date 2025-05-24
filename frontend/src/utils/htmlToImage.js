import html2canvas from 'html2canvas';

export const captureHtmlToImage = async (element) => {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      scale: 2 // Higher resolution
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing HTML to image:', error);
    throw error;
  }
};