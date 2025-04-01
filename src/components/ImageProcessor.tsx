
import { useState, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Upload, Image as ImageIcon, Sliders, Trash2, Zap, FileImage, Layers, RefreshCw, Loader, Crop, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import CropModal from './CropModal';

const ImageProcessor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    blur: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    noiseReduction: 0
  });

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const imgUrl = event.target?.result as string;
        setOriginalImage(imgUrl);
        setDisplayedImage(imgUrl);
        
        // Reset filters
        setFilters({
          blur: 0,
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpness: 0,
          noiseReduction: 0
        });
        
        toast({
          title: "Image Uploaded",
          description: "Your image has been uploaded successfully."
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (filterType: string) => {
    if (!originalImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);

      switch (filterType) {
        case 'bw':
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
          break;
          
        case 'negative':
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            d[i] = 255 - d[i];
            d[i + 1] = 255 - d[i + 1];
            d[i + 2] = 255 - d[i + 2];
          }
          ctx.putImageData(imgData, 0, 0);
          break;
          
        case 'reset':
          setDisplayedImage(originalImage);
          return;
      }
      
      setDisplayedImage(canvas.toDataURL('image/png'));
      
      toast({
        title: "Filter Applied",
        description: `${filterType === 'bw' ? 'Black & White' : filterType === 'negative' ? 'Negative' : 'Custom'} filter has been applied.`
      });
    };
    img.src = originalImage;
  };

  const updateFilter = (type: string, value: number) => {
    if (!originalImage) return;
    
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
    
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.filter = `
        blur(${filters.blur * 0.5}px)
        brightness(${100 + filters.brightness}%)
        contrast(${100 + filters.contrast}%)
        saturate(${100 + filters.saturation}%)
        ${filters.sharpness > 0 ? `url(#sharpness)` : ''}
      `;
      
      ctx.drawImage(img, 0, 0);
      setDisplayedImage(canvas.toDataURL('image/png'));
    };
    img.src = originalImage;
  };
  
  const handleRemoveBackground = async () => {
    if (!originalImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      toast({
        title: "Processing",
        description: "Removing background... This may take a moment."
      });
      
      const img = new Image();
      img.src = originalImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const resultImageUrl = await removeBackground(img);
      
      setDisplayedImage(resultImageUrl);
      
      toast({
        title: "Background Removed",
        description: "Background has been removed successfully."
      });
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Error",
        description: "Failed to remove background. Please try again with a different image.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCropModal = () => {
    if (!originalImage) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }
    setIsCropModalOpen(true);
  };

  const handleSaveCroppedImage = (croppedImageUrl: string) => {
    setDisplayedImage(croppedImageUrl);
    // Also update original image to the cropped version so further edits use this as base
    setOriginalImage(croppedImageUrl);
    toast({
      title: "Image Cropped",
      description: "Your image has been cropped successfully."
    });
  };

  const handleSaveImage = () => {
    if (!displayedImage) {
      toast({
        title: "No Image",
        description: "There's no image to save.",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement("a");
    link.href = displayedImage;
    link.download = "processed-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image Saved",
      description: "Your image has been saved successfully."
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="text-2xl font-bold text-center">Image Processing Studio</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col items-center justify-center">
              {displayedImage ? (
                <div className="relative w-full aspect-square max-h-[500px] border rounded-lg overflow-hidden bg-gray-100">
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Loader className="h-8 w-8 animate-spin text-white" />
                        <p className="text-white font-medium">Processing...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={displayedImage}
                    alt="Processed"
                    className="object-contain w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square max-h-[500px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center p-6">
                    <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Upload an image to get started</p>
                  </div>
                </div>
              )}
              
              <div className="hidden">
                <canvas ref={canvasRef}></canvas>
              </div>

              {displayedImage && (
                <Button 
                  onClick={handleSaveImage}
                  variant="outline"
                  className="mt-4 flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Image
                </Button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-6">
              <Tabs defaultValue="basic">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">Basic Filters</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="p-4 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => applyFilter('bw')}
                      className="flex items-center gap-2"
                      disabled={!originalImage || isProcessing}
                    >
                      <FileImage size={18} />
                      Convert to B/W
                    </Button>
                    
                    <Button 
                      onClick={() => applyFilter('negative')}
                      className="flex items-center gap-2"
                      disabled={!originalImage || isProcessing}
                    >
                      <Layers size={18} />
                      Apply Negative
                    </Button>
                    
                    <Button 
                      onClick={handleOpenCropModal}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={!originalImage || isProcessing}
                    >
                      <Crop size={18} />
                      Crop Image
                    </Button>
                    
                    <Button 
                      onClick={() => applyFilter('reset')}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={!originalImage || isProcessing}
                    >
                      <RefreshCw size={18} />
                      Reset Image
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4 bg-gray-50 p-4 rounded-md">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-2"
                        disabled={!originalImage || isProcessing}
                      >
                        <Sliders size={18} />
                        Adjust Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Image Filters</SheetTitle>
                        <SheetDescription>
                          Adjust the filters to enhance your image.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Blur</span>
                            <span>{filters.blur}</span>
                          </div>
                          <Slider 
                            value={[filters.blur]} 
                            min={0} 
                            max={10} 
                            step={0.1} 
                            onValueChange={(value) => updateFilter('blur', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Brightness</span>
                            <span>{filters.brightness}</span>
                          </div>
                          <Slider 
                            value={[filters.brightness]} 
                            min={-50} 
                            max={50} 
                            step={1} 
                            onValueChange={(value) => updateFilter('brightness', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Contrast</span>
                            <span>{filters.contrast}</span>
                          </div>
                          <Slider 
                            value={[filters.contrast]} 
                            min={-50} 
                            max={50} 
                            step={1} 
                            onValueChange={(value) => updateFilter('contrast', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Saturation</span>
                            <span>{filters.saturation}</span>
                          </div>
                          <Slider 
                            value={[filters.saturation]} 
                            min={-50} 
                            max={100} 
                            step={1} 
                            onValueChange={(value) => updateFilter('saturation', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Sharpness</span>
                            <span>{filters.sharpness}</span>
                          </div>
                          <Slider 
                            value={[filters.sharpness]} 
                            min={0} 
                            max={50} 
                            step={1} 
                            onValueChange={(value) => updateFilter('sharpness', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        disabled={!originalImage || isProcessing}
                      >
                        <Zap size={18} />
                        Remove Noise
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Noise Reduction</SheetTitle>
                        <SheetDescription>
                          Adjust the noise reduction level.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Denoising Strength</span>
                            <span>{filters.noiseReduction}</span>
                          </div>
                          <Slider 
                            value={[filters.noiseReduction]} 
                            min={0} 
                            max={50} 
                            step={1} 
                            onValueChange={(value) => updateFilter('noiseReduction', value[0])} 
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TabsContent>
              </Tabs>
              
              <Separator />
              
              <div>
                <label 
                  htmlFor="upload" 
                  className="block w-full p-4 text-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition duration-300"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={24} className="text-gray-500 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Click to upload a new image</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG supported</span>
                  </div>
                  <input 
                    id="upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg,image/jpg,image/png" 
                    onChange={handleImageUpload} 
                    disabled={isProcessing}
                  />
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CropModal 
        isOpen={isCropModalOpen} 
        onClose={() => setIsCropModalOpen(false)}
        imageUrl={originalImage}
        onSave={handleSaveCroppedImage}
      />
    </div>
  );
};

export default ImageProcessor;
