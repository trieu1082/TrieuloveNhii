const express = require("express")
const fs = require("fs")
const multer = require("multer")
const bodyParser = require("body-parser")

const app = express()

app.use(bodyParser.json())
app.use(express.static("public"))

const upload = multer({ dest: "uploads/" })

function read(file){
 return JSON.parse(fs.readFileSync(file))
}

function write(file,data){
 fs.writeFileSync(file,JSON.stringify(data,null,2))
}

function genCode(){

const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"

let code="Nhi"

for(let i=0;i<12;i++){

code+=chars[Math.floor(Math.random()*chars.length)]

}

return code
}

app.post("/api/register",(req,res)=>{

let users=read("./db/users.json")

users.push({
 username:req.body.username,
 password:req.body.password,
 money:0,
 role:"user"
})

write("./db/users.json",users)

res.send("ok")

})

app.post("/api/login",(req,res)=>{

let users=read("./db/users.json")

let user=users.find(x=>x.username==req.body.username && x.password==req.body.password)

if(!user) return res.send("fail")

res.json(user)

})

app.post("/api/create-tab",(req,res)=>{

let tabs=read("./db/tabs.json")

tabs.push({
 id:Date.now(),
 name:req.body.name
})

write("./db/tabs.json",tabs)

res.send("ok")

})

app.post("/api/create-item",upload.single("image"),(req,res)=>{

let items=read("./db/items.json")

items.push({
 id:Date.now(),
 tab:req.body.tab,
 name:req.body.name,
 price:req.body.price,
 image:req.file.filename,
 info:req.body.info
})

write("./db/items.json",items)

res.send("ok")

})

app.post("/api/create-code",(req,res)=>{

let codes=read("./db/codes.json")

let code=genCode()

codes.push({
 code:code,
 value:req.body.value,
 used:false
})

write("./db/codes.json",codes)

res.json({code})

})

app.post("/api/redeem",(req,res)=>{

let codes=read("./db/codes.json")
let users=read("./db/users.json")

let c=codes.find(x=>x.code==req.body.code)

if(!c) return res.send("invalid")

if(c.used) return res.send("used")

let user=users.find(x=>x.username==req.body.username)

user.money+=c.value

c.used=true

write("./db/users.json",users)
write("./db/codes.json",codes)

res.send("success")

})

app.post("/api/import-codes",upload.single("file"),(req,res)=>{

let data=fs.readFileSync(req.file.path,"utf8")

let lines=data.split("\n")

let codes=read("./db/codes.json")

lines.forEach(x=>{

codes.push({
 code:"Nhi"+x.trim(),
 value:10000,
 used:false
})

})

write("./db/codes.json",codes)

res.send("imported")

})

app.get("/api/codes",(req,res)=>{

res.json(read("./db/codes.json"))

})

app.get("/api/export",(req,res)=>{

res.download("./db/codes.json")

})

app.listen(3000,()=>{

console.log("Server running")

})
