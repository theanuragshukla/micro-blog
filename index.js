require('dotenv').config()
const express = require('express')
const app = express()
const http = require('http').Server(app)
const port = process.env.PORT || 3000
var escapeForMongo = require('mongo-escape').escape;
const url = process.env.DATABASE_URL
const {MongoClient, ObjectId, pretty} = require('mongodb')
app.use(express.json())
app.use(express.urlencoded({
	extended:true
}))
app.use('/static', express.static(__dirname+'/static'))

app.get('/', (req,res)=>{
	res.sendFile(__dirname+'/index.html')
})

app.post('/search',async (req, res)=>{
	const {searchData, next} = req.body
	const data = await getPosts({item:searchData,next, search:true })
	console.log(data)
	if(data.len!=0){
		res.json({status:true, ...data })
		return
	}
	res.json({status:false, ...data })
})
app.post('/blogs', async (req, res)=>{
	const {next, fwd}=req.body
	console.log(next)
	const {items, next:cursor, ttl, len} = await getPosts({next, fwd})
	console.log(items)
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
			//let obj = {}
	catch(err){ console.error(err); }
	finally{ client.close(); } 
})

async function getPosts({next=null, fwd=true, search=false, item={}}){
	let client, db
	let query={}
	let page1=(next===null)
	if(!search){
		if(!page1){
			let obj = {}
			let key=(fwd ? "$lt" : "$gte")
			obj._id={}
			obj._id[key]=ObjectId(next)
			query=obj
		}
	}else{
		query["$and"]=[]
		const {dateInp, authorInp, date, author,exact, tags } = item
		if(dateInp){
			let obj = {}
			obj.month=date
			query["$and"].push(obj)
		}
		if(authorInp){
			let obj = {}
			obj.author=author
			query["$and"].push(obj)
		}
		if(tags.length!=0){
			let obj = {}
			obj.tags=exact ? {$all:tags} : {$in:tags}
			query["$and"].push(obj)
		}
		if(!page1){
			let obj = {}
			let key=(fwd ? "$lt" : "$gte")
			obj._id={}
			obj._id[key]=ObjectId(next)
			query["$and"].push(obj)
		}
	}
	//query=escapeForMongo(query)
	try{
		console.log(JSON.stringify(query, null, 4))
		client =await MongoClient.connect(url, {useNewUrlParser: true})
		db = client.db("mydb")
		let dCollection = db.collection('blogs')
		const ttl = await dCollection.countDocuments()
		let items, nextCursor
		items = await dCollection.find({
			...query
		}).sort({
			_id: -1
		}).limit(20).toArray();
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


/*
 *async function search(item){
 *    const {dateInp, authorInp, date, author,exact, tags } = item
 *    let query = {}
 *    if(dateInp){
 *        query.month=date
 *    }
 *    if(authorInp){
 *        query.author=author
 *    }
 *    if(tags.length!=0)
 *        query.tags=exact ? {$all:tags} : {$in:tags}
 *    query=escapeForMongo(query)
 *    let client, db
 *    try{
 *        client =await MongoClient.connect(url, {useNewUrlParser: true})
 *        db = client.db("mydb")
 *        let dCollection = db.collection('blogs')
 *        const data = await dCollection.find(query).toArray()
 *        return data
 *    }
 *    catch(err){ 
 *        console.log(err)
 *    }
 *    finally{ 
 *        client.close()
 *    } 
 *}
 *
 */
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
