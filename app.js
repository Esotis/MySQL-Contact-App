var express = require('express')
var app = express()
const expressLayouts = require('express-ejs-layouts')
var mysql = require('mysql')
var methodOverride = require('method-override')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var flash = require('connect-flash')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator')
const qs = require('qs')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// reading .env file in this directory and adding it to the process environment variable
require('dotenv').config({
    debug: true
})

//config of gmail api - google

const CLIENT_ID = '782887643100-tijvq37pcmr4gnou0ldlvfr8isq6fvll.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04TYs-Jtw6IocCgYIARAAGAQSNwF-L9Ir-3GZ48ifj8CS53rQAkia9dXf-K2NUgPe1eyVDzY7brBSgTH68TOFajOflWFh9pcGfpk'

// using oAuth2Client to connect in google developer oAuth for authorization and getting access token

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

//configuration database
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'jovan2004',
    database: 'contact_app',
    insecureAuth: true,
});

//middleware
// allow static file (image)
app.use(express.static('public'))

//use view engine (ejs)
app.set('view engine', 'ejs')

//parsing json for data in req.body
app.use(express.urlencoded({ extended: true }))

//use ejs-layouts
app.use(expressLayouts)

//enable script extraction for ejs layout
app.set("layout extractScripts", true)

//enable override http POST verb with another verb that declared in req.query
app.use(methodOverride('_method'))

//configuration of session, cookie-parser, and flash 
app.use(cookieParser('secret')) //moving cookie in request header to req.Signedcookies if the secret is correct
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}))
app.use(flash())

//parsing req.body to JSON
app.use(bodyParser.json())

//set the query parser to custom query parsing
app.set('query parser', function (str) {
    return qs.parse(str)
})

//checking if the accessToken in signedCookies is valid or invalid token
const isValidToken = async (req, res, next) => {
    const signedCookies = req.signedCookies.accessToken
    if (!signedCookies) {
        req.flash('error', {
            message: 'Please login into your account againt',
            errorClass: 'is-error'
        })
        res.status(401)
        return res.redirect('/login')
    }
    const checkToken = jwt.verify(signedCookies, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            console.log(error)
            req.flash('error', {
                message: 'Please login into your account againt!',
                errorClass: 'is-error'
            })
            res.status(401)
            res.redirect('/login')
        }

        req.user = payload
        next()
    })

}

// checking the registration cookie has exist or not
const isAlreadyRegister = (req, res, next) => {
    const registerCookie = req.signedCookies.registration
    if (!registerCookie) {
        req.flash('sessionEnd', {
            message: 'Your registration session has been ended',
            sessionClass: 'is-error'
        })
        return res.redirect('/register')
    }

    next()
}

// checking the forgotPassword cookie has exist or not
const isAlreadyForgot = (req, res, next) => {
    const forgotCookie = req.signedCookies.forgotPassword
    if (!forgotCookie) {
        req.flash('error', {
            message: 'Please put your email address again',
            errorClass: 'is-invalid'
        })
        console.log(forgotCookie)
        res.status(401)
        return res.redirect('/email')
    }

    const isVerificated = forgotCookie.isVerificated
    req.verification = isVerificated
    req.userEmail = forgotCookie.email
    next()
}


// end of middleware

//route
app.get('/', isValidToken, function (req, res) {
    res.render('home', {
        layout: 'layouts/main-layout',
        activeNav: 'home',
        usernameAccount: req.user.username
    })
})

app.get('/home', isValidToken, function (req, res) {
    res.render('home', {
        layout: 'layouts/main-layout',
        activeNav: 'home',
        usernameAccount: req.user.username
    })
})

//halaman add/create contact
app.get('/contact/add', isValidToken, function (req, res) {
    const error = req.flash('error')
    res.render('add', {
        layout: 'layouts/main-layout',
        error,
        activeNav: 'contact',
        usernameAccount: req.user.username
    })
})

// proses add contact
app.post('/contact/add', [
    isValidToken,
    body('contact_name').isLength({ min: 3 }).withMessage('Contact name must be at least 3 characters!').bail().custom(async (value, { req }) => {

        const sqlQuery = `select * from contact where contact_name = "${value}";`
        const promise = await new Promise((resolve, reject) => {
            pool.query(sqlQuery, (err, result) => {
                resolve(result)
            })
        })
        const result = JSON.parse(JSON.stringify(promise))
        if (result.length > 0) {
            let isDuplicated = ''
            result.forEach(arr => {
                if (arr.contact_name == value) isDuplicated = true
            });
            if (isDuplicated) throw new Error('Contact Name has already been used!')
        }

        return true
    }),

    body('status').notEmpty().withMessage('Fill out the Status!'),
    body('home').notEmpty().withMessage('Fill out the Home!'),
    body('age').notEmpty().withMessage('Fill out the Age!'),
    body('description').notEmpty().withMessage('Fill out the Description!'),
],
    function (req, res) {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            req.flash('error', error.array())
            return res.redirect('/contact/add')
        }
        const accountId = req.user.id
        const sqlQuery = `insert into contact(id_user, contact_name, home, status, description, gender, age) values (${accountId}, ?, ?, ?, ?, ?, ?);`
        pool.query({
            sql: sqlQuery,
            values: [
                req.body.contact_name,
                req.body.home,
                req.body.status,
                req.body.description,
                req.body.gender,
                req.body.age,
            ]
        }, function (error, result, fields) {
            if (error) throw error
            if (!error) {
                const sqlQuery = `insert into history(id_user, action, type) values (?, ?, ?);`
                pool.query({
                    sql: sqlQuery,
                    values: [
                        accountId,
                        `Added a new contact (${req.body.contact_name})`,
                        'add'
                    ]
                }, function (error, result) {
                    if (error) throw error
                    console.log(`Added a new contact (${req.body.contact_name})`)
                })
            }
            req.flash('status', `A new Contact has been created!`)
            req.flash('side-message', 'side')
            req.flash('action', {
                text: `${req.body.contact_name} has been added!`,
                action: 'Create',
                textClass: 'text-primary'
            })
            res.redirect('/contact')
        })

    })

//halaman update contact

app.post('/contact/update', isValidToken, function (req, res) {
    const id = Number(req.body.id)
    const accountId = req.user.id
    console.log(id)
    const sqlQuery = `select * from contact where id_user = ${accountId}`
    pool.query(sqlQuery, async (err, result, field) => {
        if (err) throw err
        const allContact = JSON.parse(JSON.stringify(result))
        const dataContact = allContact.filter((arr) => {
            return arr.no == id
        })

        if (req.body.json) {
            return res.json(dataContact[0])
        }

        res.render('update', {
            layout: 'layouts/main-layout',
            data: dataContact[0],
            contacts: allContact,
            error: req.flash('error'),
            activeNav: 'contact',
            usernameAccount: req.user.username
        })
    })
})

app.get('/contact/update', isValidToken, function (req, res) {
    const accountId = req.user.id
    const sqlQuery = `select * from contact where id_user = ${accountId}`
    const id = req.flash('id')[0]
    console.log(id)

    pool.query(sqlQuery, async (err, result, field) => {
        if (err) throw err
        const allContact = JSON.parse(JSON.stringify(result))
        const dataContact = allContact.filter((arr) => {
            return arr.no == id
        })[0]
        const data = dataContact || {}
        console.log(data)

        res.render('update', {
            layout: 'layouts/main-layout',
            data,
            contacts: allContact,
            error: req.flash('error'),
            activeNav: 'contact',
            usernameAccount: req.user.username
        })
    })
})

//proses update contact

app.put('/update', [
    isValidToken,
    body('id').notEmpty().withMessage('Choose one of the contacts!'),
    body('contact_name').isLength({ min: 3 }).withMessage('Contact name must be at least 3 characters!').bail().custom(async (value, { req }) => {
        if (value != req.body.oldName) {
            const accountId = req.user.id
            const sqlQuery = `select * from contact where contact_name = "${value}" where id_user = ${accountId};`
            const promise = await new Promise((resolve, reject) => {
                pool.query(sqlQuery, (err, result) => {
                    resolve(result)
                })
            })
            const result = JSON.parse(JSON.stringify(promise))
            if (result.length > 0) {
                let isDuplicated = ''
                result.forEach(arr => {
                    if (arr.contact_name == value) isDuplicated = true
                });
                if (isDuplicated) throw new Error('Contact Name has already been used')
            }
        }
        return true
    }),
    body('status').notEmpty().withMessage('Fill out the Status!'),
    body('home').notEmpty().withMessage('Fill out the Home!'),
    body('age').notEmpty().withMessage('Fill out the Age!'),
    body('description').notEmpty().withMessage('Fill out the Description!'),
],
    function (req, res) {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            const errorMessage = error.array()
            req.flash('id', req.body.id)
            req.flash('error', errorMessage)
            return res.redirect('/contact/update')
        }
        console.log(req.body)
        const accountId = req.user.id
        const sqlQuery = `update contact set contact_name = ?, home = ?, status = ?, description = ?, gender = ?, age = ? where no = ?;`
        pool.query({
            sql: sqlQuery,
            values: [
                req.body.contact_name,
                req.body.home,
                req.body.status,
                req.body.description,
                req.body.gender,
                req.body.age,
                req.body.id
            ]
        }, function (error, result, fields) {
            if (error) throw error
            if (!error) {
                const sqlQuery = `insert into history(id_user, action, type) values (?, ?, ?);`
                pool.query({
                    sql: sqlQuery,
                    values: [
                        accountId,
                        `Updated contact on (${req.body.contact_name})`,
                        'update'
                    ]
                }, function (error, result) {
                    if (error) throw error
                    console.log(`Updated contact on (${req.body.contact_name})`)
                })
            }
            req.flash('side-message', 'side')
            req.flash('status', 'Contact successfully been updated')
            req.flash('action', {
                text: `Contact ${req.body.oldName} has been updated!`,
                action: `Update`,
                textClass: 'text-warning'
            })
            res.redirect('/contact')
        })

    })

//modal tampilan detail contact

app.get('/contact/get/:no', isValidToken, function (req, res) {
    const id = Number(req.params.no)

    const sqlQuery = `select c.no, c.contact_name, c.age, c.status, c.gender, c.home, c.description, c.time from contact as c join user on (user.id = c.id_user) where no = ?;`

    pool.query(sqlQuery, [id], async (err, result, field) => {
        if (err) throw err
        const detailContact = JSON.parse(JSON.stringify(result))
        res.json(detailContact)
    })

})


//halaman all contact

app.get('/contact', isValidToken, function (req, res) {
    const accountId = req.user.id
    const sqlQuery = `select user.id,user.username,c.no,c.contact_name,c.home,c.status,c.description from contact as c join user on (user.id = c.id_user) where user.id = ${accountId} order by c.no desc;`

    pool.query(sqlQuery, async (err, result, field) => {
        if (err) throw err
        const allContact = JSON.parse(JSON.stringify(result))
        const actionContact = req.flash('action')[0]
        console.log(actionContact)

        res.render('contact', {
            layout: 'layouts/main-layout',
            allContact,
            status: req.flash('status')[0],
            actionContact,
            side: req.flash('side-message')[0],
            activeNav: 'contact',
            usernameAccount: req.user.username
        })
    })
})

//proses delete contact

app.delete('/contact', isValidToken, function (req, res) {
    const id = Number(req.body.id)
    const deletedContact = req.body.contact_name
    console.log(id)
    const accountId = req.user.id
    const sqlQuery = `delete from contact where no = ${id};`

    pool.query(sqlQuery, (err, result, field) => {
        if (err) throw err
        if (!err) {
            const sqlQuery = `insert into history(id_user, action, type) values (?, ?, ?);`
            pool.query({
                sql: sqlQuery,
                values: [
                    accountId,
                    `Deleted contact on (${req.body.contact_name})`,
                    'delete'
                ]
            }, function (error, result) {
                if (error) throw error
                console.log(`Deleted contact on (${req.body.contact_name})`)
            })
        }
        req.flash('status', 'Contact successfully has been deleted')
        req.flash('action', {
            text: `${deletedContact} has been removed from your contact`,
            action: 'Delete',
            textClass: 'text-danger'
        })
        req.flash('side-message', 'side')
        res.redirect('/contact')
    })
})

//halaman search contact

app.get('/search', isValidToken, function (req, res) {
    const method = req.query.method
    if (method == 'name') {
        return res.render('search', {
            layout: 'layouts/main-layout',
            activeNav: 'contact',
            usernameAccount: req.user.username
        })
    }

    if (method == 'orderby') {
        return res.render('orderContact', {
            layout: 'layouts/main-layout',
            activeNav: 'contact',
            usernameAccount: req.user.username
        })
    }
})

//proses search contact

app.post('/search', isValidToken, function (req, res) {
    const contactName = req.body.contactName
    const accountId = req.user.id
    console.log(contactName)
    const sqlQuery = `select * from contact where match(contact_name) 
    against ('${contactName}*' in boolean mode) and id_user = ${accountId};`

    pool.query({
        sql: sqlQuery
    },
        function (err, result) {
            const searchedContact = JSON.parse(JSON.stringify(result))
            res.json(searchedContact)
        })
})

//proses display contact

app.post('/orderby', isValidToken, function (req, res) {
    const identifierOrder = req.body.orderBy
    const summarize = req.body.summarize || 'ASC'
    const accountId = req.user.id

    let sqlQuery = `select *, substring(contact_name, 1, 1) as firstLetter from contact where id_user = ${accountId} order by ` + pool.escapeId(identifierOrder) + summarize

    pool.query({
        sql: sqlQuery,
    },
        function (err, result) {
            const orderedContact = JSON.parse(JSON.stringify(result))
            res.json(orderedContact)
        })
})

// halaman history

app.get('/history', isValidToken, function (req, res) {
    res.render('history', {
        layout: 'layouts/main-layout',
        activeNav: 'history',
        usernameAccount: req.user.username
    })
})

app.get('/history/specific', isValidToken, function (req, res) {
    res.render('specificHistory', {
        layout: 'layouts/main-layout',
        activeNav: 'history',
        usernameAccount: req.user.username
    })
})

// proses get all history

app.get('/history/get', isValidToken, function (req, res) {
    const accountId = req.user.id
    const sqlQuery = `select *, date_format(time, "%W, %d %M %Y (%T)") as fulldate from history where id_user = ${accountId} order by time desc;`

    pool.query({
        sql: sqlQuery
    },
        function (error, result) {
            const data = JSON.parse(JSON.stringify(result))
            res.json(data)
        })
})

// proses get history sesuai order time

app.post('/history/getByOrder', isValidToken, function (req, res) {
    let order = ''
    switch (req.query.time) {
        case 'today':
            order = `curdate() = result.tanggal`
            break;

        case 'yesterday':
            order = `date_sub(curdate(), interval 1 day) = result.tanggal`
            break;

        case 'last week':
            order = `result.week = weekofyear(curdate()) - 1 and result.year = year(curdate())`
            break;

        case 'last month':
            order = 'result.month = month(curdate()) - 1 and result.year = year(curdate())'
            break;

        case 'last year':
            order = 'result.year = year(curdate()) - 1'
            break;

        default:
            order = `result.tanggal = "${req.query.time}"`
            break;
    }
    const accountId = req.user.id
    const sqlQuery = `select * from (select *, date(time) as tanggal, date_format(time, "%W, %d %M %Y (%T)") as fulldate, weekofyear(time) as week, month(time) as month, year(time) as year from history) as result where ${order} and id_user = ${accountId} order by result.time desc;`
    pool.query({
        sql: sqlQuery
    },
        function (err, result) {
            const data = JSON.parse(JSON.stringify(result))
            res.json(data)
        })
})

// halaman login page user

app.get('/login', function (req, res) {
    res.render('login', {
        layout: 'layouts/login-layout',
        css: 'login',
        error: req.flash('error')[0]
    })
})

// halaman register page user
app.get('/register', function (req, res) {
    res.render('register', {
        layout: 'layouts/login-layout',
        css: 'register',
        error: req.flash('error')[0],
        sessionEnd: req.flash('sessionEnd')[0]
    })
})

// halaman verification code

app.get('/verification', isAlreadyRegister, function (req, res) {
    res.render('verification', {
        layout: 'layouts/login-layout',
        css: 'verification',
        email: req.signedCookies.registration.email
    })
})

// halaman email forgot password
app.get('/email', function (req, res) {
    res.render('email', {
        layout: 'layouts/login-layout',
        css: 'email',
        error: req.flash('error')[0]
    })
})

// halaman forgot password
app.get('/forgotPassword', isAlreadyForgot, function (req, res) {
    res.render('forgotPassword', {
        layout: 'layouts/login-layout',
        css: 'forgotPassword',
        email: req.signedCookies.forgotPassword.email,
        error: req.flash('error')[0]
    })
})

// halaman change Password
app.get('/changePassword', isAlreadyForgot, function (req, res) {
    const isUserVerificated = req.verification
    if (!isUserVerificated) {
        req.flash('error', {
            message: 'Please enter the verification code!',
            errorClass: 'is-error'
        })
        return res.redirect('/forgotPassword')
    }

    res.render('changePassword', {
        layout: 'layouts/login-layout',
        css: 'changePassword'
    })
})

//proses login dan cek email dan password

app.post('/login/signin', async function (req, res) {
    const userInput = req.body
    const sqlQuery = `select * from user where email = ? `

    const findUser = await new Promise((resolve, reject) => {
        pool.query({
            sql: sqlQuery,
            values: userInput.email
        },
            function (error, result, field) {
                if (error) throw error
                const data = JSON.parse(JSON.stringify(result))
                resolve(data[0])
            })
    })

    if (!findUser) {
        req.flash('error', {
            message: 'Email address not found!',
            errorClass: 'is-error'
        })
        return res.redirect('/login')
    }

    const resultCompare = await bcrypt.compare(userInput.password, findUser.password)

    if (!resultCompare) {
        req.flash('error', {
            message: 'Password does not match!',
            errorClass: 'is-error'
        })
        return res.redirect('/login')
    }

    const userCookie = {
        username: findUser.username,
        email: findUser.email,
        id: findUser.id
    }
    const accessToken = jwt.sign(userCookie, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '50m' })

    console.log('Berhasil Login!')
    res.cookie('accessToken', accessToken, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        signed: true
    })

    res.redirect('/contact')
})

// proses register dan pengecekan

app.post('/register/signup', async function (req, res) {
    const username = req.body.username
    const email = req.body.email
    const sqlUsername = `select username, email from user where username = ? or email = ?;`

    const getDuplicate = await new Promise((resolve, reject) => {
        pool.query({
            sql: sqlUsername,
            values: [
                username,
                email
            ]
        }, (error, result, field) => {
            if (error) throw error
            const toJSON = JSON.parse(JSON.stringify(result))
            resolve(toJSON)
        })
    })

    const isUsernameTaken = getDuplicate.some((arr) => {
        if (username === arr.username) return true
        return false
    })

    const isRegisteredEmail = getDuplicate.some((arr) => {
        if (email === arr.email) return true
        return false
    })

    if (isUsernameTaken) {
        req.flash('error', {
            invalid: 'is-invalid',
            duplicateUsername: username,
            field: 'username',
            input: req.body
        })
        return res.redirect('/register')
    }

    else if (isRegisteredEmail) {
        req.flash('error', {
            invalid: 'is-invalid',
            message: 'Email address has been used!',
            field: 'email',
            input: req.body
        })
        return res.redirect('/register')
    }

    const accessToken = await oAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
        service: 'gmail',
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            type: 'OAuth2',
            user: 'jovananggata15@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken
        }
    })

    const registrationCode = crypto.randomBytes(8).toString('base64')
    const mailOptions = {
        from: 'SQLCONTACTAPP 💌 <jovananggata15@gmail.com>',
        to: 'jovananggata1@gmail.com',
        subject: 'This is your registration code',
        text: `Your registration code is ${registrationCode}`,
        html: `<p>Your registration code is <strong>${registrationCode}</strong></p>`
    }

    const sendMail = await transport.sendMail(mailOptions)
    console.log(sendMail)

    req.body.phoneNumber = "+62" + req.body.phoneNumber
    res.cookie('registration', req.body, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        signed: true,
        maxAge: 600000
    })
    res.redirect('/verification')

})

//proses verification code
app.post('/verification', isAlreadyRegister, async function (req, res) {
    const saltRounds = 10
    const registration = req.signedCookies.registration
    const sqlQuery = `insert into user(username, age, email, password, phone) values(?, ?, ?, ?, ?);`
    const hashedPassword = await bcrypt.hash(registration.password, saltRounds)

    pool.query({
        sql: sqlQuery,
        values: [
            registration.username,
            registration.age,
            registration.email,
            hashedPassword,
            registration.phoneNumber
        ]
    }, (error, result, field) => {
        if (error) throw error
        console.log('Berhasil Register!')
        res.clearCookie('registration')
        res.redirect('/login')
    })
})

// proses log out account dan hapus cookie
app.get('/logout', function (req, res) {
    res.clearCookie('accessToken')
    res.redirect('/login')
})

// proses mengirimkan kode OTP ke email forgot password user
app.post('/sendCode', async function (req, res) {
    const userEmail = req.body.email
    const sqlQuery = `select * from user where email = "${userEmail}";`

    const isExistEmail = await new Promise((resolve, reject) => {
        pool.query({
            sql: sqlQuery
        }, function (error, result, field) {
            if (error) throw error
            const data = JSON.parse(JSON.stringify(result))
            resolve(data[0])
        })
    })

    if (!isExistEmail) {
        req.flash('error', {
            message: 'Email account does not exist!',
            errorClass: 'is-invalid'
        })
        return res.redirect('/email')
    }

    res.cookie('forgotPassword', {
        email: userEmail,
        isVerificated: false
    }, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        signed: true,
        maxAge: 600000
    })

    const accessToken = await oAuth2Client.getAccessToken()
    const transport = nodemailer.createTransport({
        service: 'gmail',
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            type: 'OAuth2',
            user: 'jovananggata15@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken
        }
    })

    const registrationCode = crypto.randomBytes(8).toString('base64')
    const mailOptions = {
        from: 'SQLCONTACTAPP 💌 <jovananggata15@gmail.com>',
        to: 'jovananggata1@gmail.com',
        subject: 'This is your registration code',
        text: `Your registration code is ${registrationCode}`,
        html: `<p>Your registration code is <strong>${registrationCode}</strong></p>`
    }

    const sendMail = await transport.sendMail(mailOptions)
    console.log(sendMail)
    res.redirect('/forgotPassword')
})

//proses pengecekan code forgotPassword
app.post('/verificationPassword', function (req, res) {
    const userEmail = req.signedCookies.forgotPassword.email
    res.cookie('forgotPassword', {
        email: userEmail,
        isVerificated: true
    }, {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        signed: true,
        maxAge: 600000
    })
    res.redirect('/changePassword')
})

// proses penggantian password akun user
app.post('/changePassword', isAlreadyForgot, async function (req, res) {
    const isUserVerificated = req.verification
    if (!isUserVerificated) {
        req.flash('error', {
            message: 'Please enter the verification code!',
            errorClass: 'is-error'
        })
        return res.redirect('/forgotPassword')
    }

    const sqlQuery = `update user set password = ? where email = ?;`
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)

    pool.query({
        sql: sqlQuery,
        values: [
            hashedPassword,
            req.userEmail
        ]
    }, (error, result, field) => {
        if (error) throw error
        res.clearCookie('forgotPassword')
        return res.redirect('/login')
    })
})

app.use(function (err, req, res, next) {
    console.log(err.stack)
    res.status(404).send('Something wrong!')
})

app.listen(8080, () => {
    console.log('SQL Contact App listening on http://localhost:8080')
})