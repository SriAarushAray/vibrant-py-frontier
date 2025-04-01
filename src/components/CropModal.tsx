
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Canvas, Object as FabricObject } from 'fabric';
import { Crop, Save, X } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onSave: (croppedImageUrl: string) => void;
}

const CropModal = ({ isOpen, onClose, imageUrl, onSave }: CropModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [cropRect, setCropRect] = useState<FabricObject | null>(null);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && canvasRef.current && imageUrl) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 700,
        height: 500,
      });

      // Load image to canvas
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale image to fit canvas
        const canvasRatio = fabricCanvas.width! / fabricCanvas.height!;
        const imgRatio = img.width! / img.height!;
        
        let scaleFactor;
        if (canvasRatio > imgRatio) {
          scaleFactor = (fabricCanvas.height! - 40) / img.height!;
        } else {
          scaleFactor = (fabricCanvas.width! - 40) / img.width!;
        }
        
        img.scale(scaleFactor);
        
        // Center the image
        img.set({
          left: (fabricCanvas.width! - img.width! * scaleFactor) / 2,
          top: (fabricCanvas.height! - img.height! * scaleFactor) / 2,
          selectable: false,
        });
        
        fabricCanvas.add(img);
        fabricCanvas.renderAll();
        
        // Add crop rectangle - initially sized to 50% of image
        const rect = new fabric.Rect({
          left: img.left! + img.width! * scaleFactor * 0.25,
          top: img.top! + img.height! * scaleFactor * 0.25,
          width: img.width! * scaleFactor * 0.5,
          height: img.height! * scaleFactor * 0.5,
          fill: 'rgba(0,0,0,0.1)',
          stroke: '#2563eb',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          transparentCorners: false,
          cornerColor: '#2563eb',
          cornerStrokeColor: '#ffffff',
          cornerSize: 10,
          lockRotation: true,
        });
        
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
        setCropRect(rect);
        setCanvas(fabricCanvas);
      });
      
      return () => {
        fabricCanvas.dispose();
        setCanvas(null);
        setCropRect(null);
      };
    }
  }, [isOpen, imageUrl]);

  const handleCrop = () => {
    if (!canvas || !cropRect) return;
    
    const rect = cropRect as fabric.Rect;
    const imgInstance = canvas.getObjects().find(obj => obj.type === 'image') as fabric.Image;
    
    if (!imgInstance) return;
    
    // Create temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    const scaleX = imgInstance.scaleX || 1;
    const scaleY = imgInstance.scaleY || 1;
    
    // Calculate positions relative to the image
    const left = Math.max(0, (rect.left! - imgInstance.left!) / scaleX);
    const top = Math.max(0, (rect.top! - imgInstance.top!) / scaleY);
    const width = Math.min(rect.width! * rect.scaleX! / scaleX, imgInstance.width! - left);
    const height = Math.min(rect.height! * rect.scaleY! / scaleY, imgInstance.height! - top);
    
    // Set temp canvas dimensions to the crop size
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // Create a new image element from the original image
    const img = new Image();
    img.onload = () => {
      // Draw the cropped portion to the temp canvas
      tempCtx.drawImage(
        img,
        left / imgInstance.scaleX!,
        top / imgInstance.scaleY!,
        width / imgInstance.scaleX!,
        height / imgInstance.scaleY!,
        0, 0,
        width,
        height
      );
      
      // Get the data URL from the temp canvas
      const dataUrl = tempCanvas.toDataURL('image/png');
      onSave(dataUrl);
      onClose();
    };
    
    img.src = imageUrl!;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" /> Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-hidden border rounded-md bg-gray-50 relative">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleCrop}>
            <Save className="mr-2 h-4 w-4" /> Crop & Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CropModal;
