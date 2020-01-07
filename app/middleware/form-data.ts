import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import path from 'path'
import Datauri from 'datauri'
import { v2 as cloudinary }  from 'cloudinary'

interface FileImage {
    originalname: string,
    buffer: Buffer
}

const storage = multer.memoryStorage()

const fileFilter = (req: Request, file: Express.Multer.File, cb: CallableFunction) => {
    let allowedMimeType = ['image/webp', 'image/jpeg', 'image/png']

    if (allowedMimeType.indexOf(file.mimetype) > -1) {
        cb(null, true)
    } else {
        return cb(new Error('Only ' + allowedMimeType.join(", ") + ' files are allowed!'));
    }
}

const multerOptions: multer.Options = {
    storage: storage,

    limits: {
        fileSize: 1024 * 1024 * 5
    },

    fileFilter: fileFilter
}

const upload = multer(multerOptions)

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

class FormData {
    public uploadNone () {
        return upload.none()
    }

    public multerUploadFields() {
        return upload.fields([{ name: 'images', maxCount: 6 }])
    }

    public async cloudinaryMultipleUpload(req: any, res: Response, next: NextFunction) {
        const dataUri = new Datauri()

        const uploadPromises = req.files.images.map((image: FileImage) => {
            const fileExtension = path.extname(image.originalname).toString()
            const imageBuffer = image.buffer
            const fileToUpload = dataUri.format(fileExtension, imageBuffer).content

            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    fileToUpload,
                    { public_id: `user/${req.userData._id}/${Date.now()}` },
                    (error, result) => {
                        if (!!error) reject(error)
                        else resolve(result)
                    }
                )
            })
        })

        try {
            const uploadedImages: any = await Promise.all(uploadPromises)

            req.body.imgFileObj = []

            Object.keys(uploadedImages).forEach((key) => {
                req.body.imgFileObj.push({
                    publicId: uploadedImages[parseInt(key)].public_id,
                    url: uploadedImages[parseInt(key)].secure_url
                })
            })
            
            next()
        } catch (error) {
            return res.status(500).json({
                error: error
            })
        }
    }

    public async cloudinaryRemoveImage(req: any, res: Response, next: NextFunction) {
        const imageIdToBeRemoved = req.body.imageIdToBeRemoved
        
        const deletionPromise = imageIdToBeRemoved.map((id: string) => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(
                    id,
                    (error, result) => {
                        if (!!error) reject(error)
                        else resolve(result)
                    }
                )
            })
        })

        try {
            const result = await Promise.all(deletionPromise)
            
            res.status(200).send({
                message: res.locals.response
            })
        } catch (error) {
            res.status(400).send(error)
        }
    }
}

export const formData: FormData = new FormData()