import { Box, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

export default function VideoPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { movie } = router.query;
  axios.get(`/api/checkFile?fileName=${movie}`).then((res) => {
    if (!res.data.exists) {
      setError("Invalid URL");
    }
  });
  return (
    <Box>
      <Typography color="white">{movie}</Typography>
      <video
        src={`/api/video?videoName=${movie}`}
        width={"100%"}
        height={"auto"}
        controls
        autoPlay
        id="video-player"
      />
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { query: context.query },
  };
};
