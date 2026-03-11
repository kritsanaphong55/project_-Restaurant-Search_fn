"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  label?: string;
  onFileChange: (file: File | null) => void;
};

export default function ImageDropUploader({
  label = "ลากไฟล์รูปมาวางที่นี่ หรือกดเพื่อเลือกไฟล์",
  onFileChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const setSelectedFile = (selected: File | null) => {
    setFile(selected);
    onFileChange(selected);

    setPreviewUrl((oldUrl) => {
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }

      return selected ? URL.createObjectURL(selected) : null;
    });
  };

  const clearFile = () => {
    setSelectedFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          const dropped = e.dataTransfer.files?.[0] || null;
          if (dropped && dropped.type.startsWith("image/")) {
            setSelectedFile(dropped);
          }
        }}
        style={{
          border: dragging ? "2px dashed #2563eb" : "2px dashed #ccc",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "#eff6ff" : "#fafafa",
          transition: "all 0.2s",
        }}
      >
        <div>{label}</div>
        <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
          รองรับ .jpg, .jpeg, .png, .gif, .webp (สูงสุด 5MB)
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />

      {file && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <span>
              ไฟล์ที่เลือก: <b>{file.name}</b>
            </span>

            <button
              type="button"
              onClick={clearFile}
              style={{
                padding: "2px 10px",
                background: "crimson",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕ ลบ
            </button>
          </div>

          {previewUrl && (
            <Image
              src={previewUrl}
              alt="preview"
              width={260}
              height={180}
              unoptimized
              style={{
                width: 260,
                maxWidth: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}