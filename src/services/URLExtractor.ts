
import * as XLSX from 'xlsx';

export interface ExtractedURL {
  url: string;
  sourceType: 'website' | 'pdf' | 'file';
  sourceDescription: string;
}

export class URLExtractor {
  private static urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;

  /**
   * Extract URLs from a website by URL
   */
  static async extractFromWebsite(url: string): Promise<ExtractedURL[]> {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('Failed to fetch website content');
      }
      
      const urls = this.extractURLsFromText(data.contents);
      return urls.map(extractedUrl => ({
        url: extractedUrl,
        sourceType: 'website',
        sourceDescription: `Extracted from ${url}`
      }));
    } catch (error) {
      console.error('Error extracting URLs from website:', error);
      throw new Error('Failed to extract URLs from website');
    }
  }

  /**
   * Extract URLs from uploaded file content
   */
  static async extractFromFile(file: File): Promise<ExtractedURL[]> {
    try {
      const sourceType = file.type.includes('pdf') ? 'pdf' : 'file';
      const content = await this.readFileAsText(file);
      const urls = this.extractURLsFromText(content);
      
      return urls.map(extractedUrl => ({
        url: extractedUrl,
        sourceType,
        sourceDescription: `Extracted from ${file.name}`
      }));
    } catch (error) {
      console.error('Error extracting URLs from file:', error);
      throw new Error('Failed to extract URLs from file');
    }
  }

  /**
   * Read file content as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Extract URLs from text content
   */
  private static extractURLsFromText(text: string): string[] {
    const matches = text.match(this.urlRegex) || [];
    const uniqueUrls = Array.from(new Set(matches));
    
    return uniqueUrls.map(url => {
      // Ensure URLs start with http:// or https://
      if (url.startsWith('www.')) {
        return `https://${url}`;
      }
      return url;
    });
  }

  /**
   * Generate Excel file from extracted URLs
   */
  static generateExcel(data: ExtractedURL[]): Blob {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extracted URLs');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}
