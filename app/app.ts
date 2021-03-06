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
            res.header(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization'
            )

            if (req.method === 'OPTIONS') {
                res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
                return res.status(200).json({})
            }

            next();
        })

        //consoles route used
        this.app.use(morgan('dev'))

        // support application/json type post data
        this.app.use(bodyParser.json())

        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }))
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

        /* 
            useFindAndModify': true by default. Set to false to make findOneAndUpdate()
            and findOneAndRemove() use native findOneAndUpdate() rather than findAndModify().
        */
        mongoose.set('useFindAndModify', false);
    }
}

export default new App().app;