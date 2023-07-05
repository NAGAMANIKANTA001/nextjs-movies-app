import { NextApiRequest, NextApiResponse } from "next";
import busboy from 'busboy';
import fs from 'fs';

export const config = {
    api:{
        bodyParser:false
    }
}

function uploadVideoStream(req:NextApiRequest,res:NextApiResponse) {
    const bb = busboy({headers:req.headers})

    bb.on('file',(_,file,info)=> {
        const fileName = info.filename;
        const filePath = `./videos/${fileName}`;
        const stream = fs.createWriteStream(filePath);

        file.pipe(stream);
    });
    bb.on('close',()=>{
        res.writeHead(200,{Connection:"close"});
        res.end("That's end");
    })
    req.pipe(bb);
    return;
}

function getVideoStream(req:NextApiRequest,res:NextApiResponse) {
    const CHUNK_SIZE_IN_BYTES = 1000000; //1mb
    const range = req.headers.range;
    if(!range) {
        return res.status(400).send("Range must be provided");
    }
    const videoName = req.query.videoName
    const videoPath = `./videos/${videoName}`;
    
    // Check File Existence

    const videoSizeInBytes = fs.statSync(videoPath).size;
    const chunkStart = Number(range.replace(/\D/g,""));
    const chunkEnd = Math.min(chunkStart+CHUNK_SIZE_IN_BYTES,videoSizeInBytes-1);

    const contentLength = chunkEnd - chunkStart + 1;
    const headers = {
        'Content-Range' : `bytes ${chunkStart}-${chunkEnd}/${videoSizeInBytes}`,
        'Accept-Ranges':'bytes',
        'Content-Length':contentLength,
        'Content-Type':"video/mp4"
    }

    res.writeHead(206,headers);
    const videoStream = fs.createReadStream(videoPath,{
        start:chunkStart,
        end:chunkEnd 
    })
    videoStream.pipe(res);
}

export default function handler(req:NextApiRequest,res:NextApiResponse) {
    if(req.method === "GET") {
        return getVideoStream(req,res);
    }
    if(req.method === "POST") {
        return uploadVideoStream(req,res);
    }
}