"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Image from "next/image";
import { Box, CircularProgress, Typography } from "@mui/material";

// Interfaces
interface Slide {
  imageUrl: string;
  storagePath: string;
}

interface Slideshow {
  id: string;
  title: string;
  slides: Slide[];
}

export default function SlideshowPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const fetchSlideshow = async () => {
      try {
        const docRef = doc(db, "slideshows", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSlideshow({ id: docSnap.id, ...docSnap.data() } as Slideshow);
        } else {
          console.log("Apresentação não encontrada.");
        }
      } catch (error) {
        console.error("Erro ao carregar apresentação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlideshow();
  }, [id]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!slideshow) return;
    if (e.key === "ArrowRight") {
      setCurrentSlideIndex((prev) =>
        prev < slideshow.slides.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowLeft") {
      setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Escape") {
      router.push("/admin/slides");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!slideshow) {
    return <Typography sx={{ p: 3 }}>Apresentação não encontrada.</Typography>;
  }

  const currentSlide = slideshow.slides[currentSlideIndex];

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Image
        src={currentSlide.imageUrl}
        alt={`Slide ${currentSlideIndex + 1}`}
        fill
        sizes="100vw"
        style={{ objectFit: "contain" }}
        priority
      />
    </Box>
  );
}
