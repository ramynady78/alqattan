import { useState } from "react";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { toImageUrl } from "@/lib/imageUrl";
import { validateImageFile } from "@/lib/uploadValidation";

interface ImageUploaderProps {
  value: string | null;
  onChange: (path: string | null) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className = "" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const requestUpload = useRequestUploadUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const { uploadURL, objectPath } = await requestUpload.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          contentType: file.type,
        }
      });

      // 2. Upload to storage
      const res = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");

      onChange(objectPath);
    } catch (error) {
      console.error(error);
      toast.error("فشل رفع الصورة");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted group">
          <img src={toImageUrl(value)} alt="Uploaded" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button type="button" variant="destructive" size="icon" onClick={() => onChange(null)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors relative">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <UploadCloud className="h-10 w-10 mb-2 opacity-50" />
              <span className="text-sm font-medium">اضغط لرفع صورة</span>
            </>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}
    </div>
  );
}
