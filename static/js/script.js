const main = document.getElementById("main")
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
						<span>#hello</span>
						<span>#anurag</span>
						<span>#shukla</span>
						<span>#world</span>
						<span>#latest</span>
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
const addBlogs = (n) =>{
	for(let i=0;i<n;i++)
		main.innerHTML+=blog()
}
onload=addBlogs(10)
