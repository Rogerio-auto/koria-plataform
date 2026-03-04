/**
 * Logo upload component — drag & drop or click to upload.
 * TODO: Implement with react-dropzone, file size validation, preview.
 */
export function LogoUpload() {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border">
      <p className="text-sm text-muted-foreground">
        Drag & drop logo here or click to upload
      </p>
    </div>
  );
}
