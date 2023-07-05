import { Button, Container, LinearProgress, Paper, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { ChangeEvent, useRef, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useQuery, withWunderGraph, useMutation } from '../../components/generated/nextjs';
import { redirect } from 'next/dist/server/api-utils';
import { useRouter } from 'next/router';
import axios, { AxiosRequestConfig } from 'axios';
const lodash = require('lodash');


const AddMovie = () => {
    const [title, setTitle] = useState();
    const [country, setCountry] = useState();
    const [rating, setRating] = useState();
    const [duration, setDuration] = useState(0);
    const [file,setFile] = useState<File | null>(null);
    const [uploadProgress,setUploadProgress] = useState(0);
    const [uploadError,setUploadError] = useState(null);
    const [submitting,setSubmitting] = useState(false);

    const router = useRouter()
    const { data, trigger } = useMutation({
        operationName: "movies/Add"
    });

    const handleChange = (ev: any, field: string) => {
        switch (field) {
            case "title": setTitle(ev.target.value); break;
            case "country": setCountry(ev.target.value); break;
            case "rating": setRating(ev.target.value); break;
            case "duration": setDuration(parseInt(ev.target.value))
        }
    }
    const handleSubmit = async () => {
        if (title == null || `${title}`.trim().length == 0) {
            alert("Title Can't be empty !!!");
        } else {
            const formData = new FormData();
            if(!file) {
                alert("Movie File is Mandatory !!");
                return;
            }
            setSubmitting(true);
            const x= file.name.split(".");
            const extension = x[x.length-1];
            let newTitle = `${title}.${extension}`;
            let validName = false;
            let suffix = 1;
            while(!validName) {
                const res = await axios.get(`/api/checkFile?fileName=${newTitle}`);
                if(res.data.exists) {
                    newTitle = `${title}_${suffix}.${extension}`
                    suffix++;
                } else {
                    validName = true;
                }
            }
            const renamedFile = new File([file],newTitle);
            // renamedFile.name = title;
            formData.append('file',renamedFile);

            const config:AxiosRequestConfig = {
                onUploadProgress : (ProgressEvent)=> {
                    let percentageComplete = 0;
                    if(ProgressEvent.total) {
                    percentageComplete =  Math.round((ProgressEvent.loaded *100)/ProgressEvent.total);
                    }
                    setUploadProgress(percentageComplete);
                }
            }

            try {
                await axios.post("/api/video",formData,config)
            } catch(e) {
                setUploadError(e.message);
            } finally {
                setSubmitting(false);
                setUploadProgress(0);
            }

            let res = await trigger({
                data: {
                    title: title,
                    duration: duration,
                    rating: rating,
                    origin_country: country,
                    fileName:newTitle
                }
            });

            if (res) {
                router.push("/");
            }
        }
    }
    function selectFile(ev:any): void {
        if(ev.target.files && ev.target.files.length) {
            setFile(ev.target.files[0]);
        }
    }

    return (
        <Container sx={{ backgroundColor: "#fff" }}>
            <Box sx={{ marginX: "auto" }}>
                <Typography variant='h3' component={'h2'}>Add Movie</Typography>
            </Box>
            <Paper elevation={3}>
                <Stack marginTop={3} gap={3} padding={3}>
                    <TextField value={title} onChange={(ev) => { handleChange(ev, "title") }} label="Movie Title" variant="outlined" />
                    <TextField value={country} onChange={(ev) => { handleChange(ev, "country") }} label="Country of Origin" variant="outlined" />
                    <TextField value={rating} onChange={(ev) => { handleChange(ev, "rating") }} label="MPAA rating" variant="outlined" />
                    <TextField value={duration} onChange={(ev) => { handleChange(ev, "duration") }} type="number" label="Duration (in mins)" variant="outlined" />
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ minWidth:200, mr: 1 }}>
                            <label htmlFor="upload">
                                <Button variant='contained' component="span">
                                <input id="upload" onChange={selectFile} type='file' hidden/>Select Movie File</Button> 
                            </label>
                        </Box>
                        {
                            !submitting && file && <Box sx={{ width: '100%', mr: 1 }}>
                            <p>{`${file.name} - ${file.size} B`}</p>
                        </Box>
                        }
                        {submitting && <><Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{`${Math.round(
                                uploadProgress,
                            )}%`}</Typography>
                        </Box></>}
                        
                        {uploadError && <Box sx={{ width: '100%', mr: 1 }}><p>{uploadError}</p></Box>}
                    </Box>
                    <Button onClick={handleSubmit} variant='outlined'>Submit</Button>
                    <Button onClick={() => {
                        router.push("/");
                    }} color="secondary" variant="outlined">Cancel</Button>
                </Stack>
            </Paper>
        </Container>
    )
}

export default withWunderGraph(AddMovie);