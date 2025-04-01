
import ImageProcessor from '@/components/ImageProcessor';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Image Processing Studio</h1>
        <p className="text-xl text-gray-600 mt-2">Edit, enhance and transform your images with powerful tools</p>
      </div>
      <ImageProcessor />
    </div>
  );
};

export default Index;
