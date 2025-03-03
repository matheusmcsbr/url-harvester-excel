
import { useState, useEffect } from "react";
import { SourceInput } from "@/components/SourceInput";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { URLExtractor, ExtractedURL } from "@/services/URLExtractor";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [extractedUrls, setExtractedUrls] = useState<ExtractedURL[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Optional cleanup on unmount
    return () => {
      if (isLoading) {
        console.log("Component unmounted, cancelling any pending operations");
      }
    };
  }, [isLoading]);

  const handleExtractFromWebsite = async (url: string) => {
    setIsLoading(true);
    try {
      const results = await URLExtractor.extractFromWebsite(url);
      setExtractedUrls(results);
      
      toast({
        title: "URLs extracted successfully",
        description: `Found ${results.length} URLs from the website`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error extracting URLs from website:", error);
      
      toast({
        title: "Extraction failed",
        description: "Failed to extract URLs from the website",
        variant: "destructive",
        duration: 3000,
      });
      
      setExtractedUrls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractFromFile = async (file: File) => {
    setIsLoading(true);
    try {
      const results = await URLExtractor.extractFromFile(file);
      setExtractedUrls(results);
      
      toast({
        title: "URLs extracted successfully",
        description: `Found ${results.length} URLs from ${file.name}`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Error extracting URLs from file:", error);
      
      toast({
        title: "Extraction failed",
        description: "Failed to extract URLs from the file",
        variant: "destructive",
        duration: 3000,
      });
      
      setExtractedUrls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = (urls: ExtractedURL[]) => {
    if (urls.length === 0) return;
    
    const firstItem = urls[0];
    
    if (firstItem.sourceType === 'website') {
      handleExtractFromWebsite(firstItem.url);
    } else {
      // This is a placeholder. The actual file should be passed from SourceInput
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput?.files && fileInput.files[0]) {
        handleExtractFromFile(fileInput.files[0]);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight mb-2">URL Harvester</h1>
        <p className="text-muted-foreground max-w-2xl">
          Extract URLs from websites, PDFs, and files and export them to Excel
        </p>
      </header>
      
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center space-y-8">
        <SourceInput onExtract={handleExtract} isLoading={isLoading} />
        
        <ResultsDisplay 
          results={extractedUrls} 
          onClear={() => setExtractedUrls([])} 
          isLoading={isLoading} 
        />
      </div>
      
      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-muted-foreground">
        <p>URL Harvester — Extract and organize URLs from any source</p>
      </footer>
    </div>
  );
};

export default Index;
