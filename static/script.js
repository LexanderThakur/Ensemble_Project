const apiBase="/"


function convertTreeToD3Format(node) {
  if (node.is_leaf) return node;

  return {
    ...node,
    children: [convertTreeToD3Format(node.left), convertTreeToD3Format(node.right)]
  };
}



function drawD3Tree(treeData) {
  document.getElementById("tree-svg").innerHTML = ""; // clear previous

  const svg = d3.select("#tree-svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

  const g = svg.append("g").attr("transform", "translate(50,50)");

  const formattedTree = convertTreeToD3Format(treeData);
  const root = d3.hierarchy(formattedTree);


  const treeLayout = d3.tree().size([width - 100, height - 100]);
  treeLayout(root);

  // Draw links
  g.selectAll(".link")
    .data(root.links())
    .enter().append("line")
    .attr("class", "link")
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)
    .attr("stroke", "#999");

  // Draw nodes
  const node = g.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", 25)
    .attr("fill", d => d.data.is_leaf ? "#90ee90" : "#add8e6")
    .attr("stroke", "#333");

  node.append("text")
    .attr("dy", 4)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .text(d => d.data.is_leaf
      ? `Leaf\n${d.data.value.toFixed(2)}`
      : `F${d.data.feature} ≤ ${d.data.threshold.toFixed(1)}`);
}




async function RegGen(event){
   event.preventDefault();
   const n_samples=document.getElementById("samples-slider").value
   const max_depth=document.getElementById("depth-slider").value


   try{


    const response= await fetch(apiBase+'RegTree',{
        method :"POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify({
            n_samples:n_samples,
            max_depth:max_depth,
            tree_type:1



        })


    })

    const tree= await response.json()

    drawD3Tree(tree)


    console.log(tree)





   }
   catch(err){
    console.log("Error fetching data:", err.message);
   }



}