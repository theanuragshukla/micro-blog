const main = document.getElementById("blogs")
const searchData={
	dateInp:false,
	authorInp:false,
	date:'10/2022',
	author:'anurag',
	exact:false,
	tags:{}
}
let next=null
let prev = null
let searchActive=false
const blogs = []
let ttlBlogs = 0;
let len = 0
const closeIcon = `

<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
</svg>

`
const searchIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
							<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
						</svg>
`

const blog = ({title, body, author, tags , time, date}) => {
	return `
<div class="blog">
				<div class="brdr brdrtp"></div>
				<div class="brdr brdrbtm"></div>
				<div class="heading">
					<h2># ${title}</h2>
				</div>
				<div class="body">
					<p>
					${body}
					</p>
				</div>
				<div class="footer">
					<div class="flex author">
						<p>
						Published on <span class="date">${date.substring(0,10).replaceAll('-', '/')}</span> at <span class="time">${time}</span> by <span class="name">@${author}</span>
						</p>
					</div>
					<div class="flex tags">
						tags: 
						${tags.map(tag=>{
						return `<span>#${tag}</span>`
						}).join('')}
					</div>
				</div>
			</div>
	`
}
const getBlock = id => {
	return document.getElementById(id)
}
const toggleElem = (id, elem=false) =>{
	!elem ? getBlock(id).classList.toggle('hidden'):null
	searchData[id]=!searchData[id]
	updatePublished()
}
const clearTag = e => {
	delete searchData.tags[e.id]
	e.parentNode.remove()
	updatePublished()
}
const toggleSearch = (e) => {
	getBlock('search').classList.toggle('hidden')
	searchActive=!searchActive
	e.innerHTML=searchActive ? closeIcon : searchIcon
}
const updatePublished = () => {
	if(searchData.dateInp || searchData.authorInp){
		getBlock('publishData').innerHTML=`Published ${searchData.dateInp ? `in <span class="date" id="date">${searchData.date}</span>`:''} ${searchData.authorInp ? `by <span class="name" id="authorName">@${searchData.author}</span>`:''}`
	}else{
		getBlock('publishData').innerHTML=''
	}
	if(Object.keys(searchData.tags).length==0){
		getBlock("tags").classList.add('hidden')

	}else{
		getBlock("tags").classList.remove('hidden')
	}
}
//const data=(i) => {
//return ({	title:"sample data "+i,
	//body:"Elit distinctio doloremque cum vitae nihil Sed pariatur in eveniet quidem vero dolore Dolores voluptatum commodi rerum in esse. Incidunt vitae cupiditate quas expedita molestiae id aspernatur suscipit Facere nisi eveniet et vitae optio? Deserunt laudantium vitae ad sint laboriosam!",
	//author:"anurag",
	//tags:["coding", "hello"]
//})
//}

//const addNew = async (i) => {
	//await fetch('/add-new-post', {
		//method: 'POST',
		//headers: {
			//'Accept': 'application/json, text/plain, */*',
			//'Content-Type': 'application/json'
		//},

		//crossdomain: true,
		//withCredentials:'include',
		//body:JSON.stringify(data(i))
	//})
		//.then(response => response.json())
		//.then(res=>console.log(res))	
//}

const search = async () => {
	const data = JSON.parse(JSON.stringify(searchData))
	data.tags=Object.keys(data.tags)
	await fetch('/search', {
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		},
		crossdomain: true,
		withCredentials:'include',
		body:JSON.stringify({searchData:data })
	})
		.then(response => response.json())
		.then(res=>{
			setPosts(res)
		})	
}
const getBlogs = async (fwd=true) => {
	if(len>=ttlBlogs && ttlBlogs!=0){
	getBlock('nextButton').classList.add('hidden')
	return	
	}
	getBlock('loadMore').classList.toggle('hidden')
	getBlock('spinner').classList.toggle('hidden')
	await fetch('/blogs', {
		method: 'POST',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		},
		crossdomain: true,
		withCredentials:'include',
		body:JSON.stringify({next:(fwd?next:prev), fwd})
	})
		.then(response => response.json())
		.then(res=>{
			if(res.status){
				next=res.next
				getBlock('ttl').innerText=res.ttl
				ttlBlogs=res.ttl
				setPosts(res.items)
			}})	
	getBlock('loadMore').classList.toggle('hidden')
	getBlock('spinner').classList.toggle('hidden')
	
}

const setPosts=(items)=>{
	items.map(item=>{
		main.innerHTML+=blog(item)
		blogs.push(item)
		len++
	})
	getBlock('len').innerText=len
}

onload=()=>{
//	addBlogs(10)
//	for(let i = 0;i<100;i++)addNew(i+1)
	getBlogs(true)
	getBlock("inp").addEventListener('keydown', (e)=>{
		if(e.keyCode == 13) {
			e.preventDefault()
			const tag = e.target.value
			e.target.value=''
			if(tag.length!=0 && tag!="" && tag!=null && tag!=undefined ){
				getBlock('tags').innerHTML+=`<span  class="searchItem">#${tag}<span class="close" onclick="clearTag(this)" id=${tag}>x</span></span>` 
				searchData.tags[tag]=tag
				updatePublished()
			}
		}
	})
	getBlock("authorInp").addEventListener('keydown', (e)=>{
		if(e.keyCode == 13) {
			e.preventDefault()
			const tag = e.target.value
			e.target.value=''
			if(tag.length!=0 && tag!="" && tag!=null && tag!=undefined ){
				searchData.author=tag
				updatePublished()
				getBlock('authorName').innerText=`@${tag}`
			}
		}
	})
	getBlock("dateInp").addEventListener('change', (e)=>{
		e.preventDefault()
		const val = e.target.value.split('-')
		const tag = val[1]+'/'+val[0]
		if(tag.length!=0 && tag!="" && tag!=null && tag!=undefined ){
			searchData.date=tag
			updatePublished()
			getBlock('date').innerText=`${tag}`
		}
	})

	updatePublished()
}
