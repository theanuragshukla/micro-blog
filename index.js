require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').Server(app)
const port = process.env.PORT || 3000
var escapeForMongo = require('mongo-escape').escape;
const url = process.env.DATABASE_URL
const {MongoClient, ObjectId} = require('mongodb')

app.use(express.json())
app.use(express.urlencoded({
	extended:true
}))
app.use('/static', express.static(__dirname+'/static'))

app.get('/', (req,res)=>{
	res.sendFile(__dirname+'/index.html')
})

app.post('/search',async (req, res)=>{
	const {searchData} = req.body
	const data = await search(searchData)
	res.json(data)
})

app.post('/blogs', async (req, res)=>{
	const {next, fwd}=req.body
	const {items, next:cursor, ttl, len} = await getPosts({next, fwd})
	if(len!=0){
		res.json({status:true, items,next:cursor, ttl })
		return
	}
	res.json({status:false, items,next:cursor, ttl })

})
app.post('/add-new-post',async (req, res)=>{
	const {title, body, author, tags } = req.body
	const obj = {
		title:title,
		body:body,
		author:author,
		tags:tags,
		month:getMonth(),
		date:new Date(),
		time:getTime(), 
	}
	let client, db;
	try{
		client =await MongoClient.connect(url, {useNewUrlParser: true});
		db = client.db("mydb");
		let dCollection = db.collection('blogs');
		await dCollection.insertOne(obj)
			.then(data=>{
				res.json({status:true, msg:"inserted"})
			})
			.catch(err=>{
				throw err
			})
	}
	catch(err){ console.error(err); }
	finally{ client.close(); } 
})
/*
 *
 *async function getAll(){
 *    let client, db;
 *    try{
 *        client =await MongoClient.connect(url, {useNewUrlParser: true});
 *        db = client.db("mydb");
 *        let dCollection = db.collection('blogs');
 *        await dCollection.find({}).toArray()
 *            .then(data=>{
 *                console.log(data)
 *            })
 *            .catch(err=>{
 *                throw err
 *            })
 *    }
 *    catch(err){ console.error(err); }
 *    finally{ client.close(); } 
 *}
 *
 */
async function getPosts({next, fwd}){
	let client, db
	let first=false
	if(next==null){
		first=true
	}
	try{
		client =await MongoClient.connect(url, {useNewUrlParser: true})
		db = client.db("mydb")
		let dCollection = db.collection('blogs')
		const ttl = await dCollection.countDocuments()
		let items, nextCursor
		if(first){
			items = await dCollection.find({}).sort({
				_id: -1
			}).limit(20).toArray()
		}else{
			let query = {}
			let key=(fwd ? "$lt" : "$gte")
			query[key]=new ObjectId(next)
			console.log(query)
			items = await dCollection.find({
				_id: query
			}).sort({
				_id: -1
			}).limit(20).toArray();

		}
		const len = items.length
		if(len==0){
			return ({items:[],next, ttl , len})
		}
		nextCursor =items.length!=0? items[items.length - 1]._id:null
		return {items, next:nextCursor, ttl, len}
	}
	catch(err){ 
		console.log(err)
	}
	finally{ 
		client.close()
	}
}

async function search(item){
	const {dateInp, authorInp, date, author,exact, tags } = item
	let query = {}
	if(dateInp){
		query.month=date
	}
	if(authorInp){
		query.author=author
	}
	if(tags.length!=0)
		query.tags=exact ? {$all:tags} : {$in:tags}
	query=escapeForMongo(query)
	let client, db
	try{
		client =await MongoClient.connect(url, {useNewUrlParser: true})
		db = client.db("mydb")
		let dCollection = db.collection('blogs')
		const data = await dCollection.find(query).toArray()
		return data
	}
	catch(err){ 
		console.log(err)
	}
	finally{ 
		client.close()
	} 
}

http.listen(port, () => {
	console.log(`listening on ${port}`)
})

//utils

function getTime() {
	var now = new Date();
	return (now.getHours() + ':' +
		((now.getMinutes() < 10)
			? ("0" + now.getMinutes())
			: (now.getMinutes())) + ':' +
		((now.getSeconds() < 10)
			? ("0" + now.getSeconds())
			: (now.getSeconds())));
}


function getMonth() {
	var now = new Date();
	return (now.getMonth()+1) + '/' +now.getFullYear();
}
