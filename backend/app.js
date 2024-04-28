const express = require("express")
const route_auth = require("./routes/route_auth")
const route_users = require("./routes/usersRoute")
const route_posts = require("./routes/postsRoute")
const route_comment = require("./routes/commentRoute")
const route_category = require("./routes/categoryRoute")
const route_password = require("./routes/passwordRoute")
const cors = require("cors")
const xss = require("xss-clean")
const ratelimiting = require("express-rate-limit")
const helmet = require("helmet")
const connect_to_db = require("./config/connectToDB")
const { errorHandler, notFound } = require("./middleware/error")
const hpp = require("hpp")
 require("dotenv").config()
// connection database
connect_to_db()
// init app 
const app = express();
app.use (express.json())
// security headers
app.use(helmet())
// prevent http param pollution
app.use(hpp())

// prevent xss(cross site scripting) attacks
app.use(xss());
// rate limiting : ne peut pas envoyer plus que 200 request on 10min
app.use(ratelimiting({
    windowMs : 10 * 60 * 1000 ,
    max : 200
}))
// cors policy 
app.use(cors(
    {
        origin:"http://localhost:3000"
    }
))
app.use("/api/auth",route_auth)
app.use("/api/users",route_users)
app.use("/api/posts",route_posts)
app.use("/api/comments",route_comment)
app.use("/api/categories",route_category)
app.use("/api/password",route_password)


app.use(notFound)
app.use(errorHandler)







const port = process.env.PORT || 8000
app.listen(port , ()=>{
    console.log(`server is running in${process.env.NODE_ENV } mode in port ${port}` )
})