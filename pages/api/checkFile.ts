import { NextApiRequest, NextApiResponse } from "next";
import fs from 'fs';

export default function handler(req:NextApiRequest,res:NextApiResponse) {
    if(req.method === "GET") {
        fs.access(`./videos/${req.query.fileName}`,(err)=> {
            if(err) {
                res.json({exists:false});
            } else {
                res.json({exists:true});
            }
        })
    }
}