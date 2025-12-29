import { Box, Typography } from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase-client"

/* ---------------- Types ---------------- */

type Photo = {
  url: string
}

/* ---------------- Constants ---------------- */

const AUTO_ADVANCE_MS = 6000
const SWIPE_THRESHOLD = 80

/* ---------------- Animation ---------------- */

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
}

/* ---------------- Component ---------------- */

export function IdleScreen() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [[index, direction], setIndex] = useState<[number, number]>([0, 1])

  /* ---------- Load photos ---------- */

  useEffect(() => {
    const loadPhotos = async () => {
      const { data, error } = await supabase.storage
        .from("photos")
        .list("", { limit: 50 })

      if (error) {
        console.error(error)
        return
      }

      const mapped =
        data
          ?.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f.name))
          .map((f) => ({
            url: supabase.storage
              .from("photos")
              .getPublicUrl(f.name).data.publicUrl,
          })) ?? []

      setPhotos(mapped)
    }

    loadPhotos()
  }, [])

  /* ---------- Auto advance ---------- */

  useEffect(() => {
    if (!photos.length) return
    const t = setInterval(() => paginate(1), AUTO_ADVANCE_MS)
    return () => clearInterval(t)
  }, [photos])

  const paginate = (dir: number) => {
    setIndex(([prev]) => [
      (prev + dir + photos.length) % photos.length,
      dir,
    ])
  }

  if (!photos.length) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "black",
          zIndex: 9999,
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "black",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 90, damping: 26 },
            opacity: { duration: 0.4 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) paginate(1)
            if (info.offset.x > SWIPE_THRESHOLD) paginate(-1)
          }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* ✅ SINGLE IMAGE, FIT ONLY */}
          <Box
            component="img"
            src={photos[index].url}
            alt=""
            draggable={false}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "100%",
              height: "100%",
              objectFit: "contain", // ← THIS IS IT
              userSelect: "none",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* ---------- Overlay text ---------- */}
      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          right: 32,
          textAlign: "right",
          color: "white",
        }}
      >
        <Typography variant="h3" fontWeight={600}>
          8:30 PM
        </Typography>
        <Typography variant="body1">
          PST · Monday, Nov 30
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Vancouver
        </Typography>
      </Box>
    </Box>
  )
}
