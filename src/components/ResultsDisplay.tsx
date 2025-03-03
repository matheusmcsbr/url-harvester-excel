
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, RefreshCw, ExternalLink, Clipboard } from "lucide-react";
import { ExtractedURL, URLExtractor } from "@/services/URLExtractor";
import { useToast } from "@/components/ui/use-toast";

interface ResultsDisplayProps {
  results: ExtractedURL[];
  onClear: () => void;
  isLoading: boolean;
}

export function ResultsDisplay({ results, onClear, isLoading }: ResultsDisplayProps) {
  const { toast } = useToast();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleExportExcel = () => {
    if (results.length === 0) return;
    
    try {
      const blob = URLExtractor.generateExcel(results);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extracted_urls.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Your Excel file has been downloaded",
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting to Excel",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      toast({
        title: "URL copied",
        description: "The URL has been copied to clipboard",
        duration: 1500,
      });
      
      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (results.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 glass-panel animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Extracted URLs</CardTitle>
            <CardDescription>
              {isLoading 
                ? "Processing your request..."
                : `${results.length} URLs found`}
            </CardDescription>
          </div>
          {isLoading ? (
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-sm"
            >
              Clear results
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-background/90 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[50%]">URL</TableHead>
                <TableHead>Source Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm truncate max-w-[200px] md:max-w-[300px]">
                    {item.url}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      item.sourceType === 'website' ? 'default' :
                      item.sourceType === 'pdf' ? 'secondary' : 'outline'
                    }>
                      {item.sourceType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.sourceDescription}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(item.url, index)}
                        title="Copy URL"
                      >
                        <Clipboard className={`h-4 w-4 ${copiedIndex === index ? 'text-green-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openUrl(item.url)}
                        title="Open URL"
                        disabled={!item.url.startsWith('http')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between p-4">
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Processing..." : `${results.length} URLs extracted`}
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={results.length === 0 || isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </CardFooter>
    </Card>
  );
}
