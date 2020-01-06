import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import Datauri from 'datauri'
import { v2 as cloudinary }  from 'cloudinary'

interface FileImage {
    originalname: string,
    buffer: Buffer
}

class FormData {
    private storage = multer.memoryStorage()

    private fileFilter = (req: Request, file: Express.Multer.File, cb: CallableFunction) => {
        let allowedMimeType = ['image/webp', 'image/jpeg', 'image/png']

        if (allowedMimeType.indexOf(file.mimetype) > -1) {
            cb(null, true)
        } else {
            return cb(new Error('Only ' + allowedMimeType.join(", ") + ' files are allowed!'));
        }
    }

    private multerOptions: multer.Options = {
        storage: this.storage,

        limits: {
            fileSize: 1024 * 1024 * 5
        },

        fileFilter: this.fileFilter
    }

    private upload = multer(this.multerOptions)

    private dataUri = new Datauri()

    constructor () {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    public uploadNone () {
        return this.upload.none()
    }

    public multerUploadFields() {
        return this.upload.fields([{ name: 'images', maxCount: 6 }])
    }

    public cloudinaryMultipleUpload(req: any, res: Response, next: NextFunction) {
        const dataUri = new Datauri()
        console.log(this.upload)
        return res.send({})

        // const uploadPromises = req.files.images.map((image: FileImage) => {
        //     const fileExtension = path.extname(image.originalname).toString()
        //     const imageBuffer = image.buffer
        //     const fileToUpload = this.dataUri.format(fileExtension, imageBuffer).content

        //     return new Promise((resolve, reject) => {
        //         cloudinary.uploader.upload(
        //             fileToUpload,
        //             { public_id: `brawlr/user/${Date.now()}` },
        //             (error, result) => {
        //                 if (error) reject(error)
        //                 else resolve(result)
        //             }
        //         )
        //     })
        // })

        // try {
        //     const uploadResults = await Promise.all(uploadPromises)

        //     uploadResults.forEach((item: any) => {
        //         req.body.imgFileObj.push({
        //             publicId: item.public_id,
        //             url: item.secure_url
        //         })
        //     })
            
        //     next()
        // } catch (error) {
        //     return res.status(500).json({
        //         error: error
        //     })
        // }
    }
}

export const formData: FormData = new FormData()