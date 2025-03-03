
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ChevronRight, Globe, FileText, Upload } from "lucide-react";
import { ExtractedURL } from "@/services/URLExtractor";

interface SourceInputProps {
  onExtract: (urls: ExtractedURL[]) => void;
  isLoading: boolean;
}

export function SourceInput({ onExtract, isLoading }: SourceInputProps) {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState("website");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onExtract([{ url: url, sourceType: "website", sourceDescription: "Pending extraction..." }]);
    }
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onExtract([{ 
        url: "Processing file...", 
        sourceType: file.type.includes('pdf') ? 'pdf' : 'file', 
        sourceDescription: `Processing ${file.name}...` 
      }]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-panel animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">URL Harvester</CardTitle>
        <CardDescription className="text-center">
          Extract URLs from websites, PDFs, and files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Upload File</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="website" className="mt-0">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 mt-4 gap-2" 
                disabled={isLoading || !url.trim()}
              >
                Extract URLs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="file" className="mt-0">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload PDF or text file</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => document.getElementById('file')?.click()}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {fileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, TXT, CSV, HTML
                  </p>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.txt,.csv,.html"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 mt-4 gap-2" 
                disabled={isLoading || !file}
              >
                Extract URLs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
