import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

const FileUpload = ({
  onFilesSelected = () => {},
  maxFiles = 6,
  acceptedTypes = ["image/*", "video/*"],
  files: externalFiles,
  setFiles: setExternalFiles,
  uploading = false,
}) => {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with external files if provided
  useEffect(() => {
    if (externalFiles) {
      setFiles(externalFiles);
    }
  }, [externalFiles]);

  const handleFileSelect = (newFiles) => {
    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = fileArray.filter((file) => {
      const isValidType = acceptedTypes.some((type) => {
        if (type === "image/*") return file.type.startsWith("image/");
        if (type === "video/*") return file.type.startsWith("video/");
        return file.type === type;
      });

      if (!isValidType) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 50MB)`);
        return false;
      }

      file.preview = URL.createObjectURL(file);
      return true;
    });

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      setExternalFiles?.(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  };

  const removeFile = (index) => {
    const removed = files[index];
    URL.revokeObjectURL(removed.preview);
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setExternalFiles?.(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith("image/")) {
      return (
        <img
          src={file.preview}
          alt={file.name}
          className="w-16 h-16 object-cover rounded"
          loading="lazy"
          onError={(e) =>
            (e.currentTarget.src = "https://placehold.co/200x200?text=No+Image")
          }
        />
      );
    }
    if (file.type.startsWith("video/")) {
      return (
        <video
          src={file.preview}
          className="w-16 h-16 object-cover rounded"
          controls
          onError={(e) => (e.currentTarget.src = "")}
        />
      );
    }
    return <AlertCircle className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Upload up to {maxFiles} images or videos (max 50MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Choose Files"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="font-medium text-gray-700">
              Selected Files ({files.length}/{maxFiles})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getFilePreview(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

FileUpload.propTypes = {
  onFilesSelected: PropTypes.func,
  maxFiles: PropTypes.number,
  acceptedTypes: PropTypes.array,
  files: PropTypes.array,
  setFiles: PropTypes.func,
  uploading: PropTypes.bool,
};

export default FileUpload;
