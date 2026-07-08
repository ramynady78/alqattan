import { useState } from "react";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { toImageUrl } from "@/lib/imageUrl";
import { validateImageFile } from "@/lib/uploadValidation";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (paths: string[]) => void;
}

export function MultiImageUploader({ value = [], onChange }: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const requestUpload = useRequestUploadUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalidFile = files.find((file) => validateImageFile(file));
    if (invalidFile) {
      toast.error(validateImageFile(invalidFile) ?? "يسمح فقط برفع ملفات الصور");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const newPaths: string[] = [];

    try {
      for (const file of files) {
        const { uploadURL, objectPath } = await requestUpload.mutateAsync({
          data: {
            name: file.name,
            size: file.size,
            contentType: file.type,
          }
        });

        const res = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!res.ok) throw new Error("Upload failed");
        newPaths.push(objectPath);
      }
      
      onChange([...value, ...newPaths]);
    } catch (error) {
      console.error(error);
      toast.error("فشل رفع بعض أو كل الصور");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newArr = [...value];
    newArr.splice(index, 1);
    onChange(newArr);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...value];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;
    onChange(newArr);
  };

  const moveDown = (index: number) => {
    if (index === value.length - 1) return;
    const newArr = [...value];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;
    onChange(newArr);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((path, i) => (
            <div key={i} className="relative aspect-square rounded-lg border bg-muted group overflow-hidden">
              <img src={toImageUrl(path)} alt={`img-${i}`} className="w-full h-full object-cover" />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <Button type="button" variant="secondary" size="icon" className="h-7 w-7" onClick={() => moveUp(i)} disabled={i === 0}>↑</Button>
                  <Button type="button" variant="secondary" size="icon" className="h-7 w-7" onClick={() => moveDown(i)} disabled={i === value.length - 1}>↓</Button>
                </div>
                <div className="flex justify-center">
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeImage(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {i === 0 && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-bold">
                  الرئيسية
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors relative">
        {isUploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>جاري الرفع...</span>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm font-medium">اضغط لرفع صور (يمكنك اختيار عدة صور)</span>
          </>
        )}
        <input 
          type="file" 
          accept="image/*" 
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
