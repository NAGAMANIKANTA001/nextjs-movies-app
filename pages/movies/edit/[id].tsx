import { Button, Container, Paper, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import {
  useQuery,
  withWunderGraph,
  useMutation,
} from "../../../components/generated/nextjs";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/router";

const EditMovie = () => {
  const [title, setTitle] = useState();
  const [country, setCountry] = useState();
  const [rating, setRating] = useState();
  const [duration, setDuration] = useState(0);
  const router = useRouter();
  const { data, trigger } = useMutation({
    operationName: "movies/Update",
  });

  // if(movie.data?.mongodb_findFirstmovies) {
  //     const {title:_title, origin_country:_country, duration:_duration,rating:_rating} = movie.data?.mongodb_findFirstmovies;
  // setTitle(_title);
  // setCountry(_country);
  // setDuration(_duration);
  // setRating(_rating);
  // }
  const { data: movie, isLoading } = useQuery({
    operationName: "movies/MovieWithID",
    input: { id: router.query.id },
  });
  useEffect(() => {
    let movieData = { ...movie?.mongodb_findFirstmovies };
    console.log("Use Effect");
    console.log(isLoading);
    console.log(movieData);
    if (!isLoading) {
      console.log(movieData);
      handleChange({ target: { value: movieData.title } }, "title");
      handleChange({ target: { value: movieData.origin_country } }, "country");
      handleChange({ target: { value: movieData.rating } }, "rating");
      handleChange({ target: { value: movieData.duration } }, "duration");
    }
  }, [isLoading]);

  const handleChange = (ev: any, field: string) => {
    switch (field) {
      case "title":
        setTitle(ev.target.value);
        break;
      case "country":
        setCountry(ev.target.value);
        break;
      case "rating":
        setRating(ev.target.value);
        break;
      case "duration":
        setDuration(parseInt(ev.target.value));
    }
  };
  const handleSubmit = async () => {
    if (title == null || `${title}`.trim().length == 0) {
      alert("Title Can't be empty !!!");
    } else {
      let res = await trigger({
        data: {
          title: { set: title },
          duration: { set: duration },
          rating: { set: rating },
          origin_country: { set: country },
        },
        id: { id: router.query.id },
      });

      if (res) {
        console.log(res);
        router.push("/");
      }
    }
  };
  return (
    <Container sx={{ backgroundColor: "#fff" }}>
      <Box sx={{ marginX: "auto" }}>
        <Typography variant="h3" component={"h2"}>
          Edit Movie Details
        </Typography>
      </Box>
      <Paper elevation={3}>
        <Stack marginTop={3} gap={3} padding={3}>
          <TextField
            value={title || ""}
            onChange={(ev) => {
              handleChange(ev, "title");
            }}
            label="Movie Title"
            variant="outlined"
          />
          <TextField
            value={country || ""}
            onChange={(ev) => {
              handleChange(ev, "country");
            }}
            label="Country of Origin"
            variant="outlined"
          />
          <TextField
            value={rating || ""}
            onChange={(ev) => {
              handleChange(ev, "rating");
            }}
            label="MPAA rating"
            variant="outlined"
          />
          <TextField
            value={duration || ""}
            onChange={(ev) => {
              handleChange(ev, "duration");
            }}
            type="number"
            label="Duration (in mins)"
            variant="outlined"
          />
          <Button onClick={handleSubmit} color="primary" variant="outlined">
            Update
          </Button>
          <Button
            onClick={() => {
              router.push("/");
            }}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default withWunderGraph(EditMovie);
