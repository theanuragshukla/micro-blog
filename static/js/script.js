const main = document.getElementById("main")
const searchData={
	dateInp:false,
	authorInp:false,
	date:'10/2022',
	author:'anurag',
	tags:{}
}
let searchActive=false
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

const blog = () => {
	return `
<div class="blog">
				<div class="brdr brdrtp"></div>
				<div class="brdr brdrbtm"></div>
				<div class="heading">
					<h2># hello</h2>
				</div>
				<div class="body">
					<p>
					Lorem voluptatibus incidunt deleniti soluta ipsa, possimus Autem vitae maiores ab consequuntur at In aliquid animi ipsa rerum est Voluptatibus ipsa ea culpa blanditiis dolorem Necessitatibus eligendi ea nemo in
					</p>
				</div>
				<div class="footer">
					<div class="flex author">
						<p>
						Published on <span class="date">02/10/2022</span> at <span class="time">17:33 pm</span> by <span class="name">@anurag</span>
						</p>
					</div>
					<div class="flex tags">
						tags: 
						<span>#hello</span>
						<span>#anurag</span>
						<span>#shukla</span>
						<span>#world</span>
						<span>#latest</span>
					</div>
				</div>
			</div>
	`
}
const addBlogs = n =>{
	for(let i=0;i<n;i++)
		main.innerHTML+=blog()
}
const getBlock = id => {
	return document.getElementById(id)
}
const toggleElem = id =>{
	getBlock(id).classList.toggle('hidden')
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

onload=()=>{
	addBlogs(10)
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
