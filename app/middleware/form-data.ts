import { Request  } from 'express'
import multer from 'multer'

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

    public uploadNone () {
        return this.upload.none()
    }
}

export const formData: FormData = new FormData()