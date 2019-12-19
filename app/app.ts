import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import morgan from 'morgan'

import { Routes } from './routes'

class App {
    public app : express.Application
    public routePrv : Routes = new Routes()

    constructor () {
        this.app = express()
        this.config()
        this.routePrv.routes(this.app)
        this.mongoSetup()
    }

    private config () : void {
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*')
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

            next();
        })

        //consoles route used
        this.app.use(morgan('dev'))

        // support application/json type post data
        this.app.use(bodyParser.json())

        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }))

        // //if received route is not found
        // this.app.use((req, res, next) => {
        //     const error = new Error('Route Not Found')

        //     error.status = 404

        //     next(error)
        // })

        // //handling error
        // this.app.use((error : Error, req, res, next) => {
        //     res.status(error.status || 500)
        //     res.json({
        //         error: {
        //             message: error.message
        //         }
        //     })
        // })
    }

    private mongoSetup () : void {
        const uri = process.env.MONGO_DB_URI as string

        const options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        }

        mongoose.connect(uri, options)
            .then(() => console.log('Connected To MongoDB'))
            .catch((err) => console.error(err))
    }
}

export default new App().app;